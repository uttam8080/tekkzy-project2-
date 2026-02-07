// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = { success, message };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

// @desc    Get help topics
// @route   GET /api/help
// @access  Public
exports.getHelpTopics = async (req, res) => {
    try {
        const topics = [
            {
                id: 1,
                title: 'Getting Started',
                description: 'Learn how to use FoodHub',
                icon: 'book'
            },
            {
                id: 2,
                title: 'Account & Settings',
                description: 'Manage your account',
                icon: 'user'
            },
            {
                id: 3,
                title: 'Orders & Delivery',
                description: 'Track and manage orders',
                icon: 'shopping-bag'
            },
            {
                id: 4,
                title: 'Payments',
                description: 'Payment methods and issues',
                icon: 'credit-card'
            },
            {
                id: 5,
                title: 'Offers & Coupons',
                description: 'How to use promo codes',
                icon: 'tag'
            },
            {
                id: 6,
                title: 'Support',
                description: 'Contact customer support',
                icon: 'headphones'
            }
        ];

        sendResponse(res, 200, true, 'Help topics fetched successfully', { topics });
    } catch (error) {
        console.error('GetHelpTopics error:', error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Search help articles
// @route   GET /api/help/search
// @access  Public
exports.searchHelp = async (req, res) => {
    try {
        const { query } = req.query;

        // This is a placeholder - in production, you'd search a help articles database
        const results = [
            {
                id: 1,
                title: 'How to place an order',
                content: 'Browse restaurants, add items to cart, and checkout...',
                category: 'Orders'
            },
            {
                id: 2,
                title: 'How to track my order',
                content: 'Go to My Orders section to track your order status...',
                category: 'Orders'
            }
        ];

        sendResponse(res, 200, true, 'Search results', { results });
    } catch (error) {
        console.error('SearchHelp error:', error);
        sendResponse(res, 500, false, error.message);
    }
};
