const Skill = require('../models/Skill');
const db = require('../config/db');
const fallback = require('../config/fallbackData');

function validateSkill(skillData) {
  if (!skillData.name || !skillData.type) {
    throw new Error('Skill name and type are required');
  }
  const allowedTypes = ['language', 'framework', 'database', 'tool'];
  if (!allowedTypes.includes(skillData.type)) {
    throw new Error('Skill type must be language, framework, database, or tool');
  }
}

const skillController = {
  getAllSkills: async (req, res) => {
    try {
      if (db.useFallback) {
        return res.json({ skills: fallback.getSkills() });
      }
      const skills = await Skill.getAll();
      res.json({ skills });
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createSkill: async (req, res) => {
    try {
      validateSkill(req.body);
      if (db.useFallback) {
        const newSkill = fallback.addSkill(req.body);
        return res.status(201).json({ skill: newSkill });
      }
      const newSkill = await Skill.create(req.body);
      res.status(201).json({ skill: newSkill });
    } catch (error) {
      console.error('Error creating skill:', error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  updateSkill: async (req, res) => {
    try {
      const { id } = req.params;
      validateSkill(req.body);
      if (db.useFallback) {
        const updatedSkill = fallback.updateSkill(id, req.body);
        if (!updatedSkill) {
          return res.status(404).json({ error: 'Skill not found' });
        }
        return res.json({ skill: updatedSkill });
      }
      const updatedSkill = await Skill.update(id, req.body);
      if (!updatedSkill) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      return res.json({ skill: updatedSkill });
    } catch (error) {
      console.error('Error updating skill:', error);
      res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  deleteSkill: async (req, res) => {
    try {
      const { id } = req.params;
      if (db.useFallback) {
        const deletedSkill = fallback.deleteSkill(id);
        if (!deletedSkill) {
          return res.status(404).json({ error: 'Skill not found' });
        }
        return res.json({ skill: deletedSkill });
      }
      const deletedSkill = await Skill.delete(id);
      if (!deletedSkill) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      res.json({ skill: deletedSkill });
    } catch (error) {
      console.error('Error deleting skill:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = skillController;
