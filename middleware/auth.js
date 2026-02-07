const jwt = require("jsonwebtoken");
const { dynamoDb } = require("../config/dynamodb");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // For users table with composite key, we must query by partition key (real_user = email)
    // The token contains { id: email }
    const result = await dynamoDb
      .query({
        TableName: process.env.USERS_TABLE || "FoodHub_Users",
        KeyConditionExpression: "real_user = :email",
        ExpressionAttributeValues: {
          ":email": decoded.id
        }
      })
      .promise();

    // Take the correct user item
    if (result.Items && result.Items.length > 0) {
      req.user = result.Items.find(item => item.real_user === decoded.id) || result.Items[0];
    } else {
      req.user = null;
    }

    if (!req.user) {
      console.log("❌ Auth Middleware: User not found in DB for email:", decoded.id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ Auth Middleware: User authenticated:", req.user.email);

    // IMPORTANT: Mapping 'email' to 'id' because controllers use req.user.id
    req.user.id = req.user.email;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
