import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from "../controller/notification.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.patch("/read-all", authMiddleware, markAllAsRead);
router.patch("/:notificationId/read", authMiddleware, markAsRead);

export default router;
