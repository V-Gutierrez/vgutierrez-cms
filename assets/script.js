// Tab Navigation with animations
let currentTab = "home";
let isTransitioning = false;

// Routing system
const Router = {
  // Parse current hash and extract route information
  parseHash() {
    const hash = window.location.hash.slice(1); // Remove #
    if (!hash) return { tab: "home", params: {} };

    const parts = hash.split("/");
    const tab = parts[0];

    // Handle post URLs like #post/slug
    if (tab === "post" && parts[1]) {
      return { tab: "post-detail", params: { postSlug: parts[1] } };
    }

    return { tab, params: {} };
  },

  // Navigate to a route
  navigate(route) {
    const { tab, params } = route;

    // Special handling for post detail
    if (tab === "post-detail" && params.postSlug) {
      showPost(params.postSlug, false); // Don't update URL to avoid loop
      return;
    }

    // Regular tab navigation
    showTab(tab, false); // Don't update URL to avoid loop
  },

  // Update URL without triggering navigation
  updateURL(tab, params = {}) {
    if (tab === "post-detail" && params.postSlug) {
      window.location.hash = `#post/${params.postSlug}`;
    } else {
      window.location.hash = `#${tab}`;
    }
  },

  // Initialize routing
  init() {
    // Handle hash changes (back/forward buttons)
    window.addEventListener("hashchange", () => {
      const route = this.parseHash();
      this.navigate(route);
    });

    // Store initial route for later loading
    this.initialRoute = this.parseHash();
  },

  // Load initial route after content is loaded
  loadInitialRoute() {
    if (
      this.initialRoute &&
      (this.initialRoute.tab !== "home" || this.initialRoute.params.postSlug)
    ) {
      this.navigate(this.initialRoute);
    }
  },
};

// Centralized configuration and helpers
const CONFIG = {
  BREAKPOINT: 1025,
  API_BASE:
    "https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data",
  BATCH: { posts: 5 },
  DURATIONS: { tabFade: 300, tabEnter: 500 },
};

const PATHS = {
  posts: "posts.json",
  post: (slug) => `posts/${slug}.json`,
  gallery: "gallery.json",
};

// Lightweight DOM/data utilities
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const setHTML = (el, html) => {
  if (el) el.innerHTML = html;
};
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatRelativeTime = (dateString) => {
  const postDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - postDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "today";
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
};
const updateActiveByDataAttr = (selector, dataKey, value) => {
  $$(selector).forEach((el) =>
    el.classList.toggle("active", el.dataset[dataKey] === value),
  );
};

// Update page title for GTM tracking and better UX
const updatePageTitle = (tab, postTitle = null) => {
  const baseName = "Victor Gutierrez";

  if (postTitle) {
    document.title = `${baseName} - ${postTitle}`;
  } else if (tab === "home") {
    document.title = baseName;
  } else if (tab === "gallery") {
    document.title = `${baseName} - Gallery`;
  } else if (tab === "blog") {
    document.title = `${baseName} - Blog`;
  } else if (tab === "post-detail") {
    document.title = `${baseName} - Post`;
  } else {
    document.title = baseName;
  }
};

function showTab(tabName, updateURL = true) {
  if (isTransitioning || tabName === currentTab) return;

  isTransitioning = true;

  // Update page title for GTM tracking
  updatePageTitle(tabName);

  // Update URL unless explicitly disabled (to prevent hashchange loops)
  if (updateURL) {
    Router.updateURL(tabName);
  }
  const currentTabElement = document.getElementById(currentTab);
  const newTabElement = document.getElementById(tabName);

  const isMobile = window.innerWidth < 1025;

  if (isMobile) {
    // Mobile: switch instantly without animations to avoid layout shift
    if (newTabElement) newTabElement.classList.add("active");
    if (currentTabElement)
      currentTabElement.classList.remove(
        "active",
        "fade-out",
        "slide-right",
        "slide-left",
        "fade-up",
      );
    isTransitioning = false;
  } else {
    // Desktop: keep animated transitions
    const tabOrder = ["home", "gallery", "blog", "post-detail"];
    const currentIndex = tabOrder.indexOf(currentTab);
    const newIndex = tabOrder.indexOf(tabName);

    let animationClass = "fade-up";
    if (newIndex > currentIndex) {
      animationClass = "slide-right";
    } else if (newIndex < currentIndex) {
      animationClass = "slide-left";
    }

    if (currentTabElement) {
      currentTabElement.classList.add("fade-out");

      setTimeout(() => {
        currentTabElement.classList.remove("active", "fade-out");
        newTabElement.classList.add("active", animationClass);

        setTimeout(() => {
          newTabElement.classList.remove(animationClass);
          isTransitioning = false;
        }, 500);
      }, 300);
    } else {
      newTabElement.classList.add("active", animationClass);
      setTimeout(() => {
        newTabElement.classList.remove(animationClass);
        isTransitioning = false;
      }, 500);
    }
  }

  // Update current tab reference
  currentTab = tabName;

  // Scroll to top of page
  if (isMobile) {
    window.scrollTo(0, 0);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
let allBlogPosts = [];

// Templates
const templates = {
  blogCard: (post) => `
    <article class="blog-post" data-slug="${post.slug}" onclick="showPost('${post.slug}')">
      <h3 class="blog-post-title">${post.title}</h3>
      <div class="blog-post-meta">
        <span class="blog-post-date">${formatRelativeTime(post.date)}</span>
        ${post.readingTime ? `<span class="meta-separator">•</span><span class="reading-time">${post.readingTime} min read</span>` : ""}
      </div>
      <p class="blog-post-excerpt">${post.excerpt}</p>
    </article>
  `,
};

// Enhance: inject reading time into already-rendered cards when it becomes available
function injectReadingTimes(posts) {
  posts.forEach((post) => {
    if (!post || !post.slug || !post.readingTime) return;
    const card = document.querySelector(`.blog-post[data-slug="${post.slug}"]`);
    const metaDiv = card?.querySelector(".blog-post-meta");
    if (card && metaDiv && !card.querySelector(".reading-time")) {
      // Create separator and reading time elements
      const separator = document.createElement("span");
      separator.className = "meta-separator";
      separator.textContent = "•";
      
      const rt = document.createElement("span");
      rt.className = "reading-time";
      rt.textContent = `${post.readingTime} min read`;
      
      // Add to meta div
      metaDiv.appendChild(separator);
      metaDiv.appendChild(rt);
    }
  });
}

// Render all blog posts
function renderBlogPosts() {
  const container = document.getElementById("blog-posts");
  if (!container) return;

  if (!allBlogPosts || allBlogPosts.length === 0) {
    container.innerHTML = '<div class="loading">No blog posts available.</div>';
    return;
  }

  const postsHtml = allBlogPosts.map(templates.blogCard).join("");
  container.innerHTML = postsHtml;
}

// Render latest post preview in home
function renderLatestPostInHome() {
  const container = document.getElementById("latest-post-preview");
  if (!container) return;

  // Only render if there are posts available
  if (!allBlogPosts || allBlogPosts.length === 0) {
    container.innerHTML = '';
    return;
  }

  // Get the most recent post (already sorted by date)
  const latestPost = allBlogPosts[0];

  // Create a minimal card for the home page
  container.innerHTML = `
    <div class="latest-post-card" onclick="showPost('${latestPost.slug}')">
      <div class="latest-post-label">Latest Post</div>
      <h3 class="blog-post-title">${latestPost.title}</h3>
      <div class="blog-post-meta">
        <span class="blog-post-date">${formatRelativeTime(latestPost.date)}</span>
        ${latestPost.readingTime ? `<span class="meta-separator">•</span><span class="reading-time">${latestPost.readingTime} min read</span>` : ""}
      </div>
      <p class="blog-post-excerpt">${latestPost.excerpt}</p>
    </div>
  `;
}


// Load full content for displayed posts only
async function loadFullContentForPosts(postsSubset) {
  for (let i = 0; i < postsSubset.length; i++) {
    const post = postsSubset[i];
    if (!post.content) {
      try {
        const contentUrl = `${CONFIG.API_BASE}/${PATHS.post(post.slug)}`;
        const contentResponse = await fetch(contentUrl);
        if (contentResponse.ok) {
          const fullPost = await contentResponse.json();
          post.content = fullPost.content;
          post.readingTime = fullPost.readingTime;
          post.author = fullPost.author;
        }
      } catch (error) {
        console.warn(
          `Failed to load full content for post ${post.slug}:`,
          error,
        );
      }
    }
  }
}


// Show individual post
function showPost(postSlug, updateURL = true) {
  const post = allBlogPosts.find((p) => p.slug === postSlug);
  if (!post) return;

  // Update page title with post name
  updatePageTitle("post-detail", post.title);

  // Update URL unless explicitly disabled
  if (updateURL) {
    Router.updateURL("post-detail", { postSlug });
  }

  const shareIconSVG = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
    </svg>
  `;

  const postMeta = `
    <div class="post-meta">
      <p class="post-date">Published on ${new Date(
        post.date,
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
      <div class="post-share">
        <button class="share-button" onclick="sharePost('${postSlug}', this)">
          <span class="share-icon">${shareIconSVG}</span>
        </button>
      </div>
    </div>
  `;

  document.getElementById("post-content").innerHTML = `
          <div class="post-header">
              <h1 class="post-title">${post.title}</h1>
          </div>
          <div class="post-content">
              ${post.content}
          </div>
          ${postMeta}
      `;

  showTab("post-detail", !updateURL); // Invert the updateURL for showTab
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

    const postsUrl = `${CONFIG.API_BASE}/${PATHS.posts}`;
    const response = await fetch(postsUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const posts = await response.json();

    // Get today's date in YYYY-MM-DD format for comparison (using local timezone)
    const now = new Date();
    const today = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0');

    // Filter posts: must be published AND date must be today or earlier
    const publishedPosts = posts.filter((post) => 
      post.published && post.date <= today
    );

    // Sort posts by date (newest first)
    publishedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Store all posts
    allBlogPosts = publishedPosts;

    // Render all posts
    renderBlogPosts();

    // Load full content for all posts
    await loadFullContentForPosts(allBlogPosts);
    // Inject reading time into all cards after content loads
    injectReadingTimes(allBlogPosts);

    // Render latest post in home
    renderLatestPostInHome();

    // Load initial route after blog posts are loaded
    Router.loadInitialRoute();
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

    // Still try to load initial route (for non-post routes)
    Router.loadInitialRoute();
  }
}







// Load profile data from GitHub
async function loadProfile() {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/profile.json`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const profile = await response.json();
    updateProfileData(profile);
    updateFooter(profile);

    // Update easter egg data
    if (window.vg) window.vg.profile = profile;
  } catch (error) {
    console.error("Error loading profile:", error);
    showProfileError();
  }
}

// Typewriter effect for hero text
function typewriterEffect(element, text, callback) {
  let i = 0;
  element.textContent = "";

  function typeChar() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typeChar, 50 + Math.random() * 50); // Variable speed for natural feel
    } else if (callback) {
      callback();
    }
  }

  typeChar();
}

// Update profile data on the page
function updateProfileData(profile) {
  if (!profile || !profile.personalInfo) {
    showProfileError();
    return;
  }

  const personalInfo = profile.personalInfo;

  // Update profile image
  const profilePlaceholder = document.querySelector(".profile-placeholder");
  if (profilePlaceholder) {
    if (personalInfo.profileImage) {
      profilePlaceholder.innerHTML = `<img src="${personalInfo.profileImage}" alt="${personalInfo.name || "Profile"}" class="profile-image">`;
    } else {
      profilePlaceholder.innerHTML = "Profile Image";
    }
  }
}

// Update footer with profile data
function updateFooter(profile) {
  if (!profile || !profile.personalInfo) return;

  const personalInfo = profile.personalInfo;
  const footerGithub = document.getElementById("footer-github");
  const footerLinkedin = document.getElementById("footer-linkedin");

  if (footerGithub && personalInfo.github) {
    footerGithub.href = personalInfo.github;
  }

  if (footerLinkedin && personalInfo.linkedin) {
    footerLinkedin.href = personalInfo.linkedin;
  }
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

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Observe all animatable elements
  const animatableElements = document.querySelectorAll(`
    .section-header
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
    e.preventDefault(); // Prevent vertical scroll while swiping

    // Remove visual feedback on mobile to avoid layout shifts
    // (Keep content stable during gesture)
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

    const tabOrder = ["home", "gallery", "blog"];
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
  // Initialize routing system
  Router.init();

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

  // Load content from GitHub or use fallbacks
  loadProfile();
  loadBlogPosts();

  // Setup gallery
  setupGalleryFilters();
  loadGalleryImages();
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



// Gallery functionality
let galleryImages = [];

async function loadGalleryImages() {
  const container = document.querySelector(".gallery-grid");

  try {
    // Show loading state
    if (container) {
      container.innerHTML =
        '<div class="loading">🎨 Loading gallery images...</div>';
    }

    const response = await fetch(`${CONFIG.API_BASE}/${PATHS.gallery}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const images = await response.json();

    // Filter for published images only
    const publishedImages = images.filter((image) => image.published);

    // Transform to expected format for renderGallery function
    galleryImages = publishedImages.map((image) => ({
      id: image.id,
      name: image.title,
      description: image.description,
      url: image.image,
    }));

    // Shuffle gallery images
    galleryImages = galleryImages.sort(() => Math.random() - 0.5);

    renderGallery();
    if (window.vg) window.vg.gallery = galleryImages;
  } catch (error) {
    console.error("Error loading gallery:", error);

    if (container) {
      container.innerHTML = `
        <div class="loading" style="color: #ff6b6b;">
          <h3>⚠️ Unable to load gallery images</h3>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>Check if the GitHub repository and gallery.json file exist</p>
          <button onclick="loadGalleryImages()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #ffd700; color: #0a0a0a; border: none; border-radius: 4px; cursor: pointer;">
            🔄 Retry Loading
          </button>
        </div>
      `;
    }
  }
}

function renderGallery(filter) {
  const container = document.querySelector(".gallery-grid");
  if (!container) return;

  if (galleryImages.length === 0) {
    container.innerHTML = '<div class="loading">No images found</div>';
    return;
  }

  // Randomize order each render
  const randomized = galleryImages.slice().sort(() => Math.random() - 0.5);

  container.innerHTML = randomized
    .map(
      (image, index) => `
    <div class="gallery-item animate" onclick="openGalleryModal('${image.url}', '${image.name}')" 
         style="animation-delay: ${index * 0.1}s">
      <img src="${image.url}" alt="${image.name}" loading="lazy" 
           onerror="this.parentElement.style.display='none';">
      <div class="gallery-item-info">
        <div class="gallery-item-name">${image.name}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

function openGalleryModal(imageUrl, imageName) {
  const modal = document.getElementById("gallery-modal");
  const modalImage = document.getElementById("gallery-modal-image");

  if (modal && modalImage) {
    modalImage.src = imageUrl;
    modalImage.alt = imageName;
    modal.classList.add("active");

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }
}

function closeGalleryModal() {
  const modal = document.getElementById("gallery-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Setup gallery filter buttons
function setupGalleryFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // Update active state
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Filter gallery
      const filter = btn.dataset.filter;
      renderGallery(filter);
    });
  });
}

// Close modal on ESC key or background click
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeGalleryModal();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("gallery-modal")) {
    closeGalleryModal();
  }
});

// Share functionality for posts
function sharePost(postSlug, buttonElement) {
  const shareButton = buttonElement;

  // Get post data for native sharing
  const post = allBlogPosts.find((p) => p.slug === postSlug);
  const postUrl = `${window.location.origin}${window.location.pathname}#post/${postSlug}`;

  // Try Web Share API first (native device integration)
  if (navigator.share && post) {
    navigator
      .share({
        title: post.title,
        text:
          post.excerpt ||
          `Check out this post by Victor Gutierrez: ${post.title}`,
        url: postUrl,
      })
      .then(() => {
        showShareSuccess(shareButton, "shared");
      })
      .catch((error) => {
        // User cancelled or error occurred, fallback to clipboard
        if (error.name !== "AbortError") {
          copyToClipboard(postUrl, shareButton);
        }
      });
  } else {
    // Fallback to clipboard copy
    copyToClipboard(postUrl, shareButton);
  }
}

function copyToClipboard(postUrl, shareButton) {
  // Try to copy to clipboard
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        showShareSuccess(shareButton, "copied");
      })
      .catch(() => {
        // Silent fail - could add a toast notification here
        console.log("Failed to copy to clipboard");
      });
  } else {
    // Fallback for older browsers - just show success
    showShareSuccess(shareButton, "copied");
  }
}

function showShareSuccess(shareButton, type) {
  // Add success state
  shareButton.classList.add("success");

  // Reset after 2 seconds
  setTimeout(() => {
    shareButton.classList.remove("success");
  }, 2000);
}
