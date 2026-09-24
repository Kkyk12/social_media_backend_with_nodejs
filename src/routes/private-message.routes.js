const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const controller = require("../controllers/message.controller");

const router = express.Router();
router.post("/private", authenticate, controller.sendPrivate);

module.exports = router;
