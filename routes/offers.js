const express = require('express');
const {
    getOffers,
    validateCoupon,
    createOffer,
    updateOffer,
    deleteOffer
} = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getOffers);
router.post('/validate', validateCoupon);

router.post('/', protect, authorize('admin'), createOffer);
router.put('/:id', protect, authorize('admin'), updateOffer);
router.delete('/:id', protect, authorize('admin'), deleteOffer);

module.exports = router;
