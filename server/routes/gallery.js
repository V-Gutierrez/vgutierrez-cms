const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const {
  generateId,
  generateSlug,
  ensureUniqueSlug,
  loadJsonFile,
  saveJsonFile,
  slugifyFilename
} = require('../utils/cms-utils');

// Configure multer for gallery image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'data', 'images', 'gallery');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating gallery upload directory:', error);
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

// GET /api/gallery - List all gallery items
router.get('/', async (req, res) => {
  try {
    const gallery = await loadJsonFile('gallery.json');
    res.json(gallery);
  } catch (error) {
    console.error('Error loading gallery:', error);
    res.status(500).json({ error: 'Failed to load gallery' });
  }
});

// GET /api/gallery/:slug - Get specific gallery item
router.get('/:slug', async (req, res) => {
  try {
    const gallery = await loadJsonFile('gallery.json');
    const { slug } = req.params;

    // First try to find by slug
    let item = gallery.find(i => i.slug === slug);

    // If not found by slug, try to find by id (for backward compatibility)
    if (!item) {
      item = gallery.find(i => i.id.toString() === slug);
    }

    // If still not found, try to find by title as slug (for legacy items)
    if (!item) {
      item = gallery.find(i => i.title === slug);
    }

    if (!item) {
      console.log(`Gallery item not found for slug: ${slug}`);
      console.log('Available items:', gallery.map(i => ({ id: i.id, slug: i.slug, title: i.title })));
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error loading gallery item:', error);
    res.status(500).json({ error: 'Failed to load gallery item' });
  }
});

// POST /api/gallery - Create new gallery item
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      technique,
      year,
      dimensions,
      imageUrl,
      published
    } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and image URL are required' });
    }

    const gallery = await loadJsonFile('gallery.json');
    const uuid = generateId();
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug, gallery);

    const newItem = {
      id: uuid,
      slug,
      title,
      description: description || '',
      technique: technique || '',
      year: year || new Date().getFullYear(),
      image: imageUrl,
      dimensions: dimensions || '',
      published: published !== undefined ? !!published : true
    };

    gallery.push(newItem);
    await saveJsonFile('gallery.json', gallery);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

// PUT /api/gallery/:slug - Update existing gallery item
router.put('/:slug', async (req, res) => {
  try {
    const {
      title,
      description,
      technique,
      year,
      dimensions,
      imageUrl,
      published
    } = req.body;
    const { slug: currentSlug } = req.params;

    const gallery = await loadJsonFile('gallery.json');

    // Find item with same logic as GET
    let item = gallery.find(i => i.slug === currentSlug);
    if (!item) {
      item = gallery.find(i => i.id.toString() === currentSlug);
    }
    if (!item) {
      item = gallery.find(i => i.title === currentSlug);
    }

    if (!item) {
      console.log(`Gallery item not found for update: ${currentSlug}`);
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    // Update fields
    const oldTitle = item.title;

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (technique !== undefined) item.technique = technique;
    if (year !== undefined) item.year = year;
    if (dimensions !== undefined) item.dimensions = dimensions;
    if (imageUrl !== undefined) item.image = imageUrl;
    if (published !== undefined) item.published = !!published;

    // Update slug if title changed (ensure item has a slug)
    if (!item.slug) {
      // Create slug for legacy items
      item.slug = await ensureUniqueSlug(generateSlug(item.title), gallery.filter(g => g.id !== item.id));
    }

    if (title && title !== oldTitle) {
      const baseSlug = generateSlug(title);
      const otherItems = gallery.filter(i => i.id !== item.id);
      item.slug = await ensureUniqueSlug(baseSlug, otherItems);
    }

    await saveJsonFile('gallery.json', gallery);
    res.json(item);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// DELETE /api/gallery/:slug - Delete gallery item
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const gallery = await loadJsonFile('gallery.json');

    // Find item index with same logic as GET
    let itemIndex = gallery.findIndex(i => i.slug === slug);
    if (itemIndex === -1) {
      itemIndex = gallery.findIndex(i => i.id.toString() === slug);
    }
    if (itemIndex === -1) {
      itemIndex = gallery.findIndex(i => i.title === slug);
    }

    if (itemIndex === -1) {
      console.log(`Gallery item not found for deletion: ${slug}`);
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const item = gallery[itemIndex];
    gallery.splice(itemIndex, 1);
    await saveJsonFile('gallery.json', gallery);

    res.json({ message: 'Gallery item deleted successfully', deletedItem: item });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// POST /api/gallery/upload-image - Upload image for gallery
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Local URL for immediate preview
    const localUrl = `/data/images/gallery/${req.file.filename}`;

    // GitHub URL for production
    const githubUrl = `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/gallery/${req.file.filename}`;

    res.json({
      url: githubUrl,
      localUrl: localUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Gallery image upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

module.exports = router;