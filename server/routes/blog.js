const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const {
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
  POSTS_DIR
} = require('../utils/cms-utils');

// GET /api/blog - List all posts
router.get('/', async (req, res) => {
  try {
    const posts = await loadJsonFile('posts.json');
    res.json(posts);
  } catch (error) {
    console.error('Error loading posts:', error);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// GET /api/blog/:slug - Get specific post
router.get('/:slug', async (req, res) => {
  try {
    const posts = await loadJsonFile('posts.json');
    const post = posts.find(p => p.slug === req.params.slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Load full content
    const contentPath = path.join(POSTS_DIR, `${post.slug}.json`);
    const fullPost = JSON.parse(await fs.readFile(contentPath, 'utf8'));

    res.json(fullPost);
  } catch (error) {
    console.error('Error loading post:', error);
    res.status(500).json({ error: 'Failed to load post' });
  }
});

// POST /api/blog - Create new post
router.post('/', async (req, res) => {
  try {
    const { title, excerpt, tags, content, date } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const posts = await loadJsonFile('posts.json');
    const uuid = generateId();
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug, posts);

    // Format date
    let formattedDate;
    if (date && isValidDateFormat(date)) {
      formattedDate = formatDateForStorage(date);
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }

    const postIndex = {
      id: uuid,
      slug,
      title,
      date: formattedDate,
      excerpt: excerpt || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      published: true,
      contentFile: `posts/${slug}.json`
    };

    const postContent = {
      id: uuid,
      slug,
      title,
      date: formattedDate,
      author: 'Victor Gutierrez',
      tags: postIndex.tags,
      published: true,
      excerpt: excerpt || '',
      content,
      readingTime: estimateReadingTime(content),
      seo: {
        metaTitle: `${title} - Victor Gutierrez`,
        metaDescription: excerpt || '',
        keywords: postIndex.tags
      }
    };

    // Save post content file
    const contentPath = path.join(POSTS_DIR, `${slug}.json`);
    await fs.writeFile(contentPath, JSON.stringify(postContent, null, 2));

    // Update posts index
    posts.push(postIndex);
    await saveJsonFile('posts.json', posts);

    // Update sitemaps
    try {
      const { updateSitemaps } = require('../utils/cms-utils');
      await updateSitemaps();
    } catch (sitemapError) {
      console.warn('Failed to update sitemaps:', sitemapError.message);
    }

    res.status(201).json(postContent);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/blog/:slug - Update existing post
router.put('/:slug', async (req, res) => {
  try {
    const { title, excerpt, tags, content, date, published } = req.body;
    const { slug: currentSlug } = req.params;

    const posts = await loadJsonFile('posts.json');
    const postIndex = posts.find(p => p.slug === currentSlug);

    if (!postIndex) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Load current post content
    const contentPath = path.join(POSTS_DIR, `${currentSlug}.json`);
    const fullPost = JSON.parse(await fs.readFile(contentPath, 'utf8'));

    // Update fields
    if (title !== undefined) {
      postIndex.title = title;
      fullPost.title = title;

      // Check if slug needs to be updated
      if (title !== fullPost.title) {
        const baseSlug = generateSlug(title);
        const otherPosts = posts.filter(p => p.slug !== currentSlug);
        const newSlug = await ensureUniqueSlug(baseSlug, otherPosts);

        if (newSlug !== currentSlug) {
          // Rename content file
          const newContentPath = path.join(POSTS_DIR, `${newSlug}.json`);
          await fs.rename(contentPath, newContentPath);

          postIndex.slug = newSlug;
          fullPost.slug = newSlug;
          postIndex.contentFile = `posts/${newSlug}.json`;
        }
      }
    }

    if (excerpt !== undefined) {
      postIndex.excerpt = excerpt;
      fullPost.excerpt = excerpt;
    }

    if (tags !== undefined) {
      const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
      postIndex.tags = tagsArray;
      fullPost.tags = tagsArray;
    }

    if (content !== undefined) {
      fullPost.content = content;
      fullPost.readingTime = estimateReadingTime(content);
    }

    if (date !== undefined && isValidDateFormat(date)) {
      const formattedDate = formatDateForStorage(date);
      postIndex.date = formattedDate;
      fullPost.date = formattedDate;
    }

    if (published !== undefined) {
      postIndex.published = !!published;
      fullPost.published = !!published;
    }

    // Update SEO
    fullPost.seo = {
      metaTitle: `${fullPost.title} - Victor Gutierrez`,
      metaDescription: fullPost.excerpt,
      keywords: fullPost.tags
    };

    // Save updated files
    const finalContentPath = path.join(POSTS_DIR, `${fullPost.slug}.json`);
    await fs.writeFile(finalContentPath, JSON.stringify(fullPost, null, 2));
    await saveJsonFile('posts.json', posts);

    // Update sitemaps
    try {
      const { updateSitemaps } = require('../utils/cms-utils');
      await updateSitemaps();
    } catch (sitemapError) {
      console.warn('Failed to update sitemaps:', sitemapError.message);
    }

    res.json(fullPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/blog/:slug - Delete post
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const posts = await loadJsonFile('posts.json');
    const postIndex = posts.findIndex(p => p.slug === slug);

    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[postIndex];

    // Delete content file
    try {
      const contentPath = path.join(POSTS_DIR, `${slug}.json`);
      await fs.unlink(contentPath);
    } catch (unlinkError) {
      console.warn('Content file not found or already deleted:', unlinkError.message);
    }

    // Remove from index
    posts.splice(postIndex, 1);
    await saveJsonFile('posts.json', posts);

    // Update sitemaps
    try {
      const { updateSitemaps } = require('../utils/cms-utils');
      await updateSitemaps();
    } catch (sitemapError) {
      console.warn('Failed to update sitemaps:', sitemapError.message);
    }

    res.json({ message: 'Post deleted successfully', deletedPost: post });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;