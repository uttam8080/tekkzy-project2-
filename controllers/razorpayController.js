/**
 * Razorpay Payment Controller
 * Handles Razorpay payment operations
 */

const razorpay = require("../config/razorpay");
const { dynamoDb, dynamoDbClient } = require("../config/dynamodb");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

// @desc    Create Razorpay Order
// @route   POST /api/payment/razorpay/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  let step = "init";
  try {
    const {
      orderId,
      amount,
      currency = "INR",
      description,
      customerEmail,
      customerPhone,
      customerName,
    } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Order ID and amount are required",
      });
    }

    // 1. Create Order in Razorpay
    step = "razorpay_create";
    console.log("Creating Razorpay order for amount:", amount);

    // DEBUG: Check credentials and payload
    const keyId = process.env.RAZORPAY_KEY_ID;
    console.log("DEBUG: Razorpay Key ID loaded:", keyId ? `${keyId.substring(0, 8)}...` : "UNDEFINED");

    const options = {
      amount: Math.round(amount * 100), // Amount in smallest currency unit (paise for INR)
      currency: currency.toUpperCase(),
      receipt: orderId,
    };

    console.log("DEBUG: Sending options to Razorpay:", JSON.stringify(options));

    const razorpayOrder = await razorpay.orders.create(options);
    console.log("Razorpay order created:", razorpayOrder.id);

    // 2. Store in DynamoDB
    step = "dynamodb_save";
    const tableName = "orders"; // STRICTLY use "orders" table
    console.log(`Saving order to DynamoDB table: ${tableName}`);

    try {
      await dynamoDb
        .put({
          TableName: tableName,
          Item: {
            orderId: orderId,
            razorpayOrderId: razorpayOrder.id,
            amount: amount,
            currency: currency,
            status: "pending_payment",
            paymentStatus: "initiated",
            createdAt: new Date().toISOString(),
            userId: req.user?.id || "guest",
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            customerName: customerName,
          },
        })
        .promise();
    } catch (dbError) {
      console.error("DynamoDB Save Error (Non-fatal):", dbError);
      // We log but allowing proceeding so payment can still happen? 
      // User requested "must store", so this might be critical.
      // For now, let's treat it as critical but with clear error message.
      throw new Error(`Database Error: ${dbError.message}`);
    }

    res.status(200).json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error(`Error during ${step}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order",
      step: step
    });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/razorpay/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment details",
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed - Invalid signature",
      });
    }

    // Update order with payment details
    const transactionId = uuidv4();
    await dynamoDb
      .update({
        TableName: "orders",
        Key: { orderId: orderId },
        UpdateExpression:
          "SET paymentStatus = :status, razorpayPaymentId = :paymentId, transactionId = :txnId, paidAt = :timestamp, #status = :orderStatus",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "completed",
          ":paymentId": razorpay_payment_id,
          ":txnId": transactionId,
          ":timestamp": new Date().toISOString(),
          ":orderStatus": "confirmed",
        },
      })
      .promise();

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: orderId,
        transactionId: transactionId,
        paymentId: razorpay_payment_id,
        amount: payment.amount / 100, // Convert from paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        createdAt: new Date(payment.created_at * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

// @desc    Get Payment Details
// @route   GET /api/payment/razorpay/:paymentId
// @access  Private
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment.id,
        amount: payment.amount / 100, // Convert from paise
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        email: payment.email,
        contact: payment.contact,
        notes: payment.notes,
        createdAt: new Date(payment.created_at * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Get Payment Details Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment details",
    });
  }
};

// @desc    Get Razorpay Key ID
// @route   GET /api/payment/razorpay/key
// @access  Private
exports.getRazorpayKey = async (req, res) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payment/razorpay/webhook
// @access  Public
exports.razorpayWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    console.log("Razorpay Webhook Event:", event);

    if (event === "payment.authorized") {
      const { payment } = payload;
      console.log("✅ Payment Authorized:", payment.id);
    } else if (event === "payment.failed") {
      const { payment } = payload;
      console.log("❌ Payment Failed:", payment.id);

      // Update order status
      if (payment.notes?.orderId) {
        await dynamoDb
          .update({
            TableName: "orders",
            Key: { orderId: payment.notes.orderId },
            UpdateExpression:
              "SET paymentStatus = :status, #status = :orderStatus",
            ExpressionAttributeNames: {
              "#status": "status",
            },
            ExpressionAttributeValues: {
              ":status": "failed",
              ":orderStatus": "cancelled",
            },
          })
          .promise();
      }
    } else if (event === "order.paid") {
      const { order } = payload;
      console.log("✅ Order Paid:", order.id);
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Webhook processing failed",
    });
  }
};

// @desc    Refund Payment
// @route   POST /api/payment/razorpay/refund
// @access  Private
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const refundOptions = {
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount provided
      notes: {
        reason: reason || "Refund requested",
      },
    };

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: {
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100, // Convert from paise
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Refund Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Refund processing failed",
    });
  }
};
