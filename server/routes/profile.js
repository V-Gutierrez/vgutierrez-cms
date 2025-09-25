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

// PUT /api/profile - Update entire profile
router.put('/', async (req, res) => {
  try {
    const profileData = req.body;

    if (!profileData) {
      return res.status(400).json({ error: 'Profile data is required' });
    }

    await saveJsonFile('profile.json', profileData);
    res.json(profileData);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
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

// PUT /api/profile/skills - Update skills
router.put('/skills', async (req, res) => {
  try {
    const profile = await loadJsonFile('profile.json');
    const { skills } = req.body;

    if (!skills) {
      return res.status(400).json({ error: 'Skills data is required' });
    }

    profile.skills = skills;
    await saveJsonFile('profile.json', profile);

    res.json(profile);
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({ error: 'Failed to update skills' });
  }
});

// PUT /api/profile/skills/:category - Update specific skill category
router.put('/skills/:category', async (req, res) => {
  try {
    const profile = await loadJsonFile('profile.json');
    const { category } = req.params;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills array is required' });
    }

    if (!profile.skills) {
      profile.skills = {};
    }

    profile.skills[category] = skills;
    await saveJsonFile('profile.json', profile);

    res.json(profile);
  } catch (error) {
    console.error('Error updating skill category:', error);
    res.status(500).json({ error: 'Failed to update skill category' });
  }
});

// PUT /api/profile/technical-stack - Update technical stack
router.put('/technical-stack', async (req, res) => {
  try {
    const profile = await loadJsonFile('profile.json');
    const { technicalStack } = req.body;

    if (!technicalStack) {
      return res.status(400).json({ error: 'Technical stack data is required' });
    }

    profile.technicalStack = technicalStack;
    await saveJsonFile('profile.json', profile);

    res.json(profile);
  } catch (error) {
    console.error('Error updating technical stack:', error);
    res.status(500).json({ error: 'Failed to update technical stack' });
  }
});

// PUT /api/profile/technical-stack/:category - Update specific technical category
router.put('/technical-stack/:category', async (req, res) => {
  try {
    const profile = await loadJsonFile('profile.json');
    const { category } = req.params;
    const { technologies } = req.body;

    if (!technologies || !Array.isArray(technologies)) {
      return res.status(400).json({ error: 'Technologies array is required' });
    }

    if (!profile.technicalStack) {
      profile.technicalStack = {};
    }

    profile.technicalStack[category] = technologies;
    await saveJsonFile('profile.json', profile);

    res.json(profile);
  } catch (error) {
    console.error('Error updating technical category:', error);
    res.status(500).json({ error: 'Failed to update technical category' });
  }
});

// PUT /api/profile/site-settings - Update site settings
router.put('/site-settings', async (req, res) => {
  try {
    const profile = await loadJsonFile('profile.json');
    const { siteSettings } = req.body;

    if (!siteSettings) {
      return res.status(400).json({ error: 'Site settings data is required' });
    }

    profile.siteSettings = { ...profile.siteSettings, ...siteSettings };
    await saveJsonFile('profile.json', profile);

    res.json(profile);
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

// PUT /api/profile/languages - Update languages
router.put('/languages', async (req, res) => {
  try {
    const profile = await loadJsonFile('profile.json');
    const { languages } = req.body;

    if (!languages || !Array.isArray(languages)) {
      return res.status(400).json({ error: 'Languages array is required' });
    }

    profile.languages = languages;
    await saveJsonFile('profile.json', profile);

    res.json(profile);
  } catch (error) {
    console.error('Error updating languages:', error);
    res.status(500).json({ error: 'Failed to update languages' });
  }
});

module.exports = router;