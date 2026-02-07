/**
 * Razorpay Configuration
 * Initialize and export Razorpay instance
 */

const Razorpay = require("razorpay");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : "",
});

// Verify Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "⚠️  Razorpay credentials not configured. Payments will be disabled.",
  );
  console.warn("   Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file");
}

module.exports = razorpay;
