import mongoose from "mongoose";
import dotenv from "dotenv";
import { httpServer } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 9090;
const MONGODB_URI = process.env.MONGODB_URI;

const start = async () => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

start();
