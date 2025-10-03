const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const {
  loadJsonFile,
  saveJsonFile,
  slugifyFilename
} = require('../utils/cms-utils');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'data', 'images', 'profile');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating profile upload directory:', error);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `profile-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

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

// POST /api/profile/upload-image - Upload profile image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Local URL for immediate preview in admin (served by Express)
    const localUrl = `/data/images/profile/${req.file.filename}`;

    // GitHub URL for production use (available after git push)
    const githubUrl = `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/profile/${req.file.filename}`;

    // Update profile.json with GitHub URL (for public site)
    const profile = await loadJsonFile('profile.json');
    profile.personalInfo.profileImage = githubUrl;
    await saveJsonFile('profile.json', profile);

    res.json({
      url: githubUrl,           // GitHub URL for profile.json
      localUrl: localUrl,       // Local URL for immediate preview
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

module.exports = router;