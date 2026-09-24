const {
    body
} = require("express-validator");

const registerValidation = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 32 })
        .withMessage("Username must be 3-32 characters"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),

    body("displayName")
        .trim()
        .isLength({ min: 1, max: 64 })
        .withMessage("Display name must be 1-64 characters")
];

const loginValidation = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

const refreshValidation = [
    body("refreshToken")
        .notEmpty()
        .withMessage("Refresh token is required")
];

const logoutValidation = [
    body("refreshToken")
        .notEmpty()
        .withMessage("Refresh token is required")
];

module.exports = {
    registerValidation,
    loginValidation,
    refreshValidation,
    logoutValidation
};