const express = require('express');
const router = express.Router();
const {
  generateId,
  generateSlug,
  ensureUniqueSlug,
  loadJsonFile,
  saveJsonFile
} = require('../utils/cms-utils');

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
      category,
      technique,
      year,
      tags,
      dimensions,
      imageUrl,
      featured,
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
      category: (category || 'photography').toLowerCase(),
      technique: technique || '',
      year: year || new Date().getFullYear(),
      image: imageUrl,
      tags: Array.isArray(tags)
        ? tags
        : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      dimensions: dimensions || '',
      featured: !!featured,
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
      category,
      technique,
      year,
      tags,
      dimensions,
      imageUrl,
      featured,
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
    if (category !== undefined) item.category = category.toLowerCase();
    if (technique !== undefined) item.technique = technique;
    if (year !== undefined) item.year = year;
    if (tags !== undefined) {
      item.tags = Array.isArray(tags)
        ? tags
        : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    }
    if (dimensions !== undefined) item.dimensions = dimensions;
    if (imageUrl !== undefined) item.image = imageUrl;
    if (featured !== undefined) item.featured = !!featured;
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

module.exports = router;