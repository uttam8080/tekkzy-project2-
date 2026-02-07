const express = require('express');
const router = express.Router();
const {
    getFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ
} = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getFAQs);

// Admin routes
router.post('/', protect, authorize('admin'), createFAQ);
router.put('/:id', protect, authorize('admin'), updateFAQ);
router.delete('/:id', protect, authorize('admin'), deleteFAQ);

module.exports = router;
