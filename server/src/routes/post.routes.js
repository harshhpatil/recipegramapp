import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createPost, getFeed, getAllPosts, getPostById, updatePost, deletePost, searchPosts, getTrendingPosts } from "../controller/post.controller.js";

const router = express.Router();

// Specific routes should come before parameterized routes
router.post("/", authMiddleware, createPost);
router.get("/feed", authMiddleware, getFeed);
router.get("/search", authMiddleware, searchPosts);
router.get("/trending", authMiddleware, getTrendingPosts);
router.get("/", authMiddleware, getAllPosts);
router.get("/:id", authMiddleware, getPostById);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
