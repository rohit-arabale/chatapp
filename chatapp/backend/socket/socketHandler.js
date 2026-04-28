const User = require("../models/User");
const Message = require("../models/Message");

// Map: userId => socketId
const onlineUsers = new Map();

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("user:online", async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("users:online", Array.from(onlineUsers.keys()));
      console.log(`User online: ${userId}`);
    });

    socket.on("message:send", async ({ senderId, receiverId, text }) => {
      try {
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          text,
        });

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message:receive", message);
        }

        socket.emit("message:receive", message);
      } catch (err) {
        console.error("Message send error:", err.message);
      }
    });

    socket.on("message:share", ({ receiverId, message }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message:receive", message);
      }
    });

    socket.on("disconnect", async () => {
      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, { isOnline: false });
        io.emit("users:online", Array.from(onlineUsers.keys()));
        console.log(`User offline: ${userId}`);
      }
    });
  });
};

module.exports = { initSocket };
