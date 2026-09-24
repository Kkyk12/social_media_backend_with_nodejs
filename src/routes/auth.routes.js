const express = require("express");

const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
    registerValidation,
    loginValidation,
    refreshValidation,
    logoutValidation
} = require("./auth.validation");

const {
    loginLimiter
} = require("../middleware/rate-limit.middleware");

const router = express.Router();

router.post(
    "/register",
    registerValidation,
    validate,
    authController.register
);

router.post(
    "/login",
    loginLimiter,
    loginValidation,
    validate,
    authController.login
);

router.post(
    "/refresh",
    refreshValidation,
    validate,
    authController.refresh
);

router.post(
    "/logout",
    logoutValidation,
    validate,
    authController.logout
);

router.post(
    "/logout-all",
    authenticate,
    authController.logoutAll
);

module.exports = router;