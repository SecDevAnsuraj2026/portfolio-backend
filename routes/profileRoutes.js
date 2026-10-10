import express from 'express';

const router = express.Router();
import profileController from '../controllers/profileController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

router.get('/', profileController.getProfile);
router.put('/', requireAdmin, profileController.updateProfile);

export default router;
