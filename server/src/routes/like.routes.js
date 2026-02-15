import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { toggleLike, checkIfLiked } from "../controller/like.controller.js";

const router = express.Router();

// Specific routes should come before parameterized routes
router.get("/:postId/check", authMiddleware, checkIfLiked);
router.post("/:postId", authMiddleware, toggleLike);

export default router;
