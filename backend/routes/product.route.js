import express from "express";
import { createProduct, deleteProduct, getProducts, getProduct, updateProduct, getSubmissions, approveProduct, rejectProduct, updateStock } from "../controllers/product.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// public
router.get("/", getProducts);

// submit product (user) - creates unapproved submission
router.post('/submit', authenticate, createProduct);

// admin: list submissions - MUST come before /:id route
router.get('/submissions', authenticate, requireAdmin, getSubmissions);

// admin: approve/reject/stock - MUST come before /:id route
router.patch('/:id/approve', authenticate, requireAdmin, approveProduct);
router.patch('/:id/reject', authenticate, requireAdmin, rejectProduct);
router.patch('/:id/stock', authenticate, requireAdmin, updateStock);

// public get single product - MUST come after specific routes
router.get("/:id", getProduct);

// protected - only admins can create/update/delete
router.post("/", authenticate, requireAdmin, createProduct);
router.put("/:id", authenticate, requireAdmin, updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

export default router;