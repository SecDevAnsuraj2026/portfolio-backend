import express from 'express';

const router = express.Router();
import projectController from '../controllers/projectController.js';
import { createUpload } from '../middleware/upload.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
const upload = createUpload('project');

// Routes for projects
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', requireAdmin, upload.single('image'), projectController.createProject);
router.put('/:id', requireAdmin, upload.single('image'), projectController.updateProject);
router.delete('/:id', requireAdmin, projectController.deleteProject);

export default router;
