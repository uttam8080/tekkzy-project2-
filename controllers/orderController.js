/**
 * Order Controller
 * Handles order creation, retrieval, and management using DynamoDB
 */

const dynamoService = require("../utils/dynamoService");
const { dynamoDb } = require("../config/dynamodb");
const { v4: uuidv4 } = require("uuid");

// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD${timestamp.slice(-8)}${random}`;
};

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZipCode,
      paymentMethod = "online",
      specialRequests,
      transactionId,
      cartItems,
      restaurantId,
      subtotal,
      tax,
      deliveryFee,
      total,
    } = req.body;

    // Validate required fields
    if (!deliveryAddress || !deliveryCity || !restaurantId) {
      return sendResponse(
        res,
        400,
        false,
        "Missing required fields: deliveryAddress, deliveryCity, restaurantId",
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return sendResponse(res, 400, false, "Cart is empty");
    }

    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();
    const userId = req.user.email; // Use email as user ID in DynamoDB
    const orderDate = new Date().toISOString();
    const estimatedDeliveryTime = new Date(
      Date.now() + 45 * 60000,
    ).toISOString(); // 45 minutes from now

    // Create order object
    const order = {
      orderId: orderId,
      orderNumber: orderNumber,
      userId: userId,
      restaurantId: restaurantId,
      status: "confirmed", // Order status: pending, confirmed, preparing, ready, on_way, delivered, cancelled
      paymentStatus: transactionId ? "completed" : "pending",
      paymentMethod: paymentMethod, // online, cash, wallet
      transactionId: transactionId || null,

      // Order details
      subtotal: parseFloat(subtotal) || 0,
      tax: parseFloat(tax) || 0,
      deliveryFee: parseFloat(deliveryFee) || 0,
      total: parseFloat(total) || 0,

      // Delivery details
      deliveryAddress: deliveryAddress,
      deliveryCity: deliveryCity,
      deliveryState: deliveryState || "N/A",
      deliveryZipCode: deliveryZipCode || "N/A",
      customerPhone: req.user.phone || "N/A",
      specialRequests: specialRequests || "",

      // Timestamps
      orderDate: orderDate,
      estimatedDeliveryTime: estimatedDeliveryTime,
      deliveredAt: null,

      // Items
      items: cartItems.map((item, index) => ({
        itemId: index + 1,
        menuItemId: item.menuItemId,
        menuItemName: item.name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        itemTotal: parseFloat(item.quantity) * parseFloat(item.price),
        specialInstructions: item.specialInstructions || "",
      })),

      // Additional info
      notes: "",
      rating: null,
      review: null,
      userEmail: req.user.email,
      userName: req.user.firstName + " " + req.user.lastName,
    };

    // Save order to DynamoDB
    await dynamoDb
      .put({
        TableName: process.env.ORDERS_TABLE || "orders",
        Item: order,
      })
      .promise();

    console.log("✅ Order created successfully:", orderId);

    return sendResponse(res, 201, true, "Order created successfully", {
      orderId: orderId,
      orderNumber: orderNumber,
      status: order.status,
      total: order.total,
      estimatedDeliveryTime: estimatedDeliveryTime,
      deliveryAddress: deliveryAddress,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return sendResponse(
      res,
      500,
      false,
      error.message || "Failed to create order",
    );
  }
};

// @desc    Get all orders for logged-in user
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.email;

    // Query orders by userId using GSI
    const result = await dynamoDb
      .query({
        TableName: "orders",
        IndexName: "userIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        ScanIndexForward: false, // Sort by most recent first
      })
      .promise();

    return sendResponse(
      res,
      200,
      true,
      "Orders retrieved successfully",
      result.Items || [],
    );
  } catch (error) {
    console.error("Get Orders Error:", error);
    // Fallback to scan if index doesn't exist
    try {
      const result = await dynamoDb
        .scan({
          TableName: "orders",
          FilterExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": req.user.email,
          },
        })
        .promise();
      return sendResponse(
        res,
        200,
        true,
        "Orders retrieved successfully",
        result.Items || [],
      );
    } catch (scanError) {
      return sendResponse(
        res,
        500,
        false,
        error.message || "Failed to retrieve orders",
      );
    }
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.email;

    if (!orderId) {
      return sendResponse(res, 400, false, "Order ID is required");
    }

    const result = await dynamoDb
      .get({
        TableName: "orders",
        Key: { orderId: orderId },
      })
      .promise();

    if (!result.Item) {
      return sendResponse(res, 404, false, "Order not found");
    }

    // Verify user owns this order
    if (result.Item.userId !== userId) {
      return sendResponse(res, 403, false, "Not authorized to view this order");
    }

    return sendResponse(
      res,
      200,
      true,
      "Order retrieved successfully",
      result.Item,
    );
  } catch (error) {
    console.error("Get Order Error:", error);
    return sendResponse(
      res,
      500,
      false,
      error.message || "Failed to retrieve order",
    );
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:orderId
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    if (!orderId) {
      return sendResponse(res, 400, false, "Order ID is required");
    }

    if (!status) {
      return sendResponse(res, 400, false, "Status is required");
    }

    // Get existing order
    const result = await dynamoDb
      .get({
        TableName: "orders",
        Key: { orderId: orderId },
      })
      .promise();

    if (!result.Item) {
      return sendResponse(res, 404, false, "Order not found");
    }

    // Update order
    const updateExpression = [];
    const expressionAttributeValues = {
      ":status": status,
    };

    updateExpression.push("#status = :status");

    if (notes !== undefined) {
      updateExpression.push("notes = :notes");
      expressionAttributeValues[":notes"] = notes;
    }

    if (status === "delivered") {
      updateExpression.push("deliveredAt = :timestamp");
      expressionAttributeValues[":timestamp"] = new Date().toISOString();
    }

    await dynamoDb
      .update({
        TableName: "orders",
        Key: { orderId: orderId },
        UpdateExpression: updateExpression.join(", "),
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();

    // Fetch updated order
    const updated = await dynamoDb
      .get({
        TableName: "orders",
        Key: { orderId: orderId },
      })
      .promise();

    return sendResponse(
      res,
      200,
      true,
      "Order updated successfully",
      updated.Item,
    );
  } catch (error) {
    console.error("Update Order Error:", error);
    return sendResponse(
      res,
      500,
      false,
      error.message || "Failed to update order",
    );
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.email;
    const { reason } = req.body;

    if (!orderId) {
      return sendResponse(res, 400, false, "Order ID is required");
    }

    // Get existing order
    const result = await dynamoDb
      .get({
        TableName: "orders",
        Key: { orderId: orderId },
      })
      .promise();

    if (!result.Item) {
      return sendResponse(res, 404, false, "Order not found");
    }

    // Verify user owns this order
    if (result.Item.userId !== userId) {
      return sendResponse(
        res,
        403,
        false,
        "Not authorized to cancel this order",
      );
    }

    // Check if order can be cancelled
    const order = result.Item;
    if (["delivered", "cancelled"].includes(order.status)) {
      return sendResponse(
        res,
        400,
        false,
        `Cannot cancel order with status: ${order.status}`,
      );
    }

    // Update order status to cancelled
    await dynamoDb
      .update({
        TableName: "orders",
        Key: { orderId: orderId },
        UpdateExpression:
          "SET #status = :status, cancelReason = :reason, cancelledAt = :timestamp",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "cancelled",
          ":reason": reason || "User cancelled",
          ":timestamp": new Date().toISOString(),
        },
      })
      .promise();

    // Fetch updated order
    const updated = await dynamoDb
      .get({
        TableName: "orders",
        Key: { orderId: orderId },
      })
      .promise();

    return sendResponse(
      res,
      200,
      true,
      "Order cancelled successfully",
      updated.Item,
    );
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return sendResponse(
      res,
      500,
      false,
      error.message || "Failed to cancel order",
    );
  }
};

// @desc    Add review to order
// @route   POST /api/orders/:orderId/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.email;

    if (!orderId) {
      return sendResponse(res, 400, false, "Order ID is required");
    }

    if (!rating || rating < 1 || rating > 5) {
      return sendResponse(res, 400, false, "Rating must be between 1 and 5");
    }

    // Get order
    const result = await dynamoDb
      .get({
        TableName: "orders",
        Key: { orderId: orderId },
      })
      .promise();

    if (!result.Item) {
      return sendResponse(res, 404, false, "Order not found");
    }

    // Verify user owns this order
    if (result.Item.userId !== userId) {
      return sendResponse(
        res,
        403,
        false,
        "Not authorized to review this order",
      );
    }

    // Update order with rating
    await dynamoDb
      .update({
        TableName: "orders",
        Key: { orderId: orderId },
        UpdateExpression:
          "SET rating = :rating, review = :review, ratedAt = :timestamp",
        ExpressionAttributeValues: {
          ":rating": parseInt(rating),
          ":review": review || "",
          ":timestamp": new Date().toISOString(),
        },
      })
      .promise();

    // Fetch updated order
    const updated = await dynamoDb
      .get({
        TableName: "orders",
        Key: { orderId: orderId },
      })
      .promise();

    return sendResponse(
      res,
      200,
      true,
      "Order rated successfully",
      updated.Item,
    );
  } catch (error) {
    console.error("Add Review Error:", error);
    return sendResponse(
      res,
      500,
      false,
      error.message || "Failed to add review",
    );
  }
};
