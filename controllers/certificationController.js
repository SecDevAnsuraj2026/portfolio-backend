const Certification = require('../models/Certification');
const db = require('../config/db');
const fallback = require('../config/fallbackData');
const { getUploadedImageUrl } = require('../middleware/upload');

function validateCertification(certificationData) {
  if (!certificationData.title || !certificationData.issuer || !certificationData.date) {
    throw new Error('Certification title, issuer, and date range are required');
  }
}

function getFallbackCertificationById(id) {
  return fallback.getCertifications().find((item) => String(item.id) === String(id)) || null;
}

const certificationController = {
  getAllCertifications: async (req, res) => {
    try {
      if (db.useFallback) {
        return res.json({ certifications: fallback.getCertifications() });
      }
      const certifications = await Certification.getAll();
      return res.json({ certifications });
    } catch (error) {
      console.error('Error fetching certifications:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  getCertificationById: async (req, res) => {
    try {
      const { id } = req.params;
      const certification = await Certification.getById(id);
      if (!certification) {
        return res.status(404).json({ error: 'Certification not found' });
      }
      return res.json({ certification });
    } catch (error) {
      console.error('Error fetching certification:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  createCertification: async (req, res) => {
    try {
      const certificationData = { ...req.body };
      certificationData.image_url = req.file ? getUploadedImageUrl(req.file) : 'N/A';
      certificationData.imageUrl = certificationData.image_url;
      validateCertification(certificationData);
      if (db.useFallback) {
        const newCertification = fallback.addCertification(certificationData);
        return res.status(201).json({ certification: newCertification });
      }
      const newCertification = await Certification.create(certificationData);
      return res.status(201).json({ certification: newCertification });
    } catch (error) {
      console.error('Error creating certification:', error);
      return res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  updateCertification: async (req, res) => {
    try {
      const { id } = req.params;
      const certificationData = { ...req.body };
      validateCertification(certificationData);
      if (db.useFallback) {
        const existingCertification = getFallbackCertificationById(id);
        if (!existingCertification) {
          return res.status(404).json({ error: 'Certification not found' });
        }

        certificationData.image_url = req.file
          ? getUploadedImageUrl(req.file)
          : existingCertification.imageUrl || 'N/A';
        certificationData.imageUrl = certificationData.image_url;

        const updatedCertification = fallback.updateCertification(id, certificationData);
        if (!updatedCertification) {
          return res.status(404).json({ error: 'Certification not found' });
        }
        return res.json({ certification: updatedCertification });
      }
      const existingCertification = await Certification.getById(id);
      if (!existingCertification) {
        return res.status(404).json({ error: 'Certification not found' });
      }

      certificationData.image_url = req.file
        ? getUploadedImageUrl(req.file)
        : existingCertification.imageUrl || 'N/A';
      certificationData.imageUrl = certificationData.image_url;

      const updatedCertification = await Certification.update(id, certificationData);
      if (!updatedCertification) {
        return res.status(404).json({ error: 'Certification not found' });
      }
      return res.json({ certification: updatedCertification });
    } catch (error) {
      console.error('Error updating certification:', error);
      return res.status(400).json({ error: error.message || 'Internal server error' });
    }
  },

  deleteCertification: async (req, res) => {
    try {
      const { id } = req.params;
      if (db.useFallback) {
        const deletedCertification = fallback.deleteCertification(id);
        if (!deletedCertification) {
          return res.status(404).json({ error: 'Certification not found' });
        }
        return res.json({ certification: deletedCertification });
      }
      const deletedCertification = await Certification.delete(id);
      if (!deletedCertification) {
        return res.status(404).json({ error: 'Certification not found' });
      }
      return res.json({ certification: deletedCertification });
    } catch (error) {
      console.error('Error deleting certification:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = certificationController;
