const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// Socket.io
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("joinRoom", (roomId) => socket.join(roomId));
  socket.on("sendMessage", (data) => io.to(data.roomId).emit("receiveMessage", data));
  socket.on("disconnect", () => console.log("User disconnected"));
});

// MongoDB + Server Start
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobportal")
  .then(() => {
    console.log("✅ MongoDB Connected");
    server.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.log("❌ MongoDB Error:", err));