const { dynamoDb } = require("../config/dynamodb");
const { v4: uuidv4 } = require("uuid");

// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

const TABLE_NAME = "offers";

// @desc    Get all active offers
// @route   GET /api/offers
// @access  Public
exports.getOffers = async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME,
    };

    const data = await dynamoDb.scan(params).promise();
    let offers = data.Items || [];

    const now = new Date();

    // Filter active and valid offers
    offers = offers.filter((offer) => {
      const validFrom = offer.validFrom ? new Date(offer.validFrom) : null;
      const validUntil = offer.validUntil ? new Date(offer.validUntil) : null;

      return (
        offer.isActive === true &&
        (!validFrom || validFrom <= now) &&
        (!validUntil || validUntil >= now)
      );
    });

    // Sort by createdAt desc
    offers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sendResponse(res, 200, true, "Offers fetched successfully", { offers });
  } catch (error) {
    console.error("GetOffers error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Validate coupon code
// @route   POST /api/offers/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderValue, restaurantId } = req.body;

    if (!code) {
      return sendResponse(res, 400, false, "Coupon code is required");
    }

    // Scan for the coupon code (Assuming code is unique enough or we filter)
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "code = :code",
      ExpressionAttributeValues: {
        ":code": code.toUpperCase(),
      },
    };

    const data = await dynamoDb.scan(params).promise();
    const offer = data.Items.length > 0 ? data.Items[0] : null;

    if (!offer) {
      return sendResponse(res, 404, false, "Invalid or expired coupon code");
    }

    // Check validity
    const now = new Date();
    const validFrom = offer.validFrom ? new Date(offer.validFrom) : null;
    const validUntil = offer.validUntil ? new Date(offer.validUntil) : null;

    if (
      !offer.isActive ||
      (validFrom && validFrom > now) ||
      (validUntil && validUntil < now)
    ) {
      return sendResponse(res, 400, false, "Coupon is expired or inactive");
    }

    // Check usage limit
    if (offer.usageLimit && (offer.usedCount || 0) >= offer.usageLimit) {
      return sendResponse(res, 400, false, "Coupon usage limit reached");
    }

    // Check minimum order value
    if (offer.minOrderValue && orderValue < offer.minOrderValue) {
      return sendResponse(
        res,
        400,
        false,
        `Minimum order value of ₹${offer.minOrderValue} required`
      );
    }

    // Check restaurant specific
    if (
      offer.applicableFor === "specific_restaurant" &&
      offer.restaurantId &&
      offer.restaurantId !== restaurantId
    ) {
      return sendResponse(
        res,
        400,
        false,
        "Coupon not valid for this restaurant"
      );
    }

    // Calculate discount
    let discount = 0;
    if (offer.discountType === "percentage") {
      discount = (orderValue * offer.discountValue) / 100;
      if (offer.maxDiscount && discount > offer.maxDiscount) {
        discount = offer.maxDiscount;
      }
    } else {
      discount = offer.discountValue;
    }

    sendResponse(res, 200, true, "Coupon is valid", {
      offer: {
        code: offer.code,
        title: offer.title,
        description: offer.description,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        discount: discount.toFixed(2),
      },
    });
  } catch (error) {
    console.error("ValidateCoupon error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Create offer
// @route   POST /api/offers
// @access  Private (Admin/Restaurant owner)
exports.createOffer = async (req, res) => {
  try {
    const offerId = uuidv4();
    const offerData = {
      offerId,
      ...req.body,
      code: req.body.code.toUpperCase(),
      isActive: true, // Default to active
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };

    await dynamoDb
      .put({
        TableName: TABLE_NAME,
        Item: offerData,
      })
      .promise();

    sendResponse(res, 201, true, "Offer created successfully", { offer: offerData });
  } catch (error) {
    console.error("CreateOffer error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private (Admin/Restaurant owner)
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check existence
    const getParams = { TableName: TABLE_NAME, Key: { offerId: id } };
    const getResult = await dynamoDb.get(getParams).promise();

    if (!getResult.Item) {
      return sendResponse(res, 404, false, "Offer not found");
    }

    // Merge updates
    const updatedOffer = { ...getResult.Item, ...req.body, updatedAt: new Date().toISOString() };
    if (req.body.code) updatedOffer.code = req.body.code.toUpperCase();

    await dynamoDb.put({
      TableName: TABLE_NAME,
      Item: updatedOffer
    }).promise();

    sendResponse(res, 200, true, "Offer updated successfully", { offer: updatedOffer });
  } catch (error) {
    console.error("UpdateOffer error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private (Admin)
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const getParams = { TableName: TABLE_NAME, Key: { offerId: id } };
    const getResult = await dynamoDb.get(getParams).promise();

    if (!getResult.Item) {
      return sendResponse(res, 404, false, "Offer not found");
    }

    await dynamoDb.delete({
      TableName: TABLE_NAME,
      Key: { offerId: id }
    }).promise();

    sendResponse(res, 200, true, "Offer deleted successfully");
  } catch (error) {
    console.error("DeleteOffer error:", error);
    sendResponse(res, 500, false, error.message);
  }
};
