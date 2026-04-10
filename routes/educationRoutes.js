const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', educationController.getAllEducation);
router.post('/', requireAdmin, educationController.createEducation);
router.put('/:id', requireAdmin, educationController.updateEducation);
router.delete('/:id', requireAdmin, educationController.deleteEducation);

module.exports = router;
