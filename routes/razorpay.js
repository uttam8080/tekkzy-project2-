/**
 * Razorpay Payment Routes
 */

const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentDetails,
  razorpayWebhook,
  refundPayment,
  getRazorpayKey,
} = require("../controllers/razorpayController");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/webhook", razorpayWebhook);

// Protected routes
router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyRazorpayPayment);
router.get("/key", protect, getRazorpayKey);
router.get("/:paymentId", protect, getPaymentDetails);
router.post("/refund", protect, refundPayment);

module.exports = router;
