// Example: How to integrate the CMS data with your website

// 1. Update the GitHub repository URL
const GITHUB_REPO = 'V-Gutierrez/vgutierrez-cms';
const GITHUB_BRANCH = 'main';
const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data`;

// 2. Replace the sample data loading in your website with these functions:

// Load blog posts index
async function loadBlogPosts() {
  try {
    const response = await fetch(`${BASE_URL}/posts.json`);
    const posts = await response.json();
    return posts.filter(post => post.published);
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}

// Load individual blog post
async function loadBlogPost(postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/post-${postId}.json`);
    const post = await response.json();
    return post;
  } catch (error) {
    console.error('Error loading blog post:', error);
    return null;
  }
}

// Load portfolio projects
async function loadProjects() {
  try {
    const response = await fetch(`${BASE_URL}/projects.json`);
    const projects = await response.json();
    return projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

// Load profile data
async function loadProfile() {
  try {
    const response = await fetch(`${BASE_URL}/profile.json`);
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
}

// 3. Update your website initialization:
document.addEventListener('DOMContentLoaded', async () => {
  // Load profile data for the home page
  const profile = await loadProfile();
  if (profile) {
    updateHomePage(profile);
  }
  
  // Initialize blog posts
  const posts = await loadBlogPosts();
  renderBlogPosts(posts);
  
  // Initialize projects
  const projects = await loadProjects();
  renderProjects(projects);
});

// 4. Example functions to update your website content:

function updateHomePage(profile) {
  // Update hero section
  document.querySelector('.hero-text h1').innerHTML = 
    `${profile.personalInfo.subtitle.split('&')[0]} & <span>${profile.personalInfo.subtitle.split('&')[1]}</span>`;
  
  document.querySelector('.hero-text .description').textContent = 
    profile.personalInfo.description;
  
  // Update skills sections
  updateSkillsSection(profile.skills);
  updateTechnicalStack(profile.technicalStack);
}

function updateSkillsSection(skills) {
  const skillsContainer = document.querySelector('.skills-grid');
  
  skillsContainer.innerHTML = Object.entries(skills).map(([category, skillList]) => `
    <div class="skill-category">
      <h3>${formatCategoryName(category)}</h3>
      <ul class="skills-list">
        ${skillList.map(skill => `<li>${skill}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function formatCategoryName(category) {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

function renderBlogPosts(posts) {
  const container = document.getElementById('blog-posts');
  
  container.innerHTML = posts.map(post => `
    <article class="blog-post" onclick="showPost(${post.id})">
      <h3 class="blog-post-title">${post.title}</h3>
      <div class="blog-post-date">${formatDate(post.date)}</div>
      <p class="blog-post-excerpt">${post.excerpt}</p>
      <div class="blog-post-tags">
        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function renderProjects(projects) {
  const container = document.querySelector('.portfolio-grid');
  
  container.innerHTML = projects.map(project => `
    <div class="project-card">
      <div class="project-image">${project.category}</div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-tech">
          ${project.technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
          ).join('')}
        </div>
        <div class="project-status">${project.status}</div>
      </div>
    </div>
  `).join('');
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 5. Update the showPost function to load from GitHub:
async function showPost(postId) {
  const post = await loadBlogPost(postId);
  if (!post) return;
  
  document.getElementById('post-content').innerHTML = `
    <div class="post-header">
      <h1 class="post-title">${post.title}</h1>
      <div class="post-meta">
        Published on ${formatDate(post.date)} • ${post.readingTime} min read
        <div class="post-tags">
          ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="post-content">
      ${post.content}
    </div>
  `;
  
  // Update page title and meta tags for SEO
  document.title = post.seo.metaTitle;
  updateMetaTags(post.seo);
  
  showTab('post-detail');
}

function updateMetaTags(seo) {
  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = seo.metaDescription;
  
  // Update meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.content = seo.keywords.join(', ');
}