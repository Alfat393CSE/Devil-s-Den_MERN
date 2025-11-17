import express from 'express';
import { createSale, listSales } from '../controllers/sales.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, createSale);
router.post('/checkout', authenticate, createSale);
router.get('/', authenticate, requireAdmin, listSales);

// quick health check for this router
router.get('/test', (req, res) => res.json({ ok: true, route: 'purchases' }));

export default router;
