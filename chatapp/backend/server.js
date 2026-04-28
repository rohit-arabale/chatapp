const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { initSocket } = require("./socket/socketHandler");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(httpServer, {
  cors: {
    origin: clientUrl,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => res.send("ChatApp API is running"));

initSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
