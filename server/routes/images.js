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

// GET /api/images/library - Get unified image library (scan all directories)
router.get('/library', async (req, res) => {
  try {
    const allImages = [];
    const imageTypes = ['assets', 'blog', 'gallery', 'profile', 'projects'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    // Load gallery.json to check which images are already in gallery
    let gallery = [];
    try {
      gallery = await loadJsonFile('gallery.json');
    } catch (error) {
      console.warn('Could not load gallery.json:', error.message);
    }

    // Create a map of URLs to count occurrences in gallery
    const galleryUrls = new Map();
    gallery.forEach(item => {
      const url = item.image;
      galleryUrls.set(url, (galleryUrls.get(url) || 0) + 1);
    });

    // Scan all image directories
    for (const type of imageTypes) {
      const dirPath = path.join(__dirname, '..', '..', 'data', 'images', type);

      try {
        const files = await fs.readdir(dirPath);

        for (const filename of files) {
          // Skip hidden files and non-images
          if (filename.startsWith('.')) continue;

          const ext = path.extname(filename).toLowerCase();
          if (!allowedExtensions.includes(ext)) continue;

          // Generate GitHub URL
          const githubUrl = `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/${type}/${filename}`;

          // Check if this URL is in gallery
          const isInGallery = galleryUrls.has(githubUrl);
          const galleryCount = galleryUrls.get(githubUrl) || 0;

          // Get title and description if in gallery
          let title = '';
          let description = '';
          if (isInGallery) {
            const galleryItem = gallery.find(item => item.image === githubUrl);
            if (galleryItem) {
              title = galleryItem.title;
              description = galleryItem.description;
            }
          }

          allImages.push({
            filename,
            url: githubUrl,
            type,
            source: 'filesystem',
            isInGallery,
            galleryCount,
            title,
            description
          });
        }
      } catch (error) {
        console.warn(`Could not scan directory ${type}:`, error.message);
      }
    }

    // Sort by type and filename
    allImages.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.filename.localeCompare(b.filename);
    });

    res.json(allImages);
  } catch (error) {
    console.error('Error loading image library:', error);
    res.status(500).json({ error: 'Failed to load image library' });
  }
});


// POST /api/images/add-to-gallery - Add existing image to gallery
router.post('/add-to-gallery', async (req, res) => {
  try {
    const { imageUrl, title, description, technique, year, dimensions } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and image URL are required' });
    }

    // Load gallery
    const gallery = await loadJsonFile('gallery.json');

    // Create new gallery item (reusing existing image URL)
    const newItem = {
      id: generateId(),
      title: title,
      description: description || '',
      technique: technique || '',
      year: year || new Date().getFullYear(),
      dimensions: dimensions || '',
      image: imageUrl,
      published: true,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };

    gallery.push(newItem);
    await saveJsonFile('gallery.json', gallery);

    res.json(newItem);
  } catch (error) {
    console.error('Error adding to gallery:', error);
    res.status(500).json({ error: 'Failed to add to gallery' });
  }
});

// PUT /api/images/:type/:filename - Replace image (keeps same filename)
router.put('/:type/:filename', upload.single('image'), async (req, res) => {
  try {
    const { type, filename } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Build paths
    const targetPath = path.join(__dirname, '..', '..', 'data', 'images', type, filename);
    const uploadedPath = req.file.path;

    // Delete old file
    try {
      await fs.unlink(targetPath);
    } catch (error) {
      console.warn('Original file not found, continuing with replacement:', error.message);
    }

    // Rename uploaded file to target filename
    await fs.rename(uploadedPath, targetPath);

    // Generate URLs
    const localUrl = `/data/images/${type}/${filename}`;
    const githubUrl = `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/${type}/${filename}`;

    res.json({
      message: 'Image replaced successfully',
      url: githubUrl,
      localUrl: localUrl,
      filename: filename
    });
  } catch (error) {
    console.error('Error replacing image:', error);
    res.status(500).json({ error: 'Failed to replace image' });
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

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
