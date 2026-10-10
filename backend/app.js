import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import User from "./models/userModel.js";
import ConnectionReq from "./models/connectionModel.js";

dotenv.config();
const app = express();

export const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: "*" } });

const onlineUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    const user = await User.findOne({ token }).select("_id");
    if (!user) return next(new Error("Invalid or expired token"));

    socket.user = user;
    next();
  } catch (err) {
    next(err);
  }
});

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();
  const room = `user:${userId}`;
  socket.join(room);

  const connectionCount = (onlineUsers.get(userId) || 0) + 1;
  onlineUsers.set(userId, connectionCount);
  io.emit("presence", { userId, online: true });

  socket.on("typing", async ({ receiverId } = {}) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(receiverId)) return;

      const connected = await ConnectionReq.exists({
        status_accepted: true,
        $or: [
          { fromUserId: socket.user._id, toUserId: receiverId },
          { fromUserId: receiverId, toUserId: socket.user._id },
        ],
      });

      if (connected) {
        io.to(`user:${receiverId}`).emit("typing", { userId });
      }
    } catch (err) {
      socket.emit("socket_error", { message: err.message });
    }
  });

  socket.on("disconnect", () => {
    const remainingConnections = (onlineUsers.get(userId) || 1) - 1;
    if (remainingConnections > 0) {
      onlineUsers.set(userId, remainingConnections);
      return;
    }

    onlineUsers.delete(userId);
    io.emit("presence", { userId, online: false });
  });
});

app.use(
  cors({
    origin: ["http://localhost:3000", "https://pro-connect-roan.vercel.app"],
    credentials: true,
  }),
);
app.use(globalLimiter);
app.use(express.json());

app.use(mongoSanitize());
app.use(xss());

app.use(express.static("uploads"));

app.use(userRoutes);
app.use(postRoutes);
app.use(notificationRoutes);
app.use(messageRoutes);
app.use(errorHandler);

export default app;
