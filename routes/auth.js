const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Check if social login credentials are configured
router.get("/social-status", (req, res) => {
  const googleConfigured = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== "dummy_client_id"
  );
  const facebookConfigured = !!(
    process.env.FACEBOOK_APP_ID &&
    process.env.FACEBOOK_APP_ID !== "dummy_app_id"
  );

  res.json({
    googleConfigured,
    facebookConfigured,
    message: googleConfigured
      ? "Google OAuth configured"
      : "Google OAuth not configured",
  });
});

const passport = require("passport");
const jwt = require("jsonwebtoken");

// Helper to generate token after social login
const socialLoginCallback = (req, res) => {
  // Use email as the ID payload to match authController logic
  const token = jwt.sign({ id: req.user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // Sanitize user object (remove sensitive data)
  const userPayload = { ...req.user };
  delete userPayload.password;
  delete userPayload.pk; // if internal keys exist
  delete userPayload.sk;

  // Redirect to frontend with token
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8000";
  res.redirect(
    `${frontendUrl}/auth_callback.html?token=${token}&user=${encodeURIComponent(JSON.stringify(userPayload))}`,
  );
};

// Google Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login.html?error=google_auth_failed",
    session: false,
  }),
  socialLoginCallback,
);

// Facebook Routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] }),
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login.html?error=facebook_auth_failed",
    session: false,
  }),
  socialLoginCallback,
);

module.exports = router;
