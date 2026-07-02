import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const maxRequests = process.env.NODE_ENV === "production" ? 100 : 1000;

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxRequests,
  message: { message: "Too many requests, please try again later" },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 100, // stricter for auth
  message: { message: "Too many auth attempts, please try again later" },
});
