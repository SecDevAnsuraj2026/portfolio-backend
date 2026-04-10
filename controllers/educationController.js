const Education = require('../models/Education');
const db = require('../config/db');
const fallback = require('../config/fallbackData');

function validateEducation(educationData) {
  if (!educationData.degree || !educationData.institution) {
    throw new Error('Education degree and institution are required');
  }
}

const educationController = {
  getAllEducation: async (req, res) => {
    try {
      if (db.useFallback) {
        return res.json({ education: fallback.getEducation() });
      }
      const education = await Education.getAll();
      res.json({ education });
    } catch (error) {
      console.error('Error fetching education:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createEducation: async (req, res) => {
    try {
      validateEducation(req.body);
      if (db.useFallback) {
        const newEducation = fallback.addEducation(req.body);
        return res.status(201).json({ education: newEducation });
      }
      const newEducation = await Education.create(req.body);
      res.status(201).json({ education: newEducation });
    } catch (error) {
      console.error('Error creating education:', error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  updateEducation: async (req, res) => {
    try {
      const { id } = req.params;
      validateEducation(req.body);
      if (db.useFallback) {
        const updatedEducation = fallback.updateEducation(id, req.body);
        if (!updatedEducation) {
          return res.status(404).json({ error: 'Education record not found' });
        }
        return res.json({ education: updatedEducation });
      }
      const updatedEducation = await Education.update(id, req.body);
      if (!updatedEducation) {
        return res.status(404).json({ error: 'Education record not found' });
      }
      return res.json({ education: updatedEducation });
    } catch (error) {
      console.error('Error updating education:', error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  deleteEducation: async (req, res) => {
    try {
      const { id } = req.params;
      if (db.useFallback) {
        const deletedEducation = fallback.deleteEducation(id);
        if (!deletedEducation) {
          return res.status(404).json({ error: 'Education record not found' });
        }
        return res.json({ education: deletedEducation });
      }
      const deletedEducation = await Education.delete(id);
      if (!deletedEducation) {
        return res.status(404).json({ error: 'Education record not found' });
      }
      return res.json({ education: deletedEducation });
    } catch (error) {
      console.error('Error deleting education:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = educationController;
