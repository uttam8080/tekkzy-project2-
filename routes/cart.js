const express = require('express');
const {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.delete('/item/:menuItemId', protect, removeFromCart);
router.put('/item/:menuItemId', protect, updateCartItem);
router.delete('/', protect, clearCart);

module.exports = router;
