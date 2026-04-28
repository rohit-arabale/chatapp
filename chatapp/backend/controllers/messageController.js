const Message = require("../models/Message");

const getAttachmentType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return "image";
  return "document";
};

// @desc    Get message history between two users
// @route   GET /api/messages/:userId
const getMessages = async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message (REST fallback)
// @route   POST /api/messages/send
const sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  const cleanText = text?.trim() || "";

  try {
    if (!receiverId) {
      return res.status(400).json({ message: "Receiver is required" });
    }

    if (!cleanText && !req.file) {
      return res.status(400).json({ message: "Message text or attachment is required" });
    }

    let attachment;
    if (req.file) {
      attachment = {
        url: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileType: getAttachmentType(req.file.mimetype),
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: cleanText,
      attachment,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forward a message to another user
// @route   POST /api/messages/forward
const forwardMessage = async (req, res) => {
  const { messageId, receiverId } = req.body;

  try {
    if (!messageId || !receiverId) {
      return res.status(400).json({ message: "Message and receiver are required" });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot forward a message to yourself" });
    }

    const originalMessage = await Message.findOne({
      _id: messageId,
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    });

    if (!originalMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    const forwardedMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: originalMessage.text,
      attachment: originalMessage.attachment,
      forwardedFrom: originalMessage._id,
    });

    res.status(201).json(forwardedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage, forwardMessage };
