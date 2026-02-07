const dynamoService = require("../utils/dynamoService");

// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

// @desc    Get all menu items
// @route   GET /api/menu-items
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const { restaurantId, category, search, vegetarian, vegan } = req.query;

    let whereClause = { isAvailable: true };

    if (restaurantId) {
      whereClause.restaurantId = restaurantId;
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    if (vegetarian === "true") {
      whereClause.isVegetarian = true;
    }

    if (vegan === "true") {
      whereClause.isVegan = true;
    }

    const menuItems = await MenuItem.findAll({
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name", "cuisine"],
        },
      ],
      order: [["name", "ASC"]],
    });

    sendResponse(res, 200, true, "Menu items fetched successfully", {
      menuItems,
    });
  } catch (error) {
    console.error("GetMenuItems error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu-items/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id, {
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name", "cuisine", "rating"],
        },
      ],
    });

    if (!menuItem) {
      return sendResponse(res, 404, false, "Menu item not found");
    }

    sendResponse(res, 200, true, "Menu item fetched successfully", {
      menuItem,
    });
  } catch (error) {
    console.error("GetMenuItem error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Create menu item
// @route   POST /api/menu-items
// @access  Private (Restaurant owner/Admin)
exports.createMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.body;

    // Verify restaurant exists and user owns it
    const restaurant = await Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      return sendResponse(res, 404, false, "Restaurant not found");
    }

    if (restaurant.ownerId !== req.user.id && req.user.role !== "admin") {
      return sendResponse(
        res,
        403,
        false,
        "Not authorized to add items to this restaurant",
      );
    }

    const menuItem = await MenuItem.create(req.body);

    sendResponse(res, 201, true, "Menu item created successfully", {
      menuItem,
    });
  } catch (error) {
    console.error("CreateMenuItem error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu-items/:id
// @access  Private (Owner/Admin)
exports.updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id, {
      include: [
        {
          model: Restaurant,
          as: "restaurant",
        },
      ],
    });

    if (!menuItem) {
      return sendResponse(res, 404, false, "Menu item not found");
    }

    // Check ownership
    if (
      menuItem.restaurant.ownerId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return sendResponse(
        res,
        403,
        false,
        "Not authorized to update this menu item",
      );
    }

    await menuItem.update(req.body);

    sendResponse(res, 200, true, "Menu item updated successfully", {
      menuItem,
    });
  } catch (error) {
    console.error("UpdateMenuItem error:", error);
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu-items/:id
// @access  Private (Owner/Admin)
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id, {
      include: [
        {
          model: Restaurant,
          as: "restaurant",
        },
      ],
    });

    if (!menuItem) {
      return sendResponse(res, 404, false, "Menu item not found");
    }

    // Check ownership
    if (
      menuItem.restaurant.ownerId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return sendResponse(
        res,
        403,
        false,
        "Not authorized to delete this menu item",
      );
    }

    await menuItem.destroy();

    sendResponse(res, 200, true, "Menu item deleted successfully");
  } catch (error) {
    console.error("DeleteMenuItem error:", error);
    sendResponse(res, 500, false, error.message);
  }
};
