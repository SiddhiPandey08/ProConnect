import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import { messageLimiter } from "../middlewares/rateLimiter.js";
import {
  getConversations,
  getMessageThread,
  markMessagesRead,
  sendMessage,
} from "../controllers/messageControllers.js";
import { sendMessageSchema } from "../validators/messageValidators.js";

const router = Router();

router.get("/messages/conversations", authMiddleware, getConversations);
router.post(
  "/messages/:userId",
  authMiddleware,
  messageLimiter,
  validate(sendMessageSchema),
  sendMessage,
);
router.get("/messages/:userId", authMiddleware, getMessageThread);
router.patch("/messages/:userId/read", authMiddleware, markMessagesRead);

export default router;
