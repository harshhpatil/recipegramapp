import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createPost, getFeed, getAllPosts, getPostById } from "../controller/post.controller.js";

const router = express.Router();

// Specific routes should come before parameterized routes
router.post("/", authMiddleware, createPost);
router.get("/feed", authMiddleware, getFeed);
router.get("/", authMiddleware, getAllPosts);
router.get("/:id", authMiddleware, getPostById);

export default router;
