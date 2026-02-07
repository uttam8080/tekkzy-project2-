const { FAQ } = require('../models');

// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = { success, message };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

// @desc    Get all FAQs
// @route   GET /api/faq
// @access  Public
exports.getFAQs = async (req, res) => {
    try {
        const { category } = req.query;

        let whereClause = { isActive: true };

        if (category) {
            whereClause.category = category;
        }

        const faqs = await FAQ.findAll({
            where: whereClause,
            order: [['orderIndex', 'ASC'], ['createdAt', 'ASC']]
        });

        sendResponse(res, 200, true, 'FAQs fetched successfully', { faqs });
    } catch (error) {
        console.error('GetFAQs error:', error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Create FAQ
// @route   POST /api/faq
// @access  Private (Admin)
exports.createFAQ = async (req, res) => {
    try {
        const faq = await FAQ.create(req.body);

        sendResponse(res, 201, true, 'FAQ created successfully', { faq });
    } catch (error) {
        console.error('CreateFAQ error:', error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Update FAQ
// @route   PUT /api/faq/:id
// @access  Private (Admin)
exports.updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByPk(req.params.id);

        if (!faq) {
            return sendResponse(res, 404, false, 'FAQ not found');
        }

        await faq.update(req.body);

        sendResponse(res, 200, true, 'FAQ updated successfully', { faq });
    } catch (error) {
        console.error('UpdateFAQ error:', error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Delete FAQ
// @route   DELETE /api/faq/:id
// @access  Private (Admin)
exports.deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByPk(req.params.id);

        if (!faq) {
            return sendResponse(res, 404, false, 'FAQ not found');
        }

        await faq.destroy();

        sendResponse(res, 200, true, 'FAQ deleted successfully');
    } catch (error) {
        console.error('DeleteFAQ error:', error);
        sendResponse(res, 500, false, error.message);
    }
};
