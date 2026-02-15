import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { toggleSavePost, getSavedPosts, checkIfSaved } from "../controller/save.controller.js";

const router = express.Router();

// Specific routes before parameterized routes
router.get("/", authMiddleware, getSavedPosts);
router.get("/:postId/check", authMiddleware, checkIfSaved);
router.post("/:postId", authMiddleware, toggleSavePost);

export default router;
