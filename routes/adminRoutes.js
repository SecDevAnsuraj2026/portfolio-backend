const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.get('/session', requireAdmin, adminController.session);

module.exports = router;
