const express = require("express");
const User = require("../models/User");
const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authenticate, userController.getMe);

module.exports = router;