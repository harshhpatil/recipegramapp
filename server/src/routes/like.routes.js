import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { toggleLike, checkIfLiked, getLikes } from "../controller/like.controller.js";

const router = express.Router();

// Specific routes should come before parameterized routes
router.get("/:postId/check", authMiddleware, checkIfLiked);
router.get("/:postId", authMiddleware, getLikes);
router.post("/:postId", authMiddleware, toggleLike);

export default router;
