import express from "express";
import { register, login } from "../controller/auth.controller.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;
    