import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createPost, getFeed, getAllPosts, getPostById } from "../controller/post.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/feed", authMiddleware, getFeed);
router.get("/:id", authMiddleware, getPostById);
router.get("/", authMiddleware, getAllPosts);

export default router;
