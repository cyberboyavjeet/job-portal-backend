const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { authMiddleware } = require("../middleware/authMiddleware");

// Send message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiverId, message, roomId } = req.body;
    const msg = await Message.create({
      roomId, sender: req.user.id,
      receiver: receiverId, message,
    });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages by roomId
router.get("/:roomId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all chat users for admin
router.get("/admin/chats", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    }).populate("sender receiver", "name role");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;