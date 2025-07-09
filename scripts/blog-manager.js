#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '..', 'data');
const POSTS_DIR = path.join(DATA_DIR, 'posts');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function estimateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

async function loadPosts() {
  try {
    const postsIndex = await fs.readFile(path.join(DATA_DIR, 'posts.json'), 'utf8');
    return JSON.parse(postsIndex);
  } catch (error) {
    return [];
  }
}

async function savePosts(posts) {
  await fs.writeFile(
    path.join(DATA_DIR, 'posts.json'),
    JSON.stringify(posts, null, 2)
  );
}

async function createPost() {
  console.log('\n=== Creating New Blog Post ===\n');
  
  const title = await question('Post title: ');
  const excerpt = await question('Post excerpt: ');
  const tags = await question('Tags (comma-separated): ');
  const content = await question('Post content (HTML): ');
  
  const posts = await loadPosts();
  const newId = Math.max(0, ...posts.map(p => p.id)) + 1;
  const slug = generateSlug(title);
  const date = new Date().toISOString().split('T')[0];
  
  // Create post index entry
  const postIndex = {
    id: newId,
    title,
    slug,
    date,
    excerpt,
    tags: tags.split(',').map(tag => tag.trim()),
    published: true,
    contentFile: `posts/post-${newId}.json`
  };
  
  // Create full post content
  const postContent = {
    id: newId,
    title,
    slug,
    date,
    author: 'Victor Gutierrez',
    tags: tags.split(',').map(tag => tag.trim()),
    published: true,
    excerpt,
    content,
    readingTime: estimateReadingTime(content),
    seo: {
      metaTitle: `${title} - Victor Gutierrez`,
      metaDescription: excerpt,
      keywords: tags.split(',').map(tag => tag.trim())
    }
  };
  
  // Save post content file
  await fs.writeFile(
    path.join(POSTS_DIR, `post-${newId}.json`),
    JSON.stringify(postContent, null, 2)
  );
  
  // Update posts index
  posts.push(postIndex);
  await savePosts(posts);
  
  console.log(`\n✅ Post created successfully with ID: ${newId}`);
  console.log(`📄 Content saved to: posts/post-${newId}.json`);
}

async function listPosts() {
  const posts = await loadPosts();
  
  console.log('\n=== All Blog Posts ===\n');
  
  if (posts.length === 0) {
    console.log('No posts found.');
    return;
  }
  
  posts.forEach(post => {
    const status = post.published ? '✅ Published' : '❌ Draft';
    console.log(`${post.id}. ${post.title}`);
    console.log(`   Date: ${post.date} | Status: ${status}`);
    console.log(`   Tags: ${post.tags.join(', ')}`);
    console.log(`   Excerpt: ${post.excerpt.substring(0, 100)}...`);
    console.log('');
  });
}

async function editPost() {
  const posts = await loadPosts();
  
  if (posts.length === 0) {
    console.log('No posts found to edit.');
    return;
  }
  
  await listPosts();
  
  const postId = parseInt(await question('Enter post ID to edit: '));
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    console.log('Post not found.');
    return;
  }
  
  // Load full post content
  const contentPath = path.join(DATA_DIR, post.contentFile);
  const fullPost = JSON.parse(await fs.readFile(contentPath, 'utf8'));
  
  console.log(`\n=== Editing Post: ${post.title} ===\n`);
  
  const newTitle = await question(`Title (${post.title}): `) || post.title;
  const newExcerpt = await question(`Excerpt (${post.excerpt}): `) || post.excerpt;
  const newTags = await question(`Tags (${post.tags.join(', ')}): `) || post.tags.join(', ');
  const newContent = await question(`Content (current length: ${fullPost.content.length} chars): `) || fullPost.content;
  const published = await question(`Published (${post.published}): `) || post.published.toString();
  
  // Update post
  post.title = newTitle;
  post.excerpt = newExcerpt;
  post.tags = newTags.split(',').map(tag => tag.trim());
  post.published = published.toLowerCase() === 'true';
  post.slug = generateSlug(newTitle);
  
  fullPost.title = newTitle;
  fullPost.excerpt = newExcerpt;
  fullPost.tags = newTags.split(',').map(tag => tag.trim());
  fullPost.published = published.toLowerCase() === 'true';
  fullPost.slug = generateSlug(newTitle);
  fullPost.content = newContent;
  fullPost.readingTime = estimateReadingTime(newContent);
  fullPost.seo.metaTitle = `${newTitle} - Victor Gutierrez`;
  fullPost.seo.metaDescription = newExcerpt;
  fullPost.seo.keywords = newTags.split(',').map(tag => tag.trim());
  
  // Save changes
  await fs.writeFile(contentPath, JSON.stringify(fullPost, null, 2));
  await savePosts(posts);
  
  console.log('\n✅ Post updated successfully!');
}

async function deletePost() {
  const posts = await loadPosts();
  
  if (posts.length === 0) {
    console.log('No posts found to delete.');
    return;
  }
  
  await listPosts();
  
  const postId = parseInt(await question('Enter post ID to delete: '));
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) {
    console.log('Post not found.');
    return;
  }
  
  const post = posts[postIndex];
  const confirm = await question(`Are you sure you want to delete "${post.title}"? (yes/no): `);
  
  if (confirm.toLowerCase() === 'yes') {
    // Delete post file
    const contentPath = path.join(DATA_DIR, post.contentFile);
    try {
      await fs.unlink(contentPath);
    } catch (error) {
      console.log('Warning: Could not delete post file');
    }
    
    // Remove from index
    posts.splice(postIndex, 1);
    await savePosts(posts);
    
    console.log('\n✅ Post deleted successfully!');
  } else {
    console.log('Delete cancelled.');
  }
}

async function main() {
  console.log('🚀 Victor Gutierrez CMS - Blog Management');
  console.log('========================================');
  
  while (true) {
    console.log('\nOptions:');
    console.log('1. Create new post');
    console.log('2. List all posts');
    console.log('3. Edit post');
    console.log('4. Delete post');
    console.log('5. Exit');
    
    const choice = await question('\nChoose an option (1-5): ');
    
    switch (choice) {
      case '1':
        await createPost();
        break;
      case '2':
        await listPosts();
        break;
      case '3':
        await editPost();
        break;
      case '4':
        await deletePost();
        break;
      case '5':
        console.log('👋 Goodbye!');
        rl.close();
        return;
      default:
        console.log('Invalid option. Please choose 1-5.');
    }
  }
}

main().catch(console.error);