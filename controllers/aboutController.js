// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = { success, message };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

// @desc    Get about information
// @route   GET /api/about
// @access  Public
exports.getAbout = async (req, res) => {
    try {
        const about = {
            company: {
                name: 'FoodHub',
                tagline: 'Delicious food, delivered fast',
                description: 'FoodHub is your go-to platform for ordering food from the best restaurants in your city. We connect you with thousands of restaurants offering a wide variety of cuisines.',
                founded: '2024',
                mission: 'To make food delivery fast, reliable, and accessible to everyone.',
                vision: 'To become the most trusted food delivery platform globally.'
            },
            features: [
                {
                    title: 'Wide Selection',
                    description: 'Choose from thousands of restaurants and cuisines',
                    icon: 'restaurant'
                },
                {
                    title: 'Fast Delivery',
                    description: 'Get your food delivered in 30-45 minutes',
                    icon: 'truck'
                },
                {
                    title: 'Live Tracking',
                    description: 'Track your order in real-time',
                    icon: 'map'
                },
                {
                    title: 'Secure Payments',
                    description: 'Multiple payment options with secure checkout',
                    icon: 'shield'
                }
            ],
            stats: {
                restaurants: '1000+',
                cities: '50+',
                orders: '1M+',
                users: '500K+'
            },
            contact: {
                email: 'support@foodhub.com',
                phone: '+1-800-FOODHUB',
                address: '123 Food Street, Culinary City, FC 12345'
            }
        };

        sendResponse(res, 200, true, 'About information fetched successfully', { about });
    } catch (error) {
        console.error('GetAbout error:', error);
        sendResponse(res, 500, false, error.message);
    }
};
