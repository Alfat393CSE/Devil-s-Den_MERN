import express from "express";
import { createProduct, deleteProduct, getProducts, updateProduct, getSubmissions, approveProduct, rejectProduct } from "../controllers/product.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// public
router.get("/", getProducts);

// protected - only admins can create/update/delete
router.post("/", authenticate, requireAdmin, createProduct);
router.put("/:id", authenticate, requireAdmin, updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

// submit product (user) - creates unapproved submission
router.post('/submit', authenticate, createProduct);

// admin: list submissions
router.get('/submissions', authenticate, requireAdmin, getSubmissions);
router.patch('/:id/approve', authenticate, requireAdmin, approveProduct);
router.patch('/:id/reject', authenticate, requireAdmin, rejectProduct);

export default router;