import express from 'express';

const router = express.Router();
import adminController from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.get('/session', requireAdmin, adminController.session);

export default router;
