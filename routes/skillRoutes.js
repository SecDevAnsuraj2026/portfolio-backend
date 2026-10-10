import express from 'express';

const router = express.Router();
import skillController from '../controllers/skillController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

router.get('/', skillController.getAllSkills);
router.post('/', requireAdmin, skillController.createSkill);
router.put('/:id', requireAdmin, skillController.updateSkill);
router.delete('/:id', requireAdmin, skillController.deleteSkill);

export default router;
