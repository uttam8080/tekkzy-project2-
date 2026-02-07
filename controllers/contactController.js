const { ContactMessage } = require('../models');

// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = { success, message };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return sendResponse(res, 400, false, 'Name, email, and message are required');
        }

        const contactMessage = await ContactMessage.create({
            name,
            email,
            phone,
            subject,
            message
        });

        sendResponse(res, 201, true, 'Message sent successfully. We will get back to you soon!', { contactMessage });
    } catch (error) {
        console.error('SubmitContact error:', error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin)
exports.getContactMessages = async (req, res) => {
    try {
        const { status } = req.query;

        let whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        const messages = await ContactMessage.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        sendResponse(res, 200, true, 'Contact messages fetched successfully', { messages });
    } catch (error) {
        console.error('GetContactMessages error:', error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Update contact message status
// @route   PUT /api/contact/:id
// @access  Private (Admin)
exports.updateContactMessage = async (req, res) => {
    try {
        const { status, response } = req.body;

        const message = await ContactMessage.findByPk(req.params.id);

        if (!message) {
            return sendResponse(res, 404, false, 'Message not found');
        }

        await message.update({ status, response });

        sendResponse(res, 200, true, 'Message updated successfully', { message });
    } catch (error) {
        console.error('UpdateContactMessage error:', error);
        sendResponse(res, 500, false, error.message);
    }
};
