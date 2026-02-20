import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { apiLimiter } from "../middleware/rateLimiter.middleware.js";
import { toggleFollow, checkIfFollowing } from "../controller/follow.controller.js";

const router = express.Router();

// Specific routes before parameterized routes
router.get("/:userId/check", apiLimiter, authMiddleware, checkIfFollowing);
router.post("/:userId", authMiddleware, toggleFollow);

export default router;
