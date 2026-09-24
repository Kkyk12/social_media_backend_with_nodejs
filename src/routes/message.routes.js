const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const controller = require("../controllers/message.controller");

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.get("/search", controller.search);
router.get("/", controller.list);
router.post("/", controller.send);
router.post("/read", controller.markRead);
router.patch("/:messageId", controller.edit);
router.delete("/:messageId", controller.remove);

module.exports = router;
