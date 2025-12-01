import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  approveOrder,
  rejectOrder,
  cancelOrder,
  deleteOrder,
  deleteMultipleOrders,
  getOrderStats
} from "../controllers/order.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes (protected + admin only) - must come before parameterized routes
router.get("/stats/summary", authenticate, requireAdmin, getOrderStats);
router.get("/all", authenticate, requireAdmin, getAllOrders);
router.patch("/:id/approve", authenticate, requireAdmin, approveOrder);
router.patch("/:id/reject", authenticate, requireAdmin, rejectOrder);

// User routes (protected)
router.post("/", authenticate, createOrder);
router.get("/my-orders", authenticate, getUserOrders);
router.get("/:id", authenticate, getOrderById);
router.patch("/:id/cancel", authenticate, cancelOrder);
router.delete("/bulk-delete", authenticate, deleteMultipleOrders);
router.delete("/:id", authenticate, deleteOrder);

export default router;
