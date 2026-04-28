const express = require("express");
const router = express.Router();
const { getMessages, sendMessage, forwardMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const uploadAttachment = require("../middleware/uploadMiddleware");

router.post("/send", protect, uploadAttachment, sendMessage);
router.post("/forward", protect, forwardMessage);
router.get("/:userId", protect, getMessages);

module.exports = router;
