import express from "express";
import { register, login } from "../controller/auth.controller.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";
import { validateRegistration, validateLogin } from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, validateRegistration, register);
router.post("/login", authLimiter, validateLogin, login);

export default router;
    