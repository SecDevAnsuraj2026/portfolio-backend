import express from 'express';

const router = express.Router();
import experienceController from '../controllers/experienceController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

router.get('/', experienceController.getAllExperience);
router.post('/', requireAdmin, experienceController.createExperience);
router.put('/:id', requireAdmin, experienceController.updateExperience);
router.delete('/:id', requireAdmin, experienceController.deleteExperience);

export default router;
