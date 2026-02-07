const express = require('express');
const router = express.Router();
const { getHelpTopics, searchHelp } = require('../controllers/helpController');

// Public routes
router.get('/', getHelpTopics);
router.get('/search', searchHelp);

module.exports = router;
