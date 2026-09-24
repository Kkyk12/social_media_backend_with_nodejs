const express = require("express");
const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authenticate, userController.getMe);
router.patch("/me", authenticate, userController.updateProfile);
router.post("/me/presence", authenticate, userController.setPresence);
router.get("/search", authenticate, userController.searchUsers);
router.post("/:userId/block", authenticate, userController.blockUser);
router.delete("/:userId/block", authenticate, userController.unblockUser);

module.exports = router;
