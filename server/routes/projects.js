const express = require('express');
const router = express.Router();
const {
  generateId,
  generateSlug,
  ensureUniqueSlug,
  loadJsonFile,
  saveJsonFile
} = require('../utils/cms-utils');

// GET /api/projects - List all projects
router.get('/', async (req, res) => {
  try {
    const projects = await loadJsonFile('projects.json');
    res.json(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
    res.status(500).json({ error: 'Failed to load projects' });
  }
});

// GET /api/projects/:slug - Get specific project
router.get('/:slug', async (req, res) => {
  try {
    const projects = await loadJsonFile('projects.json');
    const project = projects.find(p => p.slug === req.params.slug);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error loading project:', error);
    res.status(500).json({ error: 'Failed to load project' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      technologies,
      status,
      startDate,
      endDate,
      featured,
      metrics,
      highlights
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const projects = await loadJsonFile('projects.json');
    const uuid = generateId();
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug, projects);

    const newProject = {
      id: uuid,
      slug,
      title,
      description,
      category: category || '',
      technologies: Array.isArray(technologies)
        ? technologies
        : (technologies ? technologies.split(',').map(t => t.trim()).filter(Boolean) : []),
      status: status || 'planned',
      startDate: startDate || '',
      endDate: endDate || '',
      metrics: metrics || {},
      highlights: Array.isArray(highlights) ? highlights : [],
      featured: !!featured
    };

    projects.push(newProject);
    await saveJsonFile('projects.json', projects);

    // Update sitemaps
    try {
      const { updateSitemaps } = require('../utils/cms-utils');
      await updateSitemaps();
    } catch (sitemapError) {
      console.warn('Failed to update sitemaps:', sitemapError.message);
    }

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:slug - Update existing project
router.put('/:slug', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      technologies,
      status,
      startDate,
      endDate,
      featured,
      metrics,
      highlights
    } = req.body;
    const { slug: currentSlug } = req.params;

    const projects = await loadJsonFile('projects.json');
    const project = projects.find(p => p.slug === currentSlug);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update fields
    const oldTitle = project.title;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (category !== undefined) project.category = category;
    if (technologies !== undefined) {
      project.technologies = Array.isArray(technologies)
        ? technologies
        : (technologies ? technologies.split(',').map(t => t.trim()).filter(Boolean) : []);
    }
    if (status !== undefined) project.status = status;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (featured !== undefined) project.featured = !!featured;
    if (metrics !== undefined) project.metrics = metrics;
    if (highlights !== undefined) project.highlights = Array.isArray(highlights) ? highlights : [];

    // Update slug if title changed
    if (title && title !== oldTitle) {
      const baseSlug = generateSlug(title);
      const otherProjects = projects.filter(p => p.slug !== currentSlug);
      project.slug = await ensureUniqueSlug(baseSlug, otherProjects);
    }

    await saveJsonFile('projects.json', projects);

    // Update sitemaps
    try {
      const { updateSitemaps } = require('../utils/cms-utils');
      await updateSitemaps();
    } catch (sitemapError) {
      console.warn('Failed to update sitemaps:', sitemapError.message);
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:slug - Delete project
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const projects = await loadJsonFile('projects.json');
    const projectIndex = projects.findIndex(p => p.slug === slug);

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[projectIndex];
    projects.splice(projectIndex, 1);
    await saveJsonFile('projects.json', projects);

    // Update sitemaps
    try {
      const { updateSitemaps } = require('../utils/cms-utils');
      await updateSitemaps();
    } catch (sitemapError) {
      console.warn('Failed to update sitemaps:', sitemapError.message);
    }

    res.json({ message: 'Project deleted successfully', deletedProject: project });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;