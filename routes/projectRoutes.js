const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { createUpload } = require('../middleware/upload');
const { requireAdmin } = require('../middleware/authMiddleware');
const upload = createUpload('project');

// Routes for projects
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', requireAdmin, upload.single('image'), projectController.createProject);
router.put('/:id', requireAdmin, upload.single('image'), projectController.updateProject);
router.delete('/:id', requireAdmin, projectController.deleteProject);

module.exports = router;
