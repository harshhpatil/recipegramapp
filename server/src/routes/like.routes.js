import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { toggleLike, checkIfLiked } from "../controller/like.controller.js";

const router = express.Router();

router.post("/:postId", authMiddleware, toggleLike);
router.get("/:postId/check", authMiddleware, checkIfLiked);

export default router;
