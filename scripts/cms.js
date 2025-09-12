#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const cli = require('./utils/cli');

const DATA_DIR = path.join(__dirname, '..', 'data');
const POSTS_DIR = path.join(DATA_DIR, 'posts');
const IMAGES_DIR = path.join(DATA_DIR, 'images');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

// Utils
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

// Date utility functions for DD-MM-YY format handling
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
  const posts = await loadPosts();
  const projects = await loadProjects();
  
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
}

async function generateSitemapXml() {
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
}

async function updateSitemaps() {
  try {
    // Generate and save sitemap.json
    const sitemapJson = await generateSitemapJson();
    await fs.writeFile(
      path.join(DATA_DIR, 'sitemap.json'), 
      JSON.stringify(sitemapJson, null, 2)
    );
    
    // Generate and save sitemap.xml  
    const sitemapXml = await generateSitemapXml();
    await fs.writeFile(
      path.join(__dirname, '..', 'sitemap.xml'),
      sitemapXml
    );
    
    console.log('🗺️  Sitemaps updated successfully!');
  } catch (error) {
    console.error('⚠️  Error updating sitemaps:', error.message);
  }
}

// Blog
async function loadPosts() {
  try { return JSON.parse(await fs.readFile(path.join(DATA_DIR, 'posts.json'), 'utf8')); } catch { return []; }
}
async function savePosts(posts) {
  await fs.writeFile(path.join(DATA_DIR, 'posts.json'), JSON.stringify(posts, null, 2));
}
async function blogCreate() {
  console.log('\n=== Creating New Blog Post ===\n');
  const title = await cli.ask('Post title: ');
  const excerpt = await cli.ask('Post excerpt: ');
  const tags = await cli.ask('Tags (comma-separated): ');
  
  // Date input with DD-MM-YY format
  const todayForUser = getCurrentDateForUser();
  let dateInput;
  let date;
  
  while (true) {
    dateInput = await cli.ask(`Publication date (DD-MM-YY, default: ${todayForUser}): `);
    
    if (!dateInput) {
      dateInput = todayForUser;
    }
    
    if (isValidDateFormat(dateInput)) {
      date = formatDateForStorage(dateInput);
      break;
    } else {
      console.log('⚠️  Invalid date format. Please use DD-MM-YY format (e.g., 23-08-25)');
    }
  }
  
  console.log(`📅 Publication date set to: ${formatDateForUser(date)} (${date})`);
  
  const useEditor = await cli.confirm('Edit content in your editor?', true);
  const content = useEditor
    ? await cli.editInEditor('<!-- Write your post HTML/Markdown content here -->\n\n', { filePrefix: 'post-content', extension: 'html' })
    : await cli.ask('Post content (HTML): ');

  const posts = await loadPosts();
  const uuid = generateId();
  const baseSlug = generateSlug(title);
  const slug = await ensureUniqueSlug(baseSlug, posts);

  const postIndex = {
    id: uuid,
    slug,
    title,
    date,
    excerpt,
    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    published: true,
    contentFile: `posts/${slug}.json`
  };

  const postContent = {
    id: uuid,
    slug,
    title,
    date,
    author: 'Victor Gutierrez',
    tags: postIndex.tags,
    published: true,
    excerpt,
    content,
    readingTime: estimateReadingTime(content),
    seo: {
      metaTitle: `${title} - Victor Gutierrez`,
      metaDescription: excerpt,
      keywords: postIndex.tags
    }
  };

  await fs.writeFile(path.join(POSTS_DIR, `${slug}.json`), JSON.stringify(postContent, null, 2));
  posts.push(postIndex);
  await savePosts(posts);
  await updateSitemaps();
  console.log(`\n✅ Post created successfully with slug: ${slug}`);
}
async function blogList() {
  const posts = await loadPosts();
  console.log('\n=== All Blog Posts ===\n');
  if (!posts.length) return console.log('No posts found.');
  posts.forEach((post) => {
    const status = post.published ? '✅ Published' : '❌ Draft';
    console.log(`📝 ${post.title}`);
    console.log(`   Slug: ${post.slug} | Date: ${post.date} | Status: ${status}`);
    console.log(`   Tags: ${post.tags.join(', ')}`);
    console.log(`   Excerpt: ${post.excerpt.substring(0, 100)}...\n`);
  });
}
async function blogEdit() {
  const posts = await loadPosts();
  if (!posts.length) return console.log('No posts found to edit.');
  await blogList();
  const postSlug = await cli.ask('Enter post slug to edit: ');
  const post = posts.find(p => p.slug === postSlug);
  if (!post) return console.log('Post not found.');

  const contentPath = path.join(DATA_DIR, post.contentFile);
  const fullPost = JSON.parse(await fs.readFile(contentPath, 'utf8'));

  const newTitle = await cli.askDefault('Title', post.title);
  const newExcerpt = await cli.askDefault('Excerpt', post.excerpt);
  const newTags = await cli.askDefault('Tags', post.tags.join(', '));
  
  // Date editing with DD-MM-YY format
  const currentDateForUser = formatDateForUser(post.date);
  let dateInput;
  let newDate = post.date;
  
  while (true) {
    dateInput = await cli.ask(`Publication date (DD-MM-YY, current: ${currentDateForUser}): `);
    
    if (!dateInput) {
      // Keep current date if no input
      break;
    }
    
    if (isValidDateFormat(dateInput)) {
      newDate = formatDateForStorage(dateInput);
      console.log(`📅 Publication date updated to: ${formatDateForUser(newDate)} (${newDate})`);
      break;
    } else {
      console.log('⚠️  Invalid date format. Please use DD-MM-YY format (e.g., 23-08-25) or press Enter to keep current date');
    }
  }
  
  const wantsEditor = await cli.confirm('Edit content in your editor?', true);
  const newContent = wantsEditor
    ? await cli.editInEditor(fullPost.content, { filePrefix: `post-${post.id}`, extension: 'html' })
    : (await cli.ask(`Content (current length: ${fullPost.content.length} chars): `)) || fullPost.content;
  const published = await cli.confirm('Published?', post.published);

  post.title = newTitle;
  post.excerpt = newExcerpt;
  post.tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
  post.published = !!published;
  post.date = newDate;
  
  if (newTitle !== fullPost.title) {
    const baseSlug = generateSlug(newTitle);
    const otherPosts = posts.filter(p => p.slug !== post.slug);
    post.slug = await ensureUniqueSlug(baseSlug, otherPosts);
  }

  fullPost.title = newTitle;
  fullPost.excerpt = newExcerpt;
  fullPost.tags = post.tags;
  fullPost.published = !!published;
  fullPost.slug = post.slug;
  fullPost.content = newContent;
  fullPost.date = newDate;
  fullPost.readingTime = estimateReadingTime(newContent);
  fullPost.seo.metaTitle = `${newTitle} - Victor Gutierrez`;
  fullPost.seo.metaDescription = newExcerpt;
  fullPost.seo.keywords = post.tags;

  await fs.writeFile(contentPath, JSON.stringify(fullPost, null, 2));
  await savePosts(posts);
  await updateSitemaps();
  console.log('\n✅ Post updated successfully!');
}
async function blogDelete() {
  const posts = await loadPosts();
  if (!posts.length) return console.log('No posts found to delete.');
  await blogList();
  const postSlug = await cli.ask('Enter post slug to delete: ');
  const idx = posts.findIndex(p => p.slug === postSlug);
  if (idx === -1) return console.log('Post not found.');
  const post = posts[idx];
  const ok = await cli.confirm(`Are you sure you want to delete "${post.title}"?`, false);
  if (!ok) return console.log('Delete cancelled.');
  const contentPath = path.join(DATA_DIR, post.contentFile);
  try { await fs.unlink(contentPath); } catch(_) {}
  posts.splice(idx, 1);
  await savePosts(posts);
  await updateSitemaps();
  console.log('\n✅ Post deleted successfully!');
}

// Projects
async function loadProjects() {
  try { return JSON.parse(await fs.readFile(path.join(DATA_DIR, 'projects.json'), 'utf8')); } catch { return []; }
}
async function saveProjects(projects) {
  await fs.writeFile(path.join(DATA_DIR, 'projects.json'), JSON.stringify(projects, null, 2));
}
async function projectCreate() {
  console.log('\n=== Creating New Project ===\n');
  const title = await cli.ask('Project title: ');
  const description = await cli.ask('Project description: ');
  const category = await cli.ask('Category: ');
  const technologies = await cli.ask('Technologies (comma-separated): ');
  const status = await cli.ask('Status (completed/in-progress/planned): ');
  const startDate = await cli.ask('Start date (YYYY-MM-DD): ');
  const endDate = await cli.ask('End date (YYYY-MM-DD or "ongoing"): ');
  const featured = await cli.confirm('Featured project?', false);
  const projects = await loadProjects();
  const uuid = generateId();
  const baseSlug = generateSlug(title);
  const slug = await ensureUniqueSlug(baseSlug, projects);
  const newProject = {
    id: uuid,
    slug,
    title,
    description,
    category,
    technologies: technologies.split(',').map(t => t.trim()).filter(Boolean),
    status,
    startDate,
    endDate,
    metrics: {},
    highlights: [],
    featured: !!featured
  };
  projects.push(newProject);
  await saveProjects(projects);
  await updateSitemaps();
  console.log(`\n✅ Project created successfully with slug: ${slug}`);
}
async function projectList() {
  const projects = await loadProjects();
  console.log('\n=== All Projects ===\n');
  if (!projects.length) return console.log('No projects found.');
  projects.forEach((p) => {
    const star = p.featured ? '⭐' : '📦';
    console.log(`${star} ${p.title}`);
    console.log(`   Slug: ${p.slug} | Category: ${p.category} | Status: ${p.status}`);
    console.log(`   Technologies: ${p.technologies.join(', ')}`);
    console.log(`   Period: ${p.startDate} to ${p.endDate}`);
    console.log(`   Description: ${p.description.substring(0, 100)}...\n`);
  });
}
async function projectEdit() {
  const projects = await loadProjects();
  if (!projects.length) return console.log('No projects found to edit.');
  await projectList();
  const slug = await cli.ask('Enter project slug to edit: ');
  const p = projects.find(x => x.slug === slug);
  if (!p) return console.log('Project not found.');
  
  const oldTitle = p.title;
  p.title = await cli.askDefault('Title', p.title);
  p.description = await cli.askDefault('Description', p.description);
  p.category = await cli.askDefault('Category', p.category);
  p.technologies = (await cli.askDefault('Technologies', p.technologies.join(', '))).split(',').map(t => t.trim()).filter(Boolean);
  p.status = await cli.askDefault('Status', p.status);
  p.startDate = await cli.askDefault('Start date', p.startDate);
  p.endDate = await cli.askDefault('End date', p.endDate);
  p.featured = await cli.confirm('Featured?', p.featured);
  
  if (p.title !== oldTitle) {
    const baseSlug = generateSlug(p.title);
    const otherProjects = projects.filter(proj => proj.slug !== p.slug);
    p.slug = await ensureUniqueSlug(baseSlug, otherProjects);
  }
  await saveProjects(projects);
  await updateSitemaps();
  console.log('\n✅ Project updated successfully!');
}
async function projectDelete() {
  const projects = await loadProjects();
  if (!projects.length) return console.log('No projects found to delete.');
  await projectList();
  const slug = await cli.ask('Enter project slug to delete: ');
  const idx = projects.findIndex(x => x.slug === slug);
  if (idx === -1) return console.log('Project not found.');
  const ok = await cli.confirm(`Are you sure you want to delete "${projects[idx].title}"?`, false);
  if (!ok) return console.log('Delete cancelled.');
  projects.splice(idx, 1);
  await saveProjects(projects);
  await updateSitemaps();
  console.log('\n✅ Project deleted successfully!');
}

// Profile
async function loadProfile() {
  try { return JSON.parse(await fs.readFile(path.join(DATA_DIR, 'profile.json'), 'utf8')); } catch (e) { console.error('Error loading profile:', e.message); return null; }
}
async function saveProfile(profile) {
  await fs.writeFile(path.join(DATA_DIR, 'profile.json'), JSON.stringify(profile, null, 2));
}
async function profileView() {
  const profile = await loadProfile(); if (!profile) return;
  console.log('\n=== Current Profile ===\n');
  console.log(`Name: ${profile.personalInfo.name}`);
  console.log(`Title: ${profile.personalInfo.title}`);
  console.log(`Location: ${profile.personalInfo.location}`);
  console.log(`Email: ${profile.personalInfo.email}`);
  console.log(`LinkedIn: ${profile.personalInfo.linkedin}`);
  console.log(`GitHub: ${profile.personalInfo.github}`);
  console.log(`\nDescription: ${profile.personalInfo.description}`);
  console.log('\nLanguages:');
  profile.languages.forEach(l => console.log(`- ${l.language}: ${l.level}`));
}
async function profileEditPersonal() {
  const profile = await loadProfile(); if (!profile) return;
  const info = profile.personalInfo;
  info.name = await cli.askDefault('Name', info.name);
  info.title = await cli.askDefault('Title', info.title);
  info.subtitle = await cli.askDefault('Subtitle', info.subtitle);
  info.location = await cli.askDefault('Location', info.location);
  info.email = await cli.askDefault('Email', info.email);
  info.linkedin = await cli.askDefault('LinkedIn', info.linkedin);
  info.github = await cli.askDefault('GitHub', info.github);
  info.description = await cli.askDefault('Description', info.description);
  await saveProfile(profile);
  console.log('\n✅ Personal information updated successfully!');
}
async function profileEditSkills() {
  const profile = await loadProfile(); if (!profile) return;
  console.log('\nCurrent skill categories:');
  const categories = Object.keys(profile.skills);
  categories.forEach((c, i) => console.log(`${i + 1}. ${c}`));
  const pick = parseInt(await cli.ask('\nChoose category to edit (number): '));
  const cat = categories[pick - 1]; if (!cat) return console.log('Invalid category selection.');
  console.log(`\nEditing: ${cat}`);
  console.log('Current skills:');
  profile.skills[cat].forEach((s, i) => console.log(`${i + 1}. ${s}`));
  const action = await cli.ask('\n1. Add skill\n2. Remove skill\n3. Edit skill\nChoose action: ');
  switch (action) {
    case '1': {
      const s = await cli.ask('Enter new skill: ');
      if (s) profile.skills[cat].push(s);
      break;
    }
    case '2': {
      const idx = parseInt(await cli.ask('Enter skill number to remove: ')) - 1;
      if (idx >= 0 && idx < profile.skills[cat].length) profile.skills[cat].splice(idx, 1);
      break;
    }
    case '3': {
      const idx = parseInt(await cli.ask('Enter skill number to edit: ')) - 1;
      if (idx >= 0 && idx < profile.skills[cat].length) {
        const cur = profile.skills[cat][idx];
        profile.skills[cat][idx] = await cli.askDefault('Edit skill', cur);
      }
      break;
    }
  }
  await saveProfile(profile);
  console.log('\n✅ Skills updated successfully!');
}
async function profileEditTech() {
  const profile = await loadProfile(); if (!profile) return;
  console.log('\nCurrent technical categories:');
  const categories = Object.keys(profile.technicalStack);
  categories.forEach((c, i) => console.log(`${i + 1}. ${c}: ${profile.technicalStack[c].join(', ')}`));
  const pick = parseInt(await cli.ask('\nChoose category to edit (number): '));
  const cat = categories[pick - 1]; if (!cat) return console.log('Invalid category selection.');
  const current = profile.technicalStack[cat].join(', ');
  const next = await cli.askDefault(cat, current);
  profile.technicalStack[cat] = next.split(',').map(t => t.trim()).filter(Boolean);
  await saveProfile(profile);
  console.log('\n✅ Technical stack updated successfully!');
}
async function profileEditSite() {
  const profile = await loadProfile(); if (!profile) return;
  const s = profile.siteSettings;
  s.siteTitle = await cli.askDefault('Site Title', s.siteTitle);
  s.siteDescription = await cli.askDefault('Site Description', s.siteDescription);
  s.theme = await cli.askDefault('Theme', s.theme);
  s.primaryColor = await cli.askDefault('Primary Color', s.primaryColor);
  await saveProfile(profile);
  console.log('\n✅ Site settings updated successfully!');
}

// Gallery
async function loadGallery() { try { return JSON.parse(await fs.readFile(GALLERY_FILE, 'utf8')); } catch { return []; } }
async function saveGallery(g) { await fs.writeFile(GALLERY_FILE, JSON.stringify(g, null, 2)); }
async function galleryCreate() {
  console.log('\n=== Creating New Gallery Item ===\n');
  const title = await cli.ask('Title: ');
  const description = await cli.ask('Description: ');
  const category = await cli.ask('Category (photography/digital-art/drawings/mixed-media): ');
  const technique = await cli.ask('Technique (e.g., Digital Photography, Pencil on Paper): ');
  const year = parseInt(await cli.ask('Year: ')) || new Date().getFullYear();
  const tags = await cli.ask('Tags (comma-separated): ');
  const dimensions = await cli.ask('Dimensions (e.g., 1920x1080, 297x420): ');
  const rawName = (await cli.ask('Image filename (with or without extension): ')).trim();
  const parsed = path.parse(rawName);
  const baseName = parsed.name || rawName;
  let ext = (parsed.ext || '').replace('.', '').toLowerCase();
  const allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
  if (!ext) {
    const picked = (await cli.ask(`Image extension [${allowedExt.join('/')}] (default: jpg): `)).trim().toLowerCase();
    ext = picked || 'jpg';
  }
  if (!allowedExt.includes(ext)) { console.log(`Unsupported extension "${ext}". Falling back to 'jpg'.`); ext = 'jpg'; }
  const featured = await cli.confirm('Featured item?', false);

  const gallery = await loadGallery();
  const uuid = generateId();
  const baseSlug = generateSlug(title);
  const slug = await ensureUniqueSlug(baseSlug, gallery);
  const baseUrl = 'https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/gallery';
  const imageUrl = `${baseUrl}/${baseName}.${ext}`;
  const thumbnailUrl = `${baseUrl}/thumbnails/${baseName}-thumb.${ext}`;
  const item = {
    id: uuid,
    slug,
    title,
    description,
    category: category.toLowerCase(),
    technique,
    year,
    image: imageUrl,
    thumbnail: thumbnailUrl,
    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    dimensions,
    featured: !!featured,
    published: true
  };
  gallery.push(item);
  await saveGallery(gallery);
  console.log(`\n✅ Gallery item created successfully with slug: ${slug}`);
  console.log(`📸 Image URL: ${imageUrl}`);
  console.log(`🖼️  Thumbnail URL: ${thumbnailUrl}`);
  console.log('\n📝 Remember to upload the image files to:');
  console.log(`   - data/images/gallery/${baseName}.${ext}`);
  console.log(`   - data/images/gallery/thumbnails/${baseName}-thumb.${ext}`);
}
async function galleryList() {
  const gallery = await loadGallery();
  console.log('\n=== All Gallery Items ===\n');
  if (!gallery.length) return console.log('No gallery items found.');
  gallery.forEach((item) => {
    const status = item.published ? '✅ Published' : '❌ Draft';
    const featured = item.featured ? '⭐' : '🖼️';
    console.log(`${featured} ${item.title}`);
    console.log(`   Slug: ${item.slug} | Category: ${item.category} | Year: ${item.year} | Status: ${status}`);
    console.log(`   Technique: ${item.technique} | Dimensions: ${item.dimensions}`);
    console.log(`   Tags: ${item.tags.join(', ')}`);
    console.log(`   Description: ${item.description.substring(0, 100)}...\n`);
  });
}
async function galleryEdit() {
  const gallery = await loadGallery();
  if (!gallery.length) return console.log('No gallery items found to edit.');
  await galleryList();
  const slug = await cli.ask('Enter item slug to edit: ');
  const item = gallery.find(i => i.slug === slug);
  if (!item) return console.log('Gallery item not found.');
  
  const oldTitle = item.title;
  item.title = await cli.askDefault('Title', item.title);
  item.description = await cli.askDefault('Description', item.description);
  item.category = (await cli.askDefault('Category', item.category)).toLowerCase();
  item.technique = await cli.askDefault('Technique', item.technique);
  item.year = parseInt(await cli.ask(`Year (${item.year}): `)) || item.year;
  item.tags = (await cli.askDefault('Tags', item.tags.join(', '))).split(',').map(t => t.trim()).filter(Boolean);
  item.dimensions = await cli.askDefault('Dimensions', item.dimensions);
  item.featured = await cli.confirm('Featured?', item.featured);
  item.published = await cli.confirm('Published?', item.published);
  
  if (item.title !== oldTitle) {
    const baseSlug = generateSlug(item.title);
    const otherItems = gallery.filter(g => g.slug !== item.slug);
    item.slug = await ensureUniqueSlug(baseSlug, otherItems);
  }
  
  await saveGallery(gallery);
  console.log('\n✅ Gallery item updated successfully!');
}
async function galleryDelete() {
  const gallery = await loadGallery();
  if (!gallery.length) return console.log('No gallery items found to delete.');
  await galleryList();
  const slug = await cli.ask('Enter item slug to delete: ');
  const idx = gallery.findIndex(i => i.slug === slug);
  if (idx === -1) return console.log('Gallery item not found.');
  const ok = await cli.confirm(`Are you sure you want to delete "${gallery[idx].title}"?`, false);
  if (!ok) return console.log('Delete cancelled.');
  gallery.splice(idx, 1);
  await saveGallery(gallery);
  console.log('\n✅ Gallery item deleted successfully!');
}


// Main menu
async function menuBlog() {
  while (true) {
    console.log('\nBlog:');
    console.log('1. Create new post');
    console.log('2. List all posts');
    console.log('3. Edit post');
    console.log('4. Delete post');
    console.log('5. Back');
    const c = await cli.ask('\nChoose (1-5): ');
    if (c === '1') await blogCreate();
    else if (c === '2') await blogList();
    else if (c === '3') await blogEdit();
    else if (c === '4') await blogDelete();
    else if (c === '5') return; else console.log('Invalid option.');
  }
}
async function menuProjects() {
  while (true) {
    console.log('\nProjects:');
    console.log('1. Create new project');
    console.log('2. List all projects');
    console.log('3. Edit project');
    console.log('4. Delete project');
    console.log('5. Back');
    const c = await cli.ask('\nChoose (1-5): ');
    if (c === '1') await projectCreate();
    else if (c === '2') await projectList();
    else if (c === '3') await projectEdit();
    else if (c === '4') await projectDelete();
    else if (c === '5') return; else console.log('Invalid option.');
  }
}
async function menuProfile() {
  while (true) {
    console.log('\nProfile:');
    console.log('1. View current profile');
    console.log('2. Edit personal information');
    console.log('3. Edit skills');
    console.log('4. Edit technical stack');
    console.log('5. Edit site settings');
    console.log('6. Back');
    const c = await cli.ask('\nChoose (1-6): ');
    if (c === '1') await profileView();
    else if (c === '2') await profileEditPersonal();
    else if (c === '3') await profileEditSkills();
    else if (c === '4') await profileEditTech();
    else if (c === '5') await profileEditSite();
    else if (c === '6') return; else console.log('Invalid option.');
  }
}
async function menuGallery() {
  while (true) {
    console.log('\nGallery:');
    console.log('1. Create new gallery item');
    console.log('2. List all gallery items');
    console.log('3. Edit gallery item');
    console.log('4. Delete gallery item');
    console.log('5. Back');
    const c = await cli.ask('\nChoose (1-5): ');
    if (c === '1') await galleryCreate();
    else if (c === '2') await galleryList();
    else if (c === '3') await galleryEdit();
    else if (c === '4') await galleryDelete();
    else if (c === '5') return; else console.log('Invalid option.');
  }
}

async function main() {
  console.log('🛠️  Victor Gutierrez CMS - Unified CLI');
  console.log('======================================');
  while (true) {
    console.log('\nSections:');
    console.log('1. Blog');
    console.log('2. Projects');
    console.log('3. Profile');
    console.log('4. Gallery');
    console.log('5. Update Sitemaps');
    console.log('6. Exit');
    const choice = await cli.ask('\nChoose a section (1-6): ');
    if (choice === '1') await menuBlog();
    else if (choice === '2') await menuProjects();
    else if (choice === '3') await menuProfile();
    else if (choice === '4') await menuGallery();
    else if (choice === '5') await updateSitemaps();
    else if (choice === '6') { console.log('👋 Goodbye!'); cli.close(); return; }
    else console.log('Invalid option.');
  }
}

main().catch((err) => { console.error(err); try { cli.close(); } catch(_) {} });

