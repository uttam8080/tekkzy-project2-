const jwt = require("jsonwebtoken");
const dynamoService = require("../utils/dynamoService");
const bcrypt = require("bcryptjs");

// Helper function to generate JWT token
const getSignedJwtToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    let { firstName, lastName, email, password, phone } = req.body;

    if (email) email = email.toLowerCase().trim();

    if (!firstName || !email || !password || !phone) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide all required fields: firstName, lastName, email, password, phone",
      );
    }

    // Validate password length
    if (password.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password must be at least 6 characters long",
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide a valid email address",
      );
    }

    console.log(`📝 Registration attempt for: ${email}`);

    // Hash password before saving to DynamoDB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(`🔐 Password hashed successfully for: ${email}`);

    // Check if user already exists
    const existingUser = await dynamoService.findUserByEmail(email);

    if (existingUser) {
      console.log(`⚠️  User already exists: ${email}`);
      console.log(`🔄 Attempting auto-login with provided password...`);

      let isPasswordMatch = false;
      try {
        isPasswordMatch = await bcrypt.compare(password, existingUser.password);
      } catch (err) {
        isPasswordMatch = false;
      }

      // Fallback if not matched by bcrypt (e.g. if stored as plain text)
      if (!isPasswordMatch) {
        isPasswordMatch = (password === existingUser.password);
      }

      if (isPasswordMatch) {
        console.log(`✅ Password matches! Auto-logging in user: ${email}`);

        // Generate Token
        const token = getSignedJwtToken(existingUser.email);

        return sendResponse(
          res,
          200,
          true,
          "User logged in successfully! Welcome back.",
          {
            user: {
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
              email: existingUser.email,
              phone: existingUser.phone,
              role: existingUser.role,
            },
            token,
            verified: true,
            isExistingUser: true,
          },
        );
      } else {
        console.log(`❌ Password mismatch for existing user: ${email}`);
        return sendResponse(
          res,
          401,
          false,
          "This email is already registered with a different password. Please use your original password or reset it.",
        );
      }
    }

    // New user - create account
    const newUser = await dynamoService.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: "customer",
    });

    // Generate Token
    const token = getSignedJwtToken(newUser.email);

    console.log(`✅ User registered successfully: ${email}`);

    sendResponse(res, 201, true, "User registered successfully", {
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      token,
      // Flag to satisfy the specific frontend logic calling for verification popup
      // In DynamoDB simple mode, we are skipping verification for now
      verified: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    console.error("Register error stack:", error.stack);

    sendResponse(res, 500, false, `Registration failed: ${error.message}`);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (email) email = email.toLowerCase().trim();
    console.log(`🔑 Login attempt for: ${email}`);

    if (!email || !password) {
      return sendResponse(res, 400, false, "Please provide email and password");
    }

    // 1. Get User from DynamoDB
    const user = await dynamoService.findUserByEmail(email);

    if (!user) {
      console.log(`❌ Login failed: User not found [${email}]`);
      console.log(
        `📝 Hint: User might not be registered. Please sign up first.`,
      );
      return sendResponse(
        res,
        401,
        false,
        "User not found. Please sign up first.",
      );
    }

    console.log(`👤 User found: ${user.email || user.real_user}`);
    console.log(`🔐 Password field exists: ${!!user.password}`);
    console.log(
      `🔐 Password starts with $2: ${user.password ? user.password.startsWith("$2") : "N/A"}`,
    );

    // 2. Verify Password
    let isMatch = false;

    try {
      // Try bcrypt comparison first (for hashed passwords)
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      isMatch = false;
    }

    // 3. Fallback for plain text passwords (for users created before hashing was implemented)
    if (!isMatch) {
      console.log(`💡 Bcrypt mismatch. Trying plain text comparison...`);
      isMatch = (password === user.password);

      if (isMatch) {
        console.log(`✅ Plain text password matched. Upgrading user security...`);
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          await dynamoService.updateUserPassword(email, hashedPassword);
          console.log(`✅ Password auto-upgraded to hash format`);
        } catch (upgradeError) {
          console.warn(`⚠️ Security upgrade failed: ${upgradeError.message}`);
        }
      }
    }

    if (!isMatch) {
      console.log(`❌ Login failed: Password mismatch for [${email}]`);
      console.log(`   Stored hash/pwd starts with: ${user.password ? user.password.substring(0, 10) : 'N/A'}`);
      console.log(`   Received password length: ${password.length}`);
      console.log(`   Received password starts with: ${password.substring(0, 3)}...`);
      return sendResponse(
        res,
        401,
        false,
        "Invalid email or password. Please check and try again.",
      );
    }

    console.log(`✅ Login success: [${email}]`);

    // 3. Issue Token
    const token = getSignedJwtToken(user.email || user.real_user);

    sendResponse(res, 200, true, "User logged in successfully", {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Full error stack:", error.stack);
    sendResponse(res, 500, false, `Server Error: ${error.message}`);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user.id contains the email from the token
    const user = await dynamoService.findUserByEmail(req.user.id);

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    sendResponse(res, 200, true, "User fetched successfully", {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Verify Email (Placeholder only, since DynamoDB needs custom SES logic for this)
exports.verifyEmail = async (req, res, next) => {
  sendResponse(
    res,
    200,
    true,
    "Verification not enabled for DynamoDB mode yet",
  );
};

// @desc    Update user profile
// @route   PUT /api/auth/update
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    // Get email from token (req.user.id)
    const email = req.user.id;

    const updatedAttributes = await dynamoService.updateUser(email, {
      firstName,
      lastName,
      phone,
    });

    sendResponse(res, 200, true, "Profile updated successfully", {
      user: {
        firstName: updatedAttributes.firstName,
        lastName: updatedAttributes.lastName,
        email: updatedAttributes.email,
        phone: updatedAttributes.phone,
        role: updatedAttributes.role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    sendResponse(res, 500, false, error.message || "Server Error");
  }
};

exports.changePassword = async (req, res, next) => {
  sendResponse(res, 200, true, "Change password not implemented");
};

exports.forgotPassword = async (req, res, next) => {
  sendResponse(res, 200, true, "Forgot password not implemented");
};

exports.resetPassword = async (req, res, next) => {
  sendResponse(res, 200, true, "Reset password not implemented");
};
