const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', experienceController.getAllExperience);
router.post('/', requireAdmin, experienceController.createExperience);
router.put('/:id', requireAdmin, experienceController.updateExperience);
router.delete('/:id', requireAdmin, experienceController.deleteExperience);

module.exports = router;
