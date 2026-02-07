const { dynamoDb } = require("../config/dynamodb");
const { v4: uuidv4 } = require("uuid");

// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = { success, message };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

const TABLE_NAME = "feedback";

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public/Private
exports.submitFeedback = async (req, res) => {
    try {
        const { type, subject, message, rating } = req.body;

        if (!message) {
            return sendResponse(res, 400, false, "Message is required");
        }

        const feedbackId = uuidv4();
        const feedbackData = {
            feedbackId,
            type: type || "other",
            subject,
            message,
            rating: rating ? parseInt(rating) : undefined,
            status: "pending", // Default status
            createdAt: new Date().toISOString(),
        };

        // Add userId if user is logged in
        if (req.user) {
            feedbackData.userId = req.user.id || req.user.email; // Use available identifier
            feedbackData.userEmail = req.user.email; // Store email for easier reference
        }

        await dynamoDb
            .put({
                TableName: TABLE_NAME,
                Item: feedbackData,
            })
            .promise();

        sendResponse(res, 201, true, "Thank you for your feedback!", {
            feedback: feedbackData,
        });
    } catch (error) {
        console.error("SubmitFeedback error:", error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private (Admin)
exports.getFeedback = async (req, res) => {
    try {
        const { type, status } = req.query;

        const params = {
            TableName: TABLE_NAME,
        };

        const data = await dynamoDb.scan(params).promise();
        let feedback = data.Items || [];

        // Filter by type
        if (type) {
            feedback = feedback.filter(
                (f) => f.type && f.type.toLowerCase() === type.toLowerCase()
            );
        }

        // Filter by status
        if (status) {
            feedback = feedback.filter(
                (f) => f.status && f.status.toLowerCase() === status.toLowerCase()
            );
        }

        // Sort by createdAt desc
        feedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        sendResponse(res, 200, true, "Feedback fetched successfully", { feedback });
    } catch (error) {
        console.error("GetFeedback error:", error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Update feedback status
// @route   PUT /api/feedback/:id
// @access  Private (Admin)
exports.updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return sendResponse(res, 400, false, "Status is required");
        }

        // Check if feedback exists
        const checkParams = {
            TableName: TABLE_NAME,
            Key: { feedbackId: id },
        };
        const checkResult = await dynamoDb.get(checkParams).promise();

        if (!checkResult.Item) {
            return sendResponse(res, 404, false, "Feedback not found");
        }

        // Update status
        const updateParams = {
            TableName: TABLE_NAME,
            Key: { feedbackId: id },
            UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
            ExpressionAttributeNames: {
                "#status": "status",
            },
            ExpressionAttributeValues: {
                ":status": status,
                ":updatedAt": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
        };

        const result = await dynamoDb.update(updateParams).promise();

        sendResponse(res, 200, true, "Feedback updated successfully", {
            feedback: result.Attributes,
        });
    } catch (error) {
        console.error("UpdateFeedback error:", error);
        sendResponse(res, 500, false, error.message);
    }
};
