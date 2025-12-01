import express from "express";
import { getUserStats, getUserOrders, getUserProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/stats", getUserStats);
router.get("/orders", getUserOrders);
router.get("/profile", getUserProfile);

export default router;
