import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

dotenv.config();
const app = express();

export const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("join_room", (userId) => socket.join(userId));
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
app.use(errorHandler);
