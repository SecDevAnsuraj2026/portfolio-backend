const Experience = require('../models/Experience');
const db = require('../config/db');
const fallback = require('../config/fallbackData');

function validateExperience(experienceData) {
  if (!experienceData.role || !experienceData.organization || !(experienceData.startDate || experienceData.start_date)) {
    throw new Error('Experience role, organization, and start date are required');
  }
}

const experienceController = {
  getAllExperience: async (req, res) => {
    try {
      if (db.useFallback) {
        return res.json({ experience: fallback.getExperience() });
      }
      const experience = await Experience.getAll();
      res.json({ experience });
    } catch (error) {
      console.error('Error fetching experience:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createExperience: async (req, res) => {
    try {
      validateExperience(req.body);
      if (db.useFallback) {
        const newExperience = fallback.addExperience(req.body);
        return res.status(201).json({ experience: newExperience });
      }
      const newExperience = await Experience.create(req.body);
      res.status(201).json({ experience: newExperience });
    } catch (error) {
      console.error('Error creating experience:', error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  updateExperience: async (req, res) => {
    try {
      const { id } = req.params;
      validateExperience(req.body);
      if (db.useFallback) {
        const updatedExperience = fallback.updateExperience(id, req.body);
        if (!updatedExperience) {
          return res.status(404).json({ error: 'Experience not found' });
        }
        return res.json({ experience: updatedExperience });
      }
      const updatedExperience = await Experience.update(id, req.body);
      if (!updatedExperience) {
        return res.status(404).json({ error: 'Experience not found' });
      }
      return res.json({ experience: updatedExperience });
    } catch (error) {
      console.error('Error updating experience:', error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  deleteExperience: async (req, res) => {
    try {
      const { id } = req.params;
      if (db.useFallback) {
        const deletedExperience = fallback.deleteExperience(id);
        if (!deletedExperience) {
          return res.status(404).json({ error: 'Experience not found' });
        }
        return res.json({ experience: deletedExperience });
      }
      const deletedExperience = await Experience.delete(id);
      if (!deletedExperience) {
        return res.status(404).json({ error: 'Experience not found' });
      }
      return res.json({ experience: deletedExperience });
    } catch (error) {
      console.error('Error deleting experience:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = experienceController;
