import express from "express";
import { getAllUsers, updateUserRole, deleteUser, getDashboardStats } from "../controllers/admin.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// User management routes
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Dashboard stats
router.get("/stats", getDashboardStats);

export default router;
