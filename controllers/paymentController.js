const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "inr" } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Amount in smallest currency unit (e.g., paise for INR)
      currency,
      metadata: {
        userId: req.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify Payment Status
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment Intent ID is required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: "Payment Intent not found",
      });
    }

    res.status(200).json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error("Payment Verify Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
