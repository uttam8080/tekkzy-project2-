const { dynamoDb } = require("../config/dynamodb");
const { v4: uuidv4 } = require("uuid");

// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

const TABLE_NAME = "restaurants";

// Simple in-memory cache for better performance
let restaurantCache = {
  data: null,
  timestamp: 0,
  ttl: 300000, // 5 minutes
};

const getCachedRestaurants = async () => {
  const now = Date.now();
  if (restaurantCache.data && now - restaurantCache.timestamp < restaurantCache.ttl) {
    return restaurantCache.data;
  }

  const data = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
  restaurantCache.data = data.Items || [];
  restaurantCache.timestamp = now;
  return restaurantCache.data;
};

const invalidateCache = () => {
  restaurantCache.data = null;
  restaurantCache.timestamp = 0;
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const { cuisine, city, location, search, minRating, sort } = req.query;

    const restaurantsData = await getCachedRestaurants();
    let restaurants = [...restaurantsData];

    // Filter by cuisine
    if (cuisine) {
      restaurants = restaurants.filter(
        (r) =>
          r.cuisine && r.cuisine.toLowerCase().includes(cuisine.toLowerCase()),
      );
    }

    // Filter by location (city or generic location search)
    if (city || location) {
      const searchLocation = (city || location).toLowerCase();
      restaurants = restaurants.filter(
        (r) =>
          (r.city && r.city.toLowerCase().includes(searchLocation)) ||
          (r.address && r.address.toLowerCase().includes(searchLocation)) ||
          (r.state && r.state.toLowerCase().includes(searchLocation)),
      );
    }

    // Filter by search term (name, description, cuisine)
    if (search) {
      const term = search.toLowerCase();
      restaurants = restaurants.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(term)) ||
          (r.cuisine && r.cuisine.toLowerCase().includes(term)) ||
          (r.description && r.description.toLowerCase().includes(term)),
      );
    }

    // Filter by rating
    if (minRating) {
      restaurants = restaurants.filter(
        (r) => parseFloat(r.rating) >= parseFloat(minRating),
      );
    }

    // Sort
    if (sort) {
      if (sort === "rating") {
        restaurants.sort((a, b) => b.rating - a.rating);
      } else if (sort === "deliveryTime") {
        restaurants.sort((a, b) => a.deliveryTime - b.deliveryTime);
      } else if (sort === "price-low") {
        // Simple heuristic for price string parsing if needed typically frontend handles this
        // but sorting by numeric price if available
      }
    } else {
      // Default sort by rating descending
      restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    sendResponse(res, 200, true, "Restaurants fetched successfully", {
      restaurants,
      count: restaurants.length,
      location: city || location || "All locations",
    });
  } catch (error) {
    console.error("GetRestaurants error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get available cities
// @route   GET /api/restaurants/cities
// @access  Public
exports.getCities = async (req, res) => {
  try {
    const restaurantsData = await getCachedRestaurants();
    const cities = [
      ...new Set(restaurantsData.map((item) => item.city).filter(Boolean)),
    ];

    sendResponse(res, 200, true, "Cities fetched successfully", {
      cities,
    });
  } catch (error) {
    console.error("GetCities error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Search restaurants by location
// @route   GET /api/restaurants/search/location
// @access  Public
exports.searchByLocation = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return sendResponse(res, 400, false, "Search query is required");
    }

    const term = query.toLowerCase();
    const restaurantsData = await getCachedRestaurants();

    let restaurants = restaurantsData.filter(
      (r) =>
        (r.city && r.city.toLowerCase().includes(term)) ||
        (r.address && r.address.toLowerCase().includes(term)) ||
        (r.zipCode && r.zipCode.includes(term)) ||
        (r.state && r.state.toLowerCase().includes(term)),
    );

    const locations = [
      ...new Set(restaurants.map((r) => r.city).filter(Boolean)),
    ];

    sendResponse(res, 200, true, "Location search completed", {
      restaurants,
      locations,
      count: restaurants.length,
    });
  } catch (error) {
    console.error("SearchByLocation error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // We try to get by both 'restaurantId' (from our seed) and 'id' just in case
    // Primary key is likely 'restaurantId' based on seeding script
    const params = {
      TableName: TABLE_NAME,
      Key: { restaurantId: id },
    };

    let result = await dynamoDb.get(params).promise();
    let restaurant = result.Item;

    if (!restaurant) {
      return sendResponse(res, 404, false, "Restaurant not found");
    }

    // In DynamoDB setup, menu might be embedded or separate.
    // Our seed data embedded 'menu' object directly.
    // If we move to separate 'menuItems' table, we would query that here.
    // For now, return the restaurant object which contains embedded 'menu' from seed.

    sendResponse(res, 200, true, "Restaurant fetched successfully", {
      restaurant,
    });
  } catch (error) {
    console.error("GetRestaurant error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get restaurant menu
// @route   GET /api/restaurants/:id/menu
// @access  Public
exports.getRestaurantMenu = async (req, res) => {
  try {
    // Re-use getRestaurant logic
    const { id } = req.params;
    const params = {
      TableName: TABLE_NAME,
      Key: { restaurantId: id },
    };
    const result = await dynamoDb.get(params).promise();
    const restaurant = result.Item;

    if (!restaurant) {
      return sendResponse(res, 404, false, "Restaurant not found");
    }

    // Return embedded menu
    // Flatten it if needed by frontend format, but usually frontend expects categorized
    const menuItems = restaurant.menu || {};

    sendResponse(res, 200, true, "Menu fetched successfully", { menuItems });
  } catch (error) {
    console.error("GetRestaurantMenu error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private (Restaurant owner/Admin)
exports.createRestaurant = async (req, res) => {
  try {
    const restaurantId = uuidv4();
    const restaurantData = {
      restaurantId,
      ...req.body,
      ownerId: req.user.email, // Using email as ID consistent with other parts
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    await dynamoDb
      .put({
        TableName: TABLE_NAME,
        Item: restaurantData,
      })
      .promise();

    invalidateCache();

    sendResponse(res, 201, true, "Restaurant created successfully", {
      restaurant: restaurantData,
    });
  } catch (error) {
    console.error("CreateRestaurant error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Owner/Admin)
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // First fetch to check ownership
    const getParams = { TableName: TABLE_NAME, Key: { restaurantId: id } };
    const result = await dynamoDb.get(getParams).promise();
    const restaurant = result.Item;

    if (!restaurant) {
      return sendResponse(res, 404, false, "Restaurant not found");
    }

    // Check ownership (skip if admin)
    // Note: req.user.role might not be set in all auth flows, adjust as needed
    if (restaurant.ownerId !== req.user.email && req.user.role !== "admin") {
      return sendResponse(
        res,
        403,
        false,
        "Not authorized to update this restaurant",
      );
    }

    // Perform Update
    // constructing UpdateExpression is complex for partial updates,
    // simpler to merge and PUT for this use case unless high concurrency
    const updatedRestaurant = {
      ...restaurant,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await dynamoDb
      .put({
        TableName: TABLE_NAME,
        Item: updatedRestaurant,
      })
      .promise();

    invalidateCache();

    sendResponse(res, 200, true, "Restaurant updated successfully", {
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("UpdateRestaurant error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Owner/Admin)
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const getParams = { TableName: TABLE_NAME, Key: { restaurantId: id } };
    const result = await dynamoDb.get(getParams).promise();
    const restaurant = result.Item;

    if (!restaurant) {
      return sendResponse(res, 404, false, "Restaurant not found");
    }

    if (restaurant.ownerId !== req.user.email && req.user.role !== "admin") {
      return sendResponse(
        res,
        403,
        false,
        "Not authorized to delete this restaurant",
      );
    }

    await dynamoDb
      .delete({
        TableName: TABLE_NAME,
        Key: { restaurantId: id },
      })
      .promise();

    invalidateCache();

    sendResponse(res, 200, true, "Restaurant deleted successfully");
  } catch (error) {
    console.error("DeleteRestaurant error:", error);
    sendResponse(res, 500, false, error.message);
  }
};
