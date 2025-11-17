import express from "express";
import { listUsers, updateUserRole } from "../controllers/admin.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes are protected by JWT and admin role
router.get("/users", authenticate, requireAdmin, listUsers);
router.put("/users/:id/role", authenticate, requireAdmin, updateUserRole);

export default router;
