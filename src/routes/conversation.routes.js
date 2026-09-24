const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const controller = require("../controllers/conversation.controller");

const router = express.Router();
router.use(authenticate);

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:conversationId", controller.getOne);
router.post("/:conversationId/members", controller.addMember);
router.delete("/:conversationId/members/:userId", controller.removeMember);
router.patch("/:conversationId/members/:userId/role", controller.updateRole);
router.post("/:conversationId/leave", controller.leave);
router.post("/:conversationId/join", controller.join);

module.exports = router;
