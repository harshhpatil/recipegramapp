import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateComment } from "../middleware/validation.middleware.js";
import { addComment, getComments, deleteComment } from "../controller/comment.controller.js";

const router = express.Router();

router.post("/:postId", authMiddleware, validateComment, addComment);
router.get("/:postId", authMiddleware, getComments);
router.delete("/:commentId", authMiddleware, deleteComment);

export default router;
