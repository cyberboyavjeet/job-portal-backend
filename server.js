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
  cors: { origin: "https://job-portal-frontend-iota-ecru.vercel.app", methods: ["GET", "POST"] },
});

// Middleware
app.use(cors({ origin: "https://job-portal-frontend-iota-ecru.vercel.app" }));
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
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 10000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err);
  });
