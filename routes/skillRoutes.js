const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', skillController.getAllSkills);
router.post('/', requireAdmin, skillController.createSkill);
router.put('/:id', requireAdmin, skillController.updateSkill);
router.delete('/:id', requireAdmin, skillController.deleteSkill);

module.exports = router;
