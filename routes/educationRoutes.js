import express from 'express';

const router = express.Router();
import educationController from '../controllers/educationController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

router.get('/', educationController.getAllEducation);
router.post('/', requireAdmin, educationController.createEducation);
router.put('/:id', requireAdmin, educationController.updateEducation);
router.delete('/:id', requireAdmin, educationController.deleteEducation);

export default router;
