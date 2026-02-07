const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Encrypt password
const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (enteredPassword, password) => {
    return await bcrypt.compare(enteredPassword, password);
};

// Get Signed JWT Token
const getSignedJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Format response
const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = { success, message };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

module.exports = {
    encryptPassword,
    comparePassword,
    getSignedJwtToken,
    sendResponse
};
