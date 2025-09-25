const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const POSTS_DIR = path.join(DATA_DIR, 'posts');
const IMAGES_DIR = path.join(DATA_DIR, 'images');

// Utils from original CLI
function generateId() {
  return crypto.randomUUID().replace(/-/g, '');
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

async function ensureUniqueSlug(baseSlug, existingItems, slugField = 'slug') {
  let slug = baseSlug;
  let counter = 1;

  while (existingItems.some(item => item[slugField] === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

function estimateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = String(content || '').split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / wordsPerMinute) || 1;
}

// Date utility functions
function getCurrentDateForUser() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function formatDateForUser(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function formatDateForStorage(userDate) {
  if (!userDate) return '';
  const match = userDate.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (!match) return '';

  const [, day, month, year] = match;
  const fullYear = `20${year}`;
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');

  return `${fullYear}-${paddedMonth}-${paddedDay}`;
}

function isValidDateFormat(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;

  const match = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (!match) return false;

  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(`20${year}`, 10);

  if (dayNum < 1 || dayNum > 31) return false;
  if (monthNum < 1 || monthNum > 12) return false;
  if (yearNum < 2000 || yearNum > 2099) return false;

  const testDate = new Date(yearNum, monthNum - 1, dayNum);
  return testDate.getFullYear() === yearNum &&
         testDate.getMonth() === monthNum - 1 &&
         testDate.getDate() === dayNum;
}

// File operations
async function loadJsonFile(filename) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error.message);
    return [];
  }
}

async function saveJsonFile(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
}

// Sitemap generation
const SITEMAP_CONFIG = {
  baseUrl: 'https://www.victorgutierrez.com.br',
  staticPages: [
    {
      url: '/',
      title: 'Home',
      lastModified: () => new Date().toISOString().split('T')[0]
    },
    {
      url: '/#portfolio',
      title: 'Portfolio',
      lastModified: () => new Date().toISOString().split('T')[0]
    },
    {
      url: '/#gallery',
      title: 'Gallery',
      lastModified: () => new Date().toISOString().split('T')[0]
    },
    {
      url: '/#blog',
      title: 'Blog',
      lastModified: () => new Date().toISOString().split('T')[0]
    }
  ]
};

async function generateSitemapJson() {
  try {
    const posts = await loadJsonFile('posts.json');
    const projects = await loadJsonFile('projects.json');

    // Get today's date for filtering published posts
    const now = new Date();
    const today = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

    // Filter published posts with date <= today
    const publishedPosts = posts.filter(post =>
      post.published && post.date <= today
    );

    // Static pages
    const staticPages = SITEMAP_CONFIG.staticPages.map(page => ({
      url: page.url,
      title: page.title,
      lastModified: page.lastModified()
    }));

    // Dynamic post URLs (JavaScript routing with # prefix)
    const postPages = publishedPosts.map(post => ({
      url: `/#post/${post.slug}`,
      title: post.title,
      lastModified: post.date
    }));

    // Project pages (if any are featured/public)
    const featuredProjects = projects.filter(project => project.featured);
    const projectPages = featuredProjects.map(project => ({
      url: `/#portfolio/${project.slug}`,
      title: project.title,
      lastModified: project.endDate === 'ongoing' ? today : project.endDate
    }));

    return {
      pages: staticPages,
      posts: postPages,
      projects: projectPages
    };
  } catch (error) {
    console.error('Error generating sitemap JSON:', error);
    throw error;
  }
}

async function generateSitemapXml() {
  try {
    const sitemapData = await generateSitemapJson();
    const now = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add all URLs from sitemap.json
    const allPages = [
      ...sitemapData.pages,
      ...sitemapData.posts,
      ...sitemapData.projects
    ];

    allPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${SITEMAP_CONFIG.baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${page.lastModified}</lastmod>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  } catch (error) {
    console.error('Error generating sitemap XML:', error);
    throw error;
  }
}

async function updateSitemaps() {
  try {
    // Generate and save sitemap.json
    const sitemapJson = await generateSitemapJson();
    await saveJsonFile('sitemap.json', sitemapJson);

    // Generate and save sitemap.xml
    const sitemapXml = await generateSitemapXml();
    const rootDir = path.join(DATA_DIR, '..');
    await fs.writeFile(path.join(rootDir, 'sitemap.xml'), sitemapXml);

    console.log('🗺️  Sitemaps updated successfully!');
  } catch (error) {
    console.error('⚠️  Error updating sitemaps:', error.message);
    throw error;
  }
}

module.exports = {
  DATA_DIR,
  POSTS_DIR,
  IMAGES_DIR,
  generateId,
  generateSlug,
  ensureUniqueSlug,
  estimateReadingTime,
  getCurrentDateForUser,
  formatDateForUser,
  formatDateForStorage,
  isValidDateFormat,
  loadJsonFile,
  saveJsonFile,
  updateSitemaps
};