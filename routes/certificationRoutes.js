import express from 'express';

const router = express.Router();
import certificationController from '../controllers/certificationController.js';
import { createUpload } from '../middleware/upload.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
const upload = createUpload('certification');

router.get('/', certificationController.getAllCertifications);
router.get('/:id', certificationController.getCertificationById);
router.post('/', requireAdmin, upload.single('image'), certificationController.createCertification);
router.put('/:id', requireAdmin, upload.single('image'), certificationController.updateCertification);
router.delete('/:id', requireAdmin, certificationController.deleteCertification);

export default router;
