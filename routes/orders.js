const express = require('express');
const {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    addReview
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('restaurant', 'admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/review', protect, addReview);

module.exports = router;
