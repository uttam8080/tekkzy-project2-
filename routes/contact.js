const express = require('express');
const router = express.Router();
const {
    submitContact,
    getContactMessages,
    updateContactMessage
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.post('/', submitContact);

// Admin routes
router.get('/', protect, authorize('admin'), getContactMessages);
router.put('/:id', protect, authorize('admin'), updateContactMessage);

module.exports = router;
