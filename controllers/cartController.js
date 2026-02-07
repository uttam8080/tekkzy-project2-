const { dynamoDb } = require("../config/dynamodb");
const { v4: uuidv4 } = require("uuid");

const TABLE_NAME = "carts";
const MENU_ITEMS_TABLE = "menuItems";
const RESTAURANTS_TABLE = "restaurants";

// Helper function to send response
const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = { success, message };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

// Helper to find cart by userId
const findCartByUserId = async (userId) => {
    const params = {
        TableName: TABLE_NAME,
        IndexName: "userIdIndex",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
            ":uid": userId,
        },
    };

    const result = await dynamoDb.query(params).promise();
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};

// Helper to calculate totals
const calculateTotals = (items, deliveryFee = 50) => {
    let subtotal = 0;
    items.forEach((item) => {
        subtotal += parseFloat(item.price) * item.quantity;
    });

    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax + deliveryFee;

    return {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
    };
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.email; // Consistent with authController
        let cart = await findCartByUserId(userId);

        if (!cart) {
            // Create empty cart if not exists
            const cartId = uuidv4();
            cart = {
                cartId,
                userId,
                items: [],
                subtotal: "0.00",
                tax: "0.00",
                deliveryFee: "0.00",
                total: "0.00",
                createdAt: new Date().toISOString(),
            };
            await dynamoDb.put({ TableName: TABLE_NAME, Item: cart }).promise();
        }

        sendResponse(res, 200, true, "Cart fetched successfully", { cart });
    } catch (error) {
        console.error("GetCart error:", error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.email;
        const { menuItemId, quantity, specialInstructions } = req.body;

        if (!menuItemId || !quantity) {
            return sendResponse(res, 400, false, "Menu item and quantity are required");
        }

        // 1. Fetch MenuItem
        const menuResult = await dynamoDb.get({
            TableName: MENU_ITEMS_TABLE,
            Key: { menuItemId: String(menuItemId) }
        }).promise();

        let menuItem = menuResult.Item;

        if (!menuItem) {
            // Fallback: Check if it's in the restaurant's embedded menu
            // Use scan if MenuItem not found in main table
            const restResult = await dynamoDb.scan({
                TableName: RESTAURANTS_TABLE
            }).promise();

            for (const r of restResult.Items) {
                if (r.menu) {
                    for (const cat in r.menu) {
                        const found = r.menu[cat].find(i => String(i.id) === String(menuItemId) || String(i.menuItemId) === String(menuItemId));
                        if (found) {
                            menuItem = found;
                            menuItem.restaurantId = r.restaurantId;
                            break;
                        }
                    }
                }
                if (menuItem) break;
            }
        }

        if (!menuItem) {
            return sendResponse(res, 404, false, `Menu item ${menuItemId} not found`);
        }

        // 2. Fetch or Create Cart
        let cart = await findCartByUserId(userId);
        if (!cart) {
            const cartId = uuidv4();
            cart = {
                cartId,
                userId,
                items: [],
                subtotal: "0.00",
                tax: "0.00",
                deliveryFee: "0.00",
                total: "0.00",
                createdAt: new Date().toISOString(),
            };
        }

        // 3. Check restaurant consistency
        if (cart.restaurantId && String(cart.restaurantId) !== String(menuItem.restaurantId) && cart.items.length > 0) {
            return sendResponse(res, 400, false, "Cannot add items from different restaurants. Clear cart first.");
        }

        // Update restaurantId if new or empty
        cart.restaurantId = String(menuItem.restaurantId);

        // 4. Update items
        const existingIndex = cart.items.findIndex(i => String(i.menuItemId) === String(menuItemId));
        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += parseInt(quantity);
            if (specialInstructions) cart.items[existingIndex].specialInstructions = specialInstructions;
        } else {
            cart.items.push({
                menuItemId,
                name: menuItem.name,
                price: menuItem.price,
                quantity,
                specialInstructions,
                image: menuItem.image
            });
        }

        // 5. Calculate totals
        const totals = calculateTotals(cart.items);
        Object.assign(cart, totals);
        cart.updatedAt = new Date().toISOString();

        // 6. Save
        await dynamoDb.put({ TableName: TABLE_NAME, Item: cart }).promise();

        sendResponse(res, 200, true, "Item added to cart", { cart });
    } catch (error) {
        console.error("AddToCart error:", error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/item/:menuItemId
// @access  Private
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.email;
        const { menuItemId } = req.params;
        const { quantity } = req.body;

        let cart = await findCartByUserId(userId);
        if (!cart) return sendResponse(res, 404, false, "Cart not found");

        const itemIndex = cart.items.findIndex(i => String(i.menuItemId) === String(menuItemId));
        if (itemIndex === -1) return sendResponse(res, 404, false, "Item not found in cart");

        const newQty = parseInt(quantity);
        if (newQty <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = newQty;
        }

        // Reset restaurantId if cart empty
        if (cart.items.length === 0) cart.restaurantId = null;

        const totals = calculateTotals(cart.items);
        Object.assign(cart, totals);
        cart.updatedAt = new Date().toISOString();

        await dynamoDb.put({ TableName: TABLE_NAME, Item: cart }).promise();

        sendResponse(res, 200, true, "Cart updated", { cart });
    } catch (error) {
        console.error("UpdateCartItem error:", error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/item/:menuItemId
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.email;
        const { menuItemId } = req.params;

        let cart = await findCartByUserId(userId);
        if (!cart) return sendResponse(res, 404, false, "Cart not found");

        cart.items = cart.items.filter(i => String(i.menuItemId) !== String(menuItemId));

        if (cart.items.length === 0) cart.restaurantId = null;

        const totals = calculateTotals(cart.items);
        Object.assign(cart, totals);
        cart.updatedAt = new Date().toISOString();

        await dynamoDb.put({ TableName: TABLE_NAME, Item: cart }).promise();

        sendResponse(res, 200, true, "Item removed", { cart });
    } catch (error) {
        console.error("RemoveFromCart error:", error);
        sendResponse(res, 500, false, error.message);
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.email;
        let cart = await findCartByUserId(userId);

        if (cart) {
            cart.items = [];
            cart.restaurantId = null;
            cart.subtotal = "0.00";
            cart.tax = "0.00";
            cart.total = "0.00";
            cart.updatedAt = new Date().toISOString();
            await dynamoDb.put({ TableName: TABLE_NAME, Item: cart }).promise();
        }

        sendResponse(res, 200, true, "Cart cleared successfully");
    } catch (error) {
        console.error("ClearCart error:", error);
        sendResponse(res, 500, false, error.message);
    }
};
