const Project = require('../models/Project');
const db = require('../config/db');
const fallback = require('../config/fallbackData');
const { getUploadedFileUrl } = require('../middleware/upload');

function validateProject(projectData) {
  if (!projectData.title || !projectData.description) {
    throw new Error('Project title and description are required');
  }
}

function getFallbackProjectById(id) {
  return fallback.getProjects().find((item) => String(item.id) === String(id)) || null;
}

const projectController = {
  getAllProjects: async (req, res) => {
    try {
      if (db.useFallback) {
        return res.json({ projects: fallback.getProjects() });
      }
      const projects = await Project.getAll();
      res.json({ projects });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;
      const project = await Project.getById(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ project });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createProject: async (req, res) => {
    try {
      const projectData = { ...req.body };
      projectData.image_url = req.file ? getUploadedFileUrl(req.file) : 'N/A';
      projectData.imageUrl = projectData.image_url;
      validateProject(projectData);
      if (db.useFallback) {
        const newProject = fallback.addProject(projectData);
        return res.status(201).json({ project: newProject });
      }
      const newProject = await Project.create(projectData);
      res.status(201).json({ project: newProject });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const projectData = { ...req.body };
      validateProject(projectData);
      if (db.useFallback) {
        const existingProject = getFallbackProjectById(id);
        if (!existingProject) {
          return res.status(404).json({ error: 'Project not found' });
        }

        projectData.image_url = req.file
          ? getUploadedFileUrl(req.file)
          : existingProject.imageUrl || 'N/A';
        projectData.imageUrl = projectData.image_url;

        const updatedProject = fallback.updateProject(id, projectData);
        if (!updatedProject) {
          return res.status(404).json({ error: 'Project not found' });
        }
        return res.json({ project: updatedProject });
      }
      const existingProject = await Project.getById(id);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      projectData.image_url = req.file
        ? getUploadedFileUrl(req.file)
        : existingProject.imageUrl || 'N/A';
      projectData.imageUrl = projectData.image_url;

      const updatedProject = await Project.update(id, projectData);
      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ project: updatedProject });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;
      if (db.useFallback) {
        const deletedProject = fallback.deleteProject(id);
        if (!deletedProject) {
          return res.status(404).json({ error: 'Project not found' });
        }
        return res.json({ project: deletedProject });
      }
      const deletedProject = await Project.delete(id);
      if (!deletedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ project: deletedProject });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = projectController;
