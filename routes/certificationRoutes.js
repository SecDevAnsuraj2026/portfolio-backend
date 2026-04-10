const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');
const { createUpload } = require('../middleware/upload');
const { requireAdmin } = require('../middleware/authMiddleware');
const upload = createUpload('certification');

router.get('/', certificationController.getAllCertifications);
router.get('/:id', certificationController.getCertificationById);
router.post('/', requireAdmin, upload.single('image'), certificationController.createCertification);
router.put('/:id', requireAdmin, upload.single('image'), certificationController.updateCertification);
router.delete('/:id', requireAdmin, certificationController.deleteCertification);

module.exports = router;
