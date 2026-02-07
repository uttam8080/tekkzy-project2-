const express = require('express');
const {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItem);

router.post('/', protect, authorize('restaurant', 'admin'), createMenuItem);
router.put('/:id', protect, authorize('restaurant', 'admin'), updateMenuItem);
router.delete('/:id', protect, authorize('restaurant', 'admin'), deleteMenuItem);

module.exports = router;
