import express from 'express';
import { createSale, listSales, deleteSale, getSaleById, getUserSales } from '../controllers/sales.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, createSale);
router.post('/checkout', authenticate, createSale);
router.get('/my-purchases', authenticate, getUserSales); // User's own purchase history
router.get('/', authenticate, requireAdmin, listSales);
router.get('/:id', authenticate, getSaleById); // Changed: Now allows users to view their own sales with authorization check in controller
router.delete('/:id', authenticate, requireAdmin, deleteSale);

// quick health check for this router
router.get('/test', (req, res) => res.json({ ok: true, route: 'purchases' }));

export default router;
