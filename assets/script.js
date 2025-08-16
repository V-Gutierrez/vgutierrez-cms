// Tab Navigation with animations
let currentTab = "home";
let isTransitioning = false;

function showTab(tabName) {
  if (isTransitioning || tabName === currentTab) return;

  isTransitioning = true;
  const tabs = document.querySelectorAll(".tab-content");
  const currentTabElement = document.getElementById(currentTab);
  const newTabElement = document.getElementById(tabName);

  // Determine animation direction
  const tabOrder = ["home", "portfolio", "gallery", "blog", "post-detail"];
  const currentIndex = tabOrder.indexOf(currentTab);
  const newIndex = tabOrder.indexOf(tabName);

  let animationClass = "fade-up";
  if (newIndex > currentIndex) {
    animationClass = "slide-right";
  } else if (newIndex < currentIndex) {
    animationClass = "slide-left";
  }

  // Fade out current tab
  if (currentTabElement) {
    currentTabElement.classList.add("fade-out");

    setTimeout(() => {
      // Hide current tab
      currentTabElement.classList.remove("active", "fade-out");

      // Show new tab with animation
      newTabElement.classList.add("active", animationClass);

      // Clean up animation classes
      setTimeout(() => {
        newTabElement.classList.remove(animationClass);
        isTransitioning = false;
      }, 500);
    }, 300);
  } else {
    // No current tab, just show the new one
    newTabElement.classList.add("active", animationClass);
    setTimeout(() => {
      newTabElement.classList.remove(animationClass);
      isTransitioning = false;
    }, 500);
  }

  // Update current tab reference
  currentTab = tabName;

  // Scroll to top of page smoothly
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  // Update nav links
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => link.classList.remove("active"));

  const activeLink = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // Update progress dots
  updateProgressDots(tabName);
}

// Update progress dots
function updateProgressDots(activeTab) {
  const dots = document.querySelectorAll(".progress-dot");
  dots.forEach((dot) => {
    dot.classList.remove("active");
    if (dot.dataset.tab === activeTab) {
      dot.classList.add("active");
    }
  });
}

// First visit tutorial
function showSwipeTutorial() {
  const hasSeenTutorial = localStorage.getItem("hasSeenSwipeTutorial");
  if (!hasSeenTutorial && window.innerWidth < 1025) {
    const tutorial = document.getElementById("swipe-tutorial");
    setTimeout(() => {
      tutorial.classList.add("show");

      // Auto-hide after 3 seconds
      setTimeout(() => {
        tutorial.classList.remove("show");
        localStorage.setItem("hasSeenSwipeTutorial", "true");
      }, 3000);
    }, 2000); // Show after 2 seconds
  }
}

// Handle tutorial dismissal
function dismissTutorial() {
  const tutorial = document.getElementById("swipe-tutorial");
  tutorial.classList.remove("show");
  localStorage.setItem("hasSeenSwipeTutorial", "true");
}

// Add click event listeners to nav links
// Mobile Menu Toggle
function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  const hamburger = document.querySelector(".hamburger-menu");

  navLinks.classList.toggle("active");
  hamburger.classList.toggle("active");
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    if (isTransitioning) return; // Prevent clicks during transition
    const tab = e.target.dataset.tab;
    showTab(tab);

    // Close mobile menu when a link is clicked
    const navLinks = document.querySelector(".nav-links");
    const hamburger = document.querySelector(".hamburger-menu");
    if (navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
      hamburger.classList.remove("active");
    }
  });
});

// Blog functionality
let blogPosts = [];
const MAX_POSTS_INITIAL = 5;
let allBlogPosts = [];
let displayedPostsCount = 0;

// Sample blog posts (replace with your GitHub API endpoint)
const samplePosts = [];

// Initialize blog posts
function initializeBlog() {
  allBlogPosts = samplePosts;
  displayedPostsCount = 0;
  renderBlogPostsWithLimit();
}

// Render blog posts with progressive loading
function renderBlogPostsWithLimit() {
  const container = document.getElementById("blog-posts");
  if (!container) return;

  if (!allBlogPosts || allBlogPosts.length === 0) {
    container.innerHTML = '<div class="loading">No blog posts available.</div>';
    return;
  }

  // Calculate how many posts to show
  const postsToShow = Math.min(
    displayedPostsCount + MAX_POSTS_INITIAL,
    allBlogPosts.length,
  );
  const postsSlice = allBlogPosts.slice(0, postsToShow);

  // Clear container and render posts
  container.innerHTML = "";
  renderBlogPosts(postsSlice);

  // Update displayed count
  displayedPostsCount = postsToShow;

  // Add blog controls
  addBlogControls(container);
}

// Render blog posts
function renderBlogPosts(posts) {
  const container = document.getElementById("blog-posts");
  if (!container) return;

  const postsHtml = posts
    .map((post) => {
      return `
              <article class="blog-post" onclick="showPost(${post.id})">
                  <h3 class="blog-post-title">${post.title}</h3>
                  <div class="blog-post-date">${new Date(
                    post.date,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</div>
                  <p class="blog-post-excerpt">${post.excerpt}</p>
                  ${
                    post.tags
                      ? `
                      <div class="blog-post-tags">
                          ${post.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
                      </div>
                  `
                      : ""
                  }
                  ${post.readingTime ? `<div class="reading-time">${post.readingTime} min read</div>` : ""}
              </article>
          `;
    })
    .join("");

  if (displayedPostsCount === 0) {
    container.innerHTML = postsHtml;
  } else {
    container.innerHTML += postsHtml;
  }
}

// Add blog counter and load more button
function addBlogControls(container) {
  const blogSection = container.closest("section");
  if (!blogSection) return;

  // Remove existing controls
  const existingControls = blogSection.querySelector(".blog-controls");
  if (existingControls) {
    existingControls.remove();
  }

  // Create controls container
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "blog-controls";

  // Post counter
  const counter = document.createElement("div");
  counter.className = "blog-counter";
  counter.innerHTML = `Showing ${displayedPostsCount} of ${allBlogPosts.length} posts`;

  // Load more button (only if there are more posts)
  if (displayedPostsCount < allBlogPosts.length) {
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.className = "load-more-btn";
    loadMoreBtn.innerHTML = `Load More Posts (+${Math.min(MAX_POSTS_INITIAL, allBlogPosts.length - displayedPostsCount)})`;
    loadMoreBtn.onclick = loadMoreBlogPosts;
    controlsDiv.appendChild(loadMoreBtn);
  }

  controlsDiv.appendChild(counter);
  blogSection.appendChild(controlsDiv);
}

// Load more blog posts function
async function loadMoreBlogPosts() {
  const newPostsStart = displayedPostsCount;
  const newPostsEnd = Math.min(
    displayedPostsCount + MAX_POSTS_INITIAL,
    allBlogPosts.length,
  );
  const newPosts = allBlogPosts.slice(newPostsStart, newPostsEnd);

  // Render new posts with animation
  const container = document.getElementById("blog-posts");
  if (container) {
    const newPostsHtml = newPosts
      .map((post) => generateBlogPostHTML(post))
      .join("");

    // Create temporary container for new posts
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = newPostsHtml;

    // Add new posts with fade-in animation
    Array.from(tempDiv.children).forEach((postElement, index) => {
      postElement.style.opacity = "0";
      postElement.style.transform = "translateY(20px)";
      container.appendChild(postElement);

      // Trigger animation after a small delay for each post
      setTimeout(() => {
        postElement.style.transition = "all 0.5s ease";
        postElement.style.opacity = "1";
        postElement.style.transform = "translateY(0)";
      }, index * 100);
    });
  }

  // Update displayed count
  displayedPostsCount = newPostsEnd;

  // Load full content for new posts
  await loadFullContentForNewPosts(newPosts);

  // Update controls
  const blogSection = container.closest("section");
  if (blogSection) {
    addBlogControls(container);
  }

  // Smooth scroll to new posts
  setTimeout(() => {
    const firstNewPost = container.children[newPostsStart];
    if (firstNewPost) {
      firstNewPost.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, 200);
}

// Generate HTML for a single blog post
function generateBlogPostHTML(post) {
  return `
    <article class="blog-post" onclick="showPost(${post.id})">
      <h3 class="blog-post-title">${post.title}</h3>
      <div class="blog-post-date">${new Date(post.date).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      )}</div>
      <p class="blog-post-excerpt">${post.excerpt}</p>
      ${
        post.tags
          ? `
          <div class="blog-post-tags">
              ${post.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
      `
          : ""
      }
      ${post.readingTime ? `<div class="reading-time">${post.readingTime} min read</div>` : ""}
    </article>
  `;
}

// Load full content for displayed posts only
async function loadFullContentForDisplayedPosts() {
  const displayedPosts = allBlogPosts.slice(0, displayedPostsCount);

  for (let i = 0; i < displayedPosts.length; i++) {
    const post = displayedPosts[i];
    if (!post.content) {
      // Only load if not already loaded
      try {
        const contentUrl = `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/posts/post-${post.id}.json`;
        const contentResponse = await fetch(contentUrl);
        if (contentResponse.ok) {
          const fullPost = await contentResponse.json();
          post.content = fullPost.content;
          post.readingTime = fullPost.readingTime;
          post.author = fullPost.author;
        }
      } catch (error) {
        console.warn(`Failed to load full content for post ${post.id}:`, error);
      }
    }
  }
}

// Load full content for new posts
async function loadFullContentForNewPosts(newPosts) {
  for (let i = 0; i < newPosts.length; i++) {
    const post = newPosts[i];
    if (!post.content) {
      try {
        const contentUrl = `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/posts/post-${post.id}.json`;
        const contentResponse = await fetch(contentUrl);
        if (contentResponse.ok) {
          const fullPost = await contentResponse.json();
          post.content = fullPost.content;
          post.readingTime = fullPost.readingTime;
          post.author = fullPost.author;
        }
      } catch (error) {
        console.warn(`Failed to load full content for post ${post.id}:`, error);
      }
    }
  }
}

// Show individual post
function showPost(postId) {
  const post = allBlogPosts.find((p) => p.id === postId);
  if (!post) return;

  document.getElementById("post-content").innerHTML = `
          <div class="post-header">
              <h1 class="post-title">${post.title}</h1>
              <div class="post-meta">
                  Published on ${new Date(post.date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
              </div>
          </div>
          <div class="post-content">
              ${post.content}
          </div>
      `;

  showTab("post-detail");
}

// Load blog posts from GitHub
async function loadBlogPosts() {
  const blogContainer = document.getElementById("blog-posts");

  try {
    // Show loading state
    if (blogContainer) {
      blogContainer.innerHTML =
        '<div class="loading">🔄 Loading blog posts from GitHub...</div>';
    }

    const postsUrl =
      "https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/posts.json";

    const response = await fetch(postsUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const posts = await response.json();

    const publishedPosts = posts.filter((post) => post.published);

    // Store all posts for progressive loading
    allBlogPosts = publishedPosts;
    displayedPostsCount = 0;

    // Initially show limited number of posts
    renderBlogPostsWithLimit();

    // Load full content for displayed posts only (performance optimization)
    await loadFullContentForDisplayedPosts();

    // Update easter egg data
    if (window.vg) window.vg.blogPosts = allBlogPosts;
  } catch (error) {
    console.error("Error loading blog posts:", error);

    // Show user-friendly error message
    if (blogContainer) {
      blogContainer.innerHTML = `
                  <div class="loading" style="color: #ff6b6b;">
                      <h3>⚠️ Unable to load blog posts</h3>
                      <p><strong>Error:</strong> ${error.message}</p>
                      <p>This usually means:</p>
                      <ul style="text-align: left; margin: 1rem 0;">
                          <li>📁 GitHub repository not created yet</li>
                          <li>🔒 Repository is private (needs to be public)</li>
                          <li>📡 Files not pushed to GitHub yet</li>
                          <li>⏱️ GitHub CDN still updating (wait 1-2 minutes)</li>
                      </ul>
                      <p><strong>Repository URL:</strong><br>
                      <a href="https://github.com/V-Gutierrez/vgutierrez-cms" target="_blank" style="color: #ffd700;">
                          https://github.com/V-Gutierrez/vgutierrez-cms
                      </a></p>
                      <button onclick="loadBlogPosts()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #ffd700; color: #0a0a0a; border: none; border-radius: 4px; cursor: pointer;">
                          🔄 Retry Loading
                      </button>
                  </div>
              `;
    }

    // Fall back to sample data
    initializeBlog();
  }
}

// Project display configuration
const MAX_PROJECTS_INITIAL = 6;
let allProjects = [];
let displayedProjectsCount = 0;

// Load portfolio projects from GitHub
async function loadProjects() {
  const container = document.querySelector(".portfolio-grid");

  try {
    if (container) {
      container.innerHTML = '<div class="loading">Loading projects...</div>';
    }

    const response = await fetch(
      "https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/projects.json",
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const projects = await response.json();

    // Show only featured projects or all projects if no featured ones
    const featuredProjects = projects.filter((project) => project.featured);
    const projectsToShow =
      featuredProjects.length > 0 ? featuredProjects : projects;

    // Randomize project order
    const sortedProjects = projectsToShow.sort(() => Math.random() - 0.5);

    // Store all projects for progressive loading
    allProjects = sortedProjects;
    displayedProjectsCount = 0;

    // Initially show limited number of projects
    renderProjectsWithLimit();

    // Update easter egg data
    if (window.vg) window.vg.projects = sortedProjects;
  } catch (error) {
    console.error("Error loading projects:", error);

    if (container) {
      container.innerHTML = `
        <div class="loading" style="color: #ff6b6b;">
          <h3>⚠️ Unable to load projects</h3>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>Check if the GitHub repository and data files exist</p>
        </div>
      `;
    }
  }
}

// Render projects with progressive loading
function renderProjectsWithLimit() {
  const container = document.querySelector(".portfolio-grid");
  if (!container) return;

  if (!allProjects || allProjects.length === 0) {
    container.innerHTML = '<div class="loading">No projects available</div>';
    return;
  }

  // Calculate how many projects to show
  const projectsToShow = Math.min(
    displayedProjectsCount + MAX_PROJECTS_INITIAL,
    allProjects.length,
  );
  const projectsSlice = allProjects.slice(0, projectsToShow);

  // Clear container and render projects
  container.innerHTML = "";
  renderProjects(projectsSlice);

  // Update displayed count
  displayedProjectsCount = projectsToShow;

  // Add project counter and load more button
  addProjectControls(container);
}

// Add project counter and load more button
function addProjectControls(container) {
  const portfolioSection = container.closest("section");
  if (!portfolioSection) return;

  // Remove existing controls
  const existingControls = portfolioSection.querySelector(".project-controls");
  if (existingControls) {
    existingControls.remove();
  }

  // Create controls container
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "project-controls";

  // Project counter
  const counter = document.createElement("div");
  counter.className = "project-counter";
  counter.innerHTML = `Showing ${displayedProjectsCount} of ${allProjects.length} projects`;

  // Load more button (only if there are more projects)
  if (displayedProjectsCount < allProjects.length) {
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.className = "load-more-btn";
    loadMoreBtn.innerHTML = `Load More Projects (+${Math.min(MAX_PROJECTS_INITIAL, allProjects.length - displayedProjectsCount)})`;
    loadMoreBtn.onclick = loadMoreProjects;
    controlsDiv.appendChild(loadMoreBtn);
  }

  controlsDiv.appendChild(counter);
  portfolioSection.appendChild(controlsDiv);
}

// Generate HTML for a single project
function generateProjectHTML(project) {
  return `
    <div class="project-card">
      <div class="project-image ${project.image ? "" : "no-image"}">
        ${project.image ? `<img src="${project.image}" alt="${project.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='${project.category || "Project"}';">` : project.category || "Project"}
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title || "Untitled Project"}</h3>
        <p class="project-description">${project.description || "No description available"}</p>
        ${
          project.technologies && project.technologies.length > 0
            ? `
        <div class="project-tech">
          ${project.technologies
            .map((tech) => `<span class="tech-tag">${tech}</span>`)
            .join("")}
        </div>
        `
            : ""
        }
        ${
          project.metrics && Object.keys(project.metrics).length > 0
            ? `
            <div class="project-metrics">
              ${Object.entries(project.metrics)
                .map(
                  ([key, value]) =>
                    `<div class="metric"><strong>${formatMetricKey(key)}:</strong> ${value}</div>`,
                )
                .join("")}
            </div>
        `
            : ""
        }
        ${project.status ? `<div class="project-status ${project.status}">${formatStatus(project.status)}</div>` : ""}
      </div>
    </div>
  `;
}

// Load more projects function
function loadMoreProjects() {
  const newProjectsStart = displayedProjectsCount;
  const newProjectsEnd = Math.min(
    displayedProjectsCount + MAX_PROJECTS_INITIAL,
    allProjects.length,
  );
  const newProjects = allProjects.slice(newProjectsStart, newProjectsEnd);

  // Render new projects with animation
  const container = document.querySelector(".portfolio-grid");
  if (container) {
    const newProjectsHtml = newProjects
      .map((project) => generateProjectHTML(project))
      .join("");

    // Create temporary container for new projects
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = newProjectsHtml;

    // Add new projects with fade-in animation
    Array.from(tempDiv.children).forEach((projectElement, index) => {
      projectElement.style.opacity = "0";
      projectElement.style.transform = "translateY(20px)";
      container.appendChild(projectElement);

      // Trigger animation after a small delay for each project
      setTimeout(() => {
        projectElement.style.transition = "all 0.5s ease";
        projectElement.style.opacity = "1";
        projectElement.style.transform = "translateY(0)";
      }, index * 100);
    });
  }

  // Update displayed count
  displayedProjectsCount = newProjectsEnd;

  // Update controls
  const portfolioSection = container.closest("section");
  if (portfolioSection) {
    addProjectControls(container);
  }

  // Smooth scroll to new projects
  setTimeout(() => {
    const firstNewProject = container.children[newProjectsStart];
    if (firstNewProject) {
      firstNewProject.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, 200);
}

// Gallery functionality
let allArtworks = [];
let filteredArtworks = [];
let currentFilter = 'all';
let currentLightboxIndex = 0;

// Load gallery data from GitHub
async function loadGallery() {
  const galleryContainer = document.getElementById('gallery-grid');
  
  try {
    if (galleryContainer) {
      galleryContainer.innerHTML = '<div class="loading">Loading gallery...</div>';
    }
    
    const response = await fetch(
      'https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/gallery.json'
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const artworks = await response.json();
    const publishedArtworks = artworks.filter(artwork => artwork.published);
    
    allArtworks = publishedArtworks;
    filteredArtworks = allArtworks;
    
    renderGallery();
    setupGalleryFilters();
    setupLightbox();
    
    // Update easter egg data
    if (window.vg) window.vg.gallery = allArtworks;
  } catch (error) {
    console.error('Error loading gallery:', error);
    
    if (galleryContainer) {
      galleryContainer.innerHTML = `
        <div class="loading" style="color: #ff6b6b;">
          <h3>⚠️ Unable to load gallery</h3>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>Check if the GitHub repository and gallery data exist</p>
        </div>
      `;
    }
  }
}

// Render gallery grid
function renderGallery() {
  const galleryContainer = document.getElementById('gallery-grid');
  if (!galleryContainer || !filteredArtworks) return;
  
  if (filteredArtworks.length === 0) {
    galleryContainer.innerHTML = '<div class="loading">No artworks found for this filter</div>';
    return;
  }
  
  galleryContainer.innerHTML = filteredArtworks
    .map((artwork, index) => `
      <div class="gallery-item" data-index="${allArtworks.indexOf(artwork)}" onclick="openLightbox(${allArtworks.indexOf(artwork)})">
        <img 
          src="${artwork.thumbnail || artwork.image}" 
          alt="${artwork.title}"
          loading="lazy"
          onerror="this.src='${artwork.image}'"
        >
        <div class="gallery-overlay">
          <h3>${artwork.title}</h3>
          <p>${artwork.year} • ${artwork.technique}</p>
        </div>
      </div>
    `)
    .join('');
  
  // Add animation to gallery items
  const galleryItems = galleryContainer.querySelectorAll('.gallery-item');
  galleryItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    setTimeout(() => {
      item.style.transition = 'all 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

// Setup gallery filters
function setupGalleryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Filter artworks
      currentFilter = filter;
      if (filter === 'all') {
        filteredArtworks = allArtworks;
      } else {
        filteredArtworks = allArtworks.filter(artwork => artwork.category === filter);
      }
      
      renderGallery();
    });
  });
}

// Setup lightbox functionality
function setupLightbox() {
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  
  // Close lightbox
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
      closeLightbox();
    }
  });
  
  // Navigation
  lightboxPrev.addEventListener('click', prevLightboxImage);
  lightboxNext.addEventListener('click', nextLightboxImage);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightboxOverlay.style.display === 'flex') {
      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevLightboxImage();
          break;
        case 'ArrowRight':
          nextLightboxImage();
          break;
      }
    }
  });
}

// Open lightbox
function openLightbox(index) {
  currentLightboxIndex = index;
  const artwork = allArtworks[index];
  
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDescription = document.getElementById('lightbox-description');
  const lightboxTechnique = document.getElementById('lightbox-technique');
  const lightboxYear = document.getElementById('lightbox-year');
  const lightboxDimensions = document.getElementById('lightbox-dimensions');
  const lightboxTags = document.getElementById('lightbox-tags');
  
  lightboxImage.src = artwork.image;
  lightboxImage.alt = artwork.title;
  lightboxTitle.textContent = artwork.title;
  lightboxDescription.textContent = artwork.description;
  lightboxTechnique.textContent = artwork.technique;
  lightboxYear.textContent = artwork.year;
  lightboxDimensions.textContent = artwork.dimensions;
  
  // Render tags
  if (artwork.tags && artwork.tags.length > 0) {
    lightboxTags.innerHTML = artwork.tags
      .map(tag => `<span class="tag">${tag}</span>`)
      .join('');
  } else {
    lightboxTags.innerHTML = '';
  }
  
  lightboxOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Trigger haptic feedback on mobile
  triggerHapticFeedback();
}

// Close lightbox
function closeLightbox() {
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  lightboxOverlay.style.display = 'none';
  document.body.style.overflow = '';
}

// Previous lightbox image
function prevLightboxImage() {
  currentLightboxIndex = currentLightboxIndex > 0 ? currentLightboxIndex - 1 : allArtworks.length - 1;
  openLightbox(currentLightboxIndex);
}

// Next lightbox image
function nextLightboxImage() {
  currentLightboxIndex = currentLightboxIndex < allArtworks.length - 1 ? currentLightboxIndex + 1 : 0;
  openLightbox(currentLightboxIndex);
}

// Load profile data from GitHub
async function loadProfile() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/profile.json",
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const profile = await response.json();
    updateProfileData(profile);

    // Update easter egg data
    if (window.vg) window.vg.profile = profile;
  } catch (error) {
    console.error("Error loading profile:", error);
    showProfileError();
  }
}

// Update profile data on the page
function updateProfileData(profile) {
  if (!profile || !profile.personalInfo) {
    showProfileError();
    return;
  }

  const personalInfo = profile.personalInfo;
  const heroText = document.querySelector(".hero-text");

  if (!heroText) return;

  // Build hero content
  let heroContent = "";

  if (personalInfo.subtitle) {
    const parts = personalInfo.subtitle.split("&");
    if (parts.length > 1) {
      heroContent += `<h1>${parts[0].trim()} & <span>${parts[1].trim()}</span></h1>`;
    } else {
      heroContent += `<h1>${personalInfo.subtitle}</h1>`;
    }
  } else {
    heroContent += "<h1>Profile information not available</h1>";
  }

  if (personalInfo.role) {
    heroContent += `<p class="subtitle">${personalInfo.role}</p>`;
  }

  if (personalInfo.description) {
    heroContent += `<p class="description">${personalInfo.description}</p>`;
  }

  heroContent +=
    '<button class="cta-button" onclick="showTab(\'portfolio\')">View My Work</button>';

  // Add social links and CV download
  heroContent += '<div class="social-links">';

  if (personalInfo.github) {
    heroContent += `
      <a href="${personalInfo.github}" target="_blank" rel="noopener noreferrer" class="social-link">
        <span class="social-icon"><img src="https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/profile/github.png" alt="GitHub" style="width: 20px; height: 20px;"></span>
      </a>
    `;
  }

  if (personalInfo.linkedin) {
    heroContent += `
      <a href="${personalInfo.linkedin}" target="_blank" rel="noopener noreferrer" class="social-link">
        <span class="social-icon">
<img src="https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/profile/linkedin.png" alt="LinkedIn" style="width: 20px; height: 20px;">
</span>
      </a>
    `;
  }

  if (personalInfo.whatsApp) {
    heroContent += `
      <a href="${personalInfo.whatsApp}" target="_blank" rel="noopener noreferrer" class="social-link">
        <span class="social-icon">
<img src="https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/profile/whatsapp.png" alt="WhatsApp" style="width: 20px; height: 20px;">
</span>

      </a>
    `;
  }

  // Add CV download button (always available)
  heroContent += `
    <a href="https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/assets/Victor_Gutierrez_CV_2025_EN.pdf" download="Victor_Gutierrez_CV_2025_EN.pdf" class="social-link">
      <span class="social-icon">📄</span>
      CV
    </a>
  `;

  heroContent += "</div>";

  heroText.innerHTML = heroContent;

  // Update profile image
  const profilePlaceholder = document.querySelector(".profile-placeholder");
  if (profilePlaceholder) {
    if (personalInfo.profileImage) {
      profilePlaceholder.innerHTML = `<img src="${personalInfo.profileImage}" alt="${personalInfo.name || "Profile"}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 18px;" onerror="this.style.display='none'; this.parentElement.innerHTML='Profile Image';">`;
    } else {
      profilePlaceholder.innerHTML = "Profile Image";
    }
  }

  // Update skills section
  if (profile.skills) {
    updateSkillsSection(profile.skills);
  } else {
    showSkillsError();
  }

  // Update languages section
  if (profile.languages) {
    updateLanguagesSection(profile.languages);
  }

  // Update education section
  if (profile.education) {
    updateEducationSection(profile.education);
  }

  // Update technical stack section
  if (profile.technicalStack) {
    updateTechnicalStackSection(profile.technicalStack);
  }
}

function showProfileError() {
  const heroText = document.querySelector(".hero-text");
  if (heroText) {
    heroText.innerHTML = `
      <div class="loading" style="color: #ff6b6b;">
        <h3>⚠️ Profile data not available</h3>
        <p>Unable to load profile information from API</p>
      </div>
    `;
  }
}

// Update skills section with profile data
function updateSkillsSection(skills) {
  const skillsGrid = document.querySelector(".skills-grid");
  if (!skillsGrid) return;

  if (!skills || Object.keys(skills).length === 0) {
    skillsGrid.innerHTML =
      '<div class="loading">No skills data available</div>';
    return;
  }

  const skillCategories = {
    leadershipAndStrategy: "🧭 Leadership & Strategy",
    architectureAndSystems: "🏗️ Architecture & Systems",
    engineeringExcellence: "🔧 Engineering Excellence",
    businessAndProduct: "📦 Business & Product",
    technicalStack: "Technical Stack",
    languages: "Languages",
  };

  const hasAnySkills = Object.keys(skills).some(
    (key) => skills[key] && skills[key].length > 0,
  );

  if (!hasAnySkills) {
    skillsGrid.innerHTML = '<div class="loading">No skills available</div>';
    return;
  }

  skillsGrid.innerHTML = Object.entries(skillCategories)
    .filter(([key]) => skills[key] && skills[key].length > 0)
    .map(([key, title]) => {
      const skillList = skills[key];
      return `
        <div class="skill-category">
          <h3>${title}</h3>
          <ul class="skills-list">
            ${skillList.map((skill) => `<li>${skill}</li>`).join("")}
          </ul>
        </div>
      `;
    })
    .join("");
}

function showSkillsError() {
  const skillsGrid = document.querySelector(".skills-grid");
  if (skillsGrid) {
    skillsGrid.innerHTML = `
      <div class="loading" style="color: #ff6b6b;">
        <h3>⚠️ Skills data not available</h3>
        <p>Unable to load skills information from API</p>
      </div>
    `;
  }
}

// Update project rendering to handle GitHub data
function renderProjects(projects) {
  const container = document.querySelector(".portfolio-grid");
  if (!container) return;

  if (!projects || projects.length === 0) {
    container.innerHTML = '<div class="loading">No projects available</div>';
    return;
  }

  container.innerHTML = projects
    .map(
      (project) => `
          <div class="project-card">
              <div class="project-image ${project.image ? "" : "no-image"}">
                  ${project.image ? `<img src="${project.image}" alt="${project.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='${project.category || "Project"}';">` : project.category || "Project"}
              </div>
              <div class="project-content">
                  <h3 class="project-title">${project.title || "Untitled Project"}</h3>
                  <p class="project-description">${project.description || "No description available"}</p>
                  ${
                    project.technologies && project.technologies.length > 0
                      ? `
                  <div class="project-tech">
                      ${project.technologies
                        .map((tech) => `<span class="tech-tag">${tech}</span>`)
                        .join("")}
                  </div>
                  `
                      : ""
                  }
                  ${
                    project.metrics && Object.keys(project.metrics).length > 0
                      ? `
                      <div class="project-metrics">
                          ${Object.entries(project.metrics)
                            .map(
                              ([key, value]) =>
                                `<div class="metric"><strong>${formatMetricKey(key)}:</strong> ${value}</div>`,
                            )
                            .join("")}
                      </div>
                  `
                      : ""
                  }
                  ${project.status ? `<div class="project-status ${project.status}">${formatStatus(project.status)}</div>` : ""}
              </div>
          </div>
      `,
    )
    .join("");
}

// Format metric keys for display
function formatMetricKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ");
}

// Format status for display
function formatStatus(status) {
  return status.replace(/-/g, " ").toUpperCase();
}

// Update languages section
function updateLanguagesSection(languages) {
  const languagesGrid = document.getElementById("languages-grid");
  if (!languagesGrid) return;

  if (!languages || languages.length === 0) {
    languagesGrid.innerHTML =
      '<div class="loading">No languages data available</div>';
    return;
  }

  const languageFlags = {
    Portuguese: "🇧🇷",
    Spanish: "🇪🇸",
    English: "🇺🇸",
    Italian: "🇮🇹",
    French: "🇫🇷",
  };

  languagesGrid.innerHTML = languages
    .map((lang) => {
      const flag = languageFlags[lang.language] || "🌐";
      return `
        <div class="language-item">
          <div class="language-flag">${flag}</div>
          <div class="language-info">
            <div class="language-name">${lang.language}</div>
            <div class="language-level">${lang.level}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Update education section
function updateEducationSection(education) {
  const educationContainer = document.getElementById("education-timeline");
  if (!educationContainer) return;

  if (!education || education.length === 0) {
    educationContainer.innerHTML =
      '<div class="loading">No education data available</div>';
    return;
  }

  const educationIcons = {
    bachelor: "🎓",
    master: "📚",
    phd: "🔬",
    certificate: "📜",
    diploma: "🎖️",
  };

  educationContainer.innerHTML = education
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)) // Sort by start date, newest first
    .map((edu) => {
      const degreeType = edu.degree.toLowerCase().includes("bachelor")
        ? "bachelor"
        : edu.degree.toLowerCase().includes("master")
          ? "master"
          : edu.degree.toLowerCase().includes("phd")
            ? "phd"
            : edu.degree.toLowerCase().includes("certificate")
              ? "certificate"
              : "diploma";

      const icon = educationIcons[degreeType] || "🎓";

      const startYear = new Date(edu.startDate).getFullYear();
      const endYear =
        edu.status === "in-progress"
          ? "Present"
          : new Date(edu.endDate).getFullYear();
      const period = `${startYear} - ${endYear}`;

      const statusText =
        edu.status === "in-progress" ? "Currently Pursuing" : "Completed";
      const statusClass =
        edu.status === "in-progress" ? "in-progress" : "completed";

      return `
        <div class="education-item">
          <div class="education-icon">${icon}</div>
          <div class="education-content">
            <div class="education-degree">${edu.degree}</div>
            <div class="education-institution">${edu.institution}</div>
            <div class="education-period">${period} • ${statusText}</div>
            ${edu.location ? `<div class="education-description">${edu.location}</div>` : ""}
          </div>
        </div>
      `;
    })
    .join("");
}

// Update technical stack section
function updateTechnicalStackSection(technicalStack) {
  const techContainer = document.getElementById("tech-categories");
  if (!techContainer) return;

  if (!technicalStack || Object.keys(technicalStack).length === 0) {
    techContainer.innerHTML =
      '<div class="loading">No technical stack data available</div>';
    return;
  }

  const categoryNames = {
    backend: "Backend Technologies",
    databases: "Databases",
    devops: "DevOps & Infrastructure",
    cloud: "Cloud Platforms",
  };

  techContainer.innerHTML = Object.entries(technicalStack)
    .filter(([key, technologies]) => technologies && technologies.length > 0)
    .map(([category, technologies]) => {
      const categoryTitle =
        categoryNames[category] ||
        category.charAt(0).toUpperCase() + category.slice(1);
      return `
        <div class="tech-category">
          <h4>${categoryTitle}</h4>
          <div class="tech-items">
            ${technologies.map((tech) => `<span class="tech-item">${tech}</span>`).join("")}
          </div>
        </div>
      `;
    })
    .join("");
}

// Easter egg for console explorers
function showEasterEgg() {
  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║  👨‍💻 Hey there, fellow developer! 🕵️‍♀️                           ║
  ║                                                              ║
  ║  You found the secret console easter egg! 🥚                 ║
  ║                                                              ║
  ║  Since you're here, here are some fun facts:                ║
  ║  • This site is 100% vanilla JS (no frameworks!)            ║
  ║  • Uses GitHub Pages as a headless CMS                      ║
  ║  • Built with performance and simplicity in mind            ║
  ║  • Features smooth tab animations with cubic-bezier         ║
  ║                                                              ║
  ║  Want to see the source? Check it out:                      ║
  ║  🔗 https://github.com/V-Gutierrez/vgutierrez-cms           ║
  ║                                                              ║
  ║  Keep exploring! There might be more secrets... 👀          ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
  `);

  console.log(
    "%c🚀 Pro tip:",
    "color: #ffd700; font-weight: bold; font-size: 14px;",
  );
  console.log(
    '%cTry typing "vg.projects" or "vg.profile" to inspect the data!',
    "color: #cccccc; font-style: italic;",
  );

  // Make data available for exploration
  window.vg = {
    projects: [],
    profile: null,
    blogPosts: [],
    greeting: () => console.log("👋 Hello from Victor Gutierrez!"),
    contact: () =>
      console.log(
        "📫 Want to get in touch? Check the social links on the homepage!",
      ),
  };
}

// Intersection Observer for scroll-triggered animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;

        // Add animate class to trigger animation
        element.classList.add("animate");

        // Handle staggered animations for child elements
        if (element.classList.contains("skills-grid")) {
          const skillCategories = element.querySelectorAll(".skill-category");
          skillCategories.forEach((category, index) => {
            setTimeout(() => {
              category.classList.add("animate");
            }, index * 100);
          });
        }

        if (element.classList.contains("languages-section")) {
          const languageItems = element.querySelectorAll(".language-item");
          languageItems.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add("animate");
            }, index * 100);
          });
        }

        if (element.classList.contains("education-section")) {
          const educationItems = element.querySelectorAll(".education-item");
          educationItems.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add("animate");
            }, index * 150);
          });
        }

        if (element.classList.contains("tech-stack-section")) {
          const techCategories = element.querySelectorAll(".tech-category");
          techCategories.forEach((category, index) => {
            setTimeout(() => {
              category.classList.add("animate");
            }, index * 100);
          });
        }

        // Stop observing once animated
        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Observe all animatable elements
  const animatableElements = document.querySelectorAll(`
    .section-header,
    .skills-grid,
    .languages-section,
    .education-section,
    .tech-stack-section
  `);

  animatableElements.forEach((element) => {
    observer.observe(element);
  });
}

// Mobile touch gestures for tab navigation
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let isDragging = false;

function setupMobileGestures() {
  const main = document.querySelector("main");

  main.addEventListener("touchstart", handleTouchStart, {
    passive: true,
  });
  main.addEventListener("touchmove", handleTouchMove, { passive: false });
  main.addEventListener("touchend", handleTouchEnd, { passive: true });
}

function handleTouchStart(e) {
  if (isTransitioning) return;

  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
  isDragging = false;
}

function handleTouchMove(e) {
  if (isTransitioning) return;

  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;

  const deltaX = touchX - touchStartX;
  const deltaY = touchY - touchStartY;

  // Check if horizontal swipe (more horizontal than vertical)
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    isDragging = true;
    e.preventDefault(); // Prevent scrolling

    // Add visual feedback
    const currentTabElement = document.getElementById(currentTab);
    if (currentTabElement) {
      const opacity = Math.max(0.7, 1 - Math.abs(deltaX) / 300);
      currentTabElement.style.opacity = opacity;
      currentTabElement.style.transform = `translateX(${deltaX * 0.2}px)`;
    }
  }
}

function handleTouchEnd(e) {
  if (isTransitioning || !isDragging) {
    // Reset any visual changes
    resetTouchFeedback();
    return;
  }

  const touchEndX = e.changedTouches[0].clientX;
  const deltaX = touchEndX - touchStartX;
  const deltaTime = Date.now() - touchStartTime;
  const velocity = Math.abs(deltaX) / deltaTime;

  // Reset visual feedback
  resetTouchFeedback();

  // Determine if swipe was significant enough
  const minDistance = 80;
  const minVelocity = 0.3;

  if (Math.abs(deltaX) > minDistance || velocity > minVelocity) {
    // Special handling for post detail page
    if (currentTab === "post-detail") {
      // On post detail page, only allow swipe right (back to blog)
      if (deltaX > 0) {
        triggerHapticFeedback();
        showTab("blog");
      }
      return;
    }

    const tabOrder = ["home", "portfolio", "blog"];
    const currentIndex = tabOrder.indexOf(currentTab);

    if (deltaX > 0 && currentIndex > 0) {
      // Swipe right - go to previous tab
      triggerHapticFeedback();
      showTab(tabOrder[currentIndex - 1]);
      dismissTutorial(); // Dismiss tutorial on first swipe
    } else if (deltaX < 0 && currentIndex < tabOrder.length - 1) {
      // Swipe left - go to next tab
      triggerHapticFeedback();
      showTab(tabOrder[currentIndex + 1]);
      dismissTutorial(); // Dismiss tutorial on first swipe
    }
  }

  isDragging = false;
}

// Haptic feedback for supported devices
function triggerHapticFeedback() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  } catch (error) {
    // Haptic feedback not supported, ignore
  }
}

function resetTouchFeedback() {
  const currentTabElement = document.getElementById(currentTab);
  if (currentTabElement) {
    currentTabElement.style.opacity = "";
    currentTabElement.style.transform = "";
  }
}

// Initialize the site when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Show easter egg for console users
  showEasterEgg();

  // Setup scroll-triggered animations
  setupScrollAnimations();

  // Setup mobile touch gestures
  setupMobileGestures();

  // Setup progress dots click handlers
  setupProgressDots();

  // Setup tutorial dismiss handler
  setupTutorial();

  // Show swipe tutorial for first-time mobile users
  showSwipeTutorial();

  // Setup scroll detection for progress dots
  setupScrollDetection();

  // Load content from GitHub or use fallbacks
  loadProfile();
  loadProjects();
  loadBlogPosts();
  loadGallery();
});

// Setup progress dots click functionality
function setupProgressDots() {
  const dots = document.querySelectorAll(".progress-dot");
  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      if (isTransitioning) return;
      const tabName = e.target.dataset.tab;
      if (tabName && tabName !== currentTab) {
        showTab(tabName);
      }
    });
  });
}

// Setup tutorial click to dismiss
function setupTutorial() {
  const tutorial = document.getElementById("swipe-tutorial");
  tutorial.addEventListener("click", dismissTutorial);
}

// Setup scroll detection to show progress dots at end of all pages
function setupScrollDetection() {
  if (window.innerWidth >= 1025) return; // Only on mobile and tablets

  let isProgressVisible = false;

  function checkScrollPosition() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercentage = (scrollPosition / documentHeight) * 100;

    // Show progress dots when user reaches 70% of any page
    if (scrollPercentage > 70 && !isProgressVisible) {
      showProgressDots();
      isProgressVisible = true;
    } else if (scrollPercentage <= 50 && isProgressVisible) {
      hideProgressDots();
      isProgressVisible = false;
    }
  }

  window.addEventListener("scroll", checkScrollPosition, {
    passive: true,
  });

  // Override the showTab function to reset scroll detection
  const originalShowTab = window.showTab;
  window.showTab = function (tabName) {
    originalShowTab.call(this, tabName);
    // Reset progress dots visibility and recheck position
    setTimeout(() => {
      isProgressVisible = false;
      hideProgressDots();
      checkScrollPosition();
    }, 100);
  };
}

function showProgressDots() {
  const progressDots = document.querySelector(".tab-progress");
  const header = document.querySelector("header");

  if (progressDots) {
    progressDots.classList.add("show");
  }

  // Hide header on touch devices to avoid redundancy
  if (header && window.innerWidth < 1025) {
    header.classList.add("hide-for-dots");
  }
}

function hideProgressDots() {
  const progressDots = document.querySelector(".tab-progress");
  const header = document.querySelector("header");

  if (progressDots) {
    progressDots.classList.remove("show");
  }

  // Show header again
  if (header) {
    header.classList.remove("hide-for-dots");
  }
}
