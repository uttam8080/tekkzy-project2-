const express = require('express');
const router = express.Router();
const {
    submitFeedback,
    getFeedback,
    updateFeedback
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (protect middleware acts as optional auth if configured, but here we keep it public/mixed)
router.post('/', protect, submitFeedback);

// Admin routes
router.get('/', protect, authorize('admin'), getFeedback);
router.put('/:id', protect, authorize('admin'), updateFeedback);

module.exports = router;
