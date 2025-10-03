const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const {
  loadJsonFile,
  saveJsonFile,
  slugifyFilename,
  generateId
} = require('../utils/cms-utils');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const type = req.body.type || 'blog';
    const uploadPath = path.join(__dirname, '..', '..', 'data', 'images', type);
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const slugifiedName = slugifyFilename(name);
    cb(null, `${slugifiedName}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/images/library - Get unified image library
router.get('/library', async (req, res) => {
  try {
    const allImages = [];

    // Load gallery items
    try {
      const gallery = await loadJsonFile('gallery.json');
      gallery.forEach(item => {
        allImages.push({
          source: 'gallery',
          type: 'gallery',
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.image,
          filename: item.image.split('/').pop(),
          category: item.category,
          tags: item.tags,
          featured: item.featured,
          createdAt: item.createdAt || null
        });
      });
    } catch (error) {
      console.warn('Could not load gallery:', error.message);
    }

    // Load registry items
    try {
      const registry = await loadJsonFile('images/registry.json');
      registry.forEach(item => {
        allImages.push({
          source: 'registry',
          type: item.type,
          filename: item.filename,
          url: item.url,
          description: item.description,
          createdAt: item.createdAt
        });
      });
    } catch (error) {
      console.warn('Could not load registry:', error.message);
    }

    // Load profile image
    try {
      const profile = await loadJsonFile('profile.json');
      if (profile.personalInfo?.profileImage) {
        allImages.push({
          source: 'profile',
          type: 'profile',
          filename: profile.personalInfo.profileImage.split('/').pop(),
          url: profile.personalInfo.profileImage,
          description: 'Profile Photo',
          current: true,
          createdAt: null
        });
      }
    } catch (error) {
      console.warn('Could not load profile:', error.message);
    }

    // Sort by creation date (most recent first)
    allImages.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(allImages);
  } catch (error) {
    console.error('Error loading image library:', error);
    res.status(500).json({ error: 'Failed to load image library' });
  }
});

// POST /api/images/upload - Upload image to library
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const type = req.body.type || 'blog';
    const description = req.body.description || '';

    // Local URL for immediate preview
    const localUrl = `/data/images/${type}/${req.file.filename}`;

    // GitHub URL for production
    const githubUrl = `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/${type}/${req.file.filename}`;

    // Update registry
    const registryPath = path.join('images', 'registry.json');
    let registry = [];
    try {
      registry = await loadJsonFile(registryPath);
    } catch (error) {
      console.log('Registry not found, creating new one');
    }

    const newEntry = {
      type: type,
      filename: req.file.filename,
      url: githubUrl,
      description: description,
      createdAt: new Date().toISOString()
    };

    registry.push(newEntry);
    await saveJsonFile(registryPath, registry);

    res.json({
      url: githubUrl,
      localUrl: localUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: type
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// POST /api/images/promote-to-gallery/:filename - Promote image to gallery
router.post('/promote-to-gallery/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { title, description, category, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Find image in registry
    const registry = await loadJsonFile('images/registry.json');
    const image = registry.find(img => img.filename === filename);

    if (!image) {
      return res.status(404).json({ error: 'Image not found in registry' });
    }

    // Load gallery
    const gallery = await loadJsonFile('gallery.json');

    // Create new gallery item
    const newItem = {
      id: generateId(),
      title: title,
      description: description || '',
      category: category || 'photography',
      image: image.url,
      tags: tags || [],
      featured: false,
      published: true,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };

    gallery.push(newItem);
    await saveJsonFile('gallery.json', gallery);

    res.json(newItem);
  } catch (error) {
    console.error('Error promoting to gallery:', error);
    res.status(500).json({ error: 'Failed to promote to gallery' });
  }
});

// DELETE /api/images/:type/:filename - Delete image
router.delete('/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;

    // Delete physical file
    const filePath = path.join(__dirname, '..', '..', 'data', 'images', type, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('File not found or already deleted:', error.message);
    }

    // Remove from registry
    const registryPath = path.join('images', 'registry.json');
    try {
      let registry = await loadJsonFile(registryPath);
      registry = registry.filter(img => img.filename !== filename);
      await saveJsonFile(registryPath, registry);
    } catch (error) {
      console.warn('Could not update registry:', error.message);
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
