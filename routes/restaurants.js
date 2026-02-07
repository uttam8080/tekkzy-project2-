const express = require('express');
const {
    getRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantMenu,
    getCities,
    searchByLocation
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Location search routes (must be before /:id routes)
router.get('/cities', getCities);
router.get('/search/location', searchByLocation);

// Restaurant routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.get('/:id/menu', getRestaurantMenu);

router.post('/', protect, authorize('restaurant', 'admin'), createRestaurant);
router.put('/:id', protect, authorize('restaurant', 'admin'), updateRestaurant);
router.delete('/:id', protect, authorize('restaurant', 'admin'), deleteRestaurant);

module.exports = router;
