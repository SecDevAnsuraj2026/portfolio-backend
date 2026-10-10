import Profile from '../models/Profile.js';
import db from '../config/db.js';
import * as fallback from '../config/fallbackData.js';

const profileController = {
  getProfile: async (req, res) => {
    try {
      if (db.useFallback) {
        return res.json({ profile: fallback.getProfile() });
      }

      const profile = await Profile.get();
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json({ profile });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      if (db.useFallback) {
        const updatedProfile = fallback.updateProfile(req.body);
        return res.json({ profile: updatedProfile });
      }

      const updatedProfile = await Profile.update(req.body);
      res.json({ profile: updatedProfile });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default profileController;
