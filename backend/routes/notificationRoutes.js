import { Router } from "express";
import {
  getNotifications,
  markNotificationsRead,
} from "../controllers/notificationControllers.js";

const router = Router();

router.get("/notifications", getNotifications);
router.post("/notifications/mark_read", markNotificationsRead);

export default router;
