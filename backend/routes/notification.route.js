import express from 'express';
import { listNotifications, markRead } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, listNotifications);
router.patch('/:id/read', authenticate, markRead);

export default router;
