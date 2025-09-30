const express = require('express');
const router = express.Router();
const {
  loadJsonFile,
  saveJsonFile
} = require('../utils/cms-utils');

// GET /api/profile - Get profile data
router.get('/', async (req, res) => {
  try {
    const profile = await loadJsonFile('profile.json');
    res.json(profile);
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// PUT /api/profile/personal - Update personal information only
router.put('/personal', async (req, res) => {
  try {
    const profile = await loadJsonFile('profile.json');
    const { personalInfo } = req.body;

    if (!personalInfo) {
      return res.status(400).json({ error: 'Personal info data is required' });
    }

    profile.personalInfo = { ...profile.personalInfo, ...personalInfo };
    await saveJsonFile('profile.json', profile);

    res.json(profile);
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({ error: 'Failed to update personal info' });
  }
});

module.exports = router;