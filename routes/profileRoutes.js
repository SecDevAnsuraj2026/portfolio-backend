const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', profileController.getProfile);
router.put('/', requireAdmin, profileController.updateProfile);

module.exports = router;
