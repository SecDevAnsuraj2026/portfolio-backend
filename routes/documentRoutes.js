import express from 'express';

const router = express.Router();
import documentController from '../controllers/documentController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { createUpload } from '../middleware/upload.js';

const uploadDocument = createUpload('document').single('document');

// Middleware for download endpoint to ensure proper headers
const downloadMiddleware = (req, res, next) => {
  // Prevent caching of previous responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

router.get('/', documentController.getAll);
router.get('/download/:type', downloadMiddleware, documentController.downloadDocument);
router.get('/:type', documentController.getByType);
router.post('/upload', requireAdmin, uploadDocument, documentController.upload);
router.delete('/:type', requireAdmin, documentController.deleteDocument);

export default router;
