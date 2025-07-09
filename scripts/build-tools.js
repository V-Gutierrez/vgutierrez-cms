#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GITHUB_REPO = 'V-Gutierrez/vgutierrez-cms'; // Updated to your GitHub
const GITHUB_BRANCH = 'main';

async function generateUrls() {
  const baseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data`;
  
  const urls = {
    posts: `${baseUrl}/posts.json`,
    projects: `${baseUrl}/projects.json`,
    profile: `${baseUrl}/profile.json`,
    postContent: (postId) => `${baseUrl}/posts/post-${postId}.json`
  };
  
  console.log('📡 GitHub Raw URLs for your website:\n');
  console.log('Posts Index:', urls.posts);
  console.log('Projects:', urls.projects);
  console.log('Profile:', urls.profile);
  console.log('Post Content Template:', urls.postContent('X'));
  
  return urls;
}

async function validateData() {
  console.log('🔍 Validating data structure...\n');
  
  try {
    // Validate posts
    const postsData = await fs.readFile(path.join(DATA_DIR, 'posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    console.log(`✅ Posts: ${posts.length} posts found`);
    
    // Validate post files
    for (const post of posts) {
      const postFile = path.join(DATA_DIR, post.contentFile);
      try {
        await fs.access(postFile);
        console.log(`   ✅ Post ${post.id}: ${post.title}`);
      } catch (error) {
        console.log(`   ❌ Post ${post.id}: Missing content file`);
      }
    }
    
    // Validate projects
    const projectsData = await fs.readFile(path.join(DATA_DIR, 'projects.json'), 'utf8');
    const projects = JSON.parse(projectsData);
    console.log(`✅ Projects: ${projects.length} projects found`);
    
    // Validate profile
    const profileData = await fs.readFile(path.join(DATA_DIR, 'profile.json'), 'utf8');
    const profile = JSON.parse(profileData);
    console.log(`✅ Profile: ${profile.personalInfo.name}`);
    
    console.log('\n🎉 All data is valid!');
    
  } catch (error) {
    console.error('❌ Validation error:', error.message);
  }
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap data...\n');
  
  try {
    const postsData = await fs.readFile(path.join(DATA_DIR, 'posts.json'), 'utf8');
    const posts = JSON.parse(postsData);
    
    const projectsData = await fs.readFile(path.join(DATA_DIR, 'projects.json'), 'utf8');
    const projects = JSON.parse(projectsData);
    
    const sitemap = {
      pages: [
        { url: '/', title: 'Home', lastModified: new Date().toISOString() },
        { url: '/portfolio', title: 'Portfolio', lastModified: new Date().toISOString() },
        { url: '/blog', title: 'Blog', lastModified: new Date().toISOString() }
      ],
      posts: posts.filter(p => p.published).map(post => ({
        url: `/blog/${post.slug}`,
        title: post.title,
        lastModified: post.date
      })),
      projects: projects.map(project => ({
        url: `/portfolio/${project.slug}`,
        title: project.title,
        lastModified: project.endDate === 'ongoing' ? new Date().toISOString() : project.endDate
      }))
    };
    
    await fs.writeFile(
      path.join(DATA_DIR, 'sitemap.json'),
      JSON.stringify(sitemap, null, 2)
    );
    
    console.log('✅ Sitemap generated successfully!');
    console.log(`   - ${sitemap.pages.length} main pages`);
    console.log(`   - ${sitemap.posts.length} blog posts`);
    console.log(`   - ${sitemap.projects.length} projects`);
    
  } catch (error) {
    console.error('❌ Sitemap generation error:', error.message);
  }
}

async function exportForDeploy() {
  console.log('📦 Preparing data for deployment...\n');
  
  try {
    const deployDir = path.join(__dirname, '..', 'deploy');
    
    // Create deploy directory
    try {
      await fs.mkdir(deployDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    // Copy all data files
    const files = ['posts.json', 'projects.json', 'profile.json'];
    
    for (const file of files) {
      const source = path.join(DATA_DIR, file);
      const dest = path.join(deployDir, file);
      await fs.copyFile(source, dest);
      console.log(`✅ Copied ${file}`);
    }
    
    // Copy posts directory
    const postsDir = path.join(DATA_DIR, 'posts');
    const deployPostsDir = path.join(deployDir, 'posts');
    
    try {
      await fs.mkdir(deployPostsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    const postFiles = await fs.readdir(postsDir);
    for (const file of postFiles) {
      const source = path.join(postsDir, file);
      const dest = path.join(deployPostsDir, file);
      await fs.copyFile(source, dest);
      console.log(`✅ Copied posts/${file}`);
    }
    
    console.log(`\n🎉 Deploy package ready in: ${deployDir}`);
    console.log('You can now upload this folder to your GitHub repository.');
    
  } catch (error) {
    console.error('❌ Export error:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🚀 Victor Gutierrez CMS - Build Tools');
  console.log('===================================\n');
  
  switch (command) {
    case 'validate':
      await validateData();
      break;
    case 'urls':
      await generateUrls();
      break;
    case 'sitemap':
      await generateSitemap();
      break;
    case 'deploy':
      await exportForDeploy();
      break;
    case 'all':
      await validateData();
      console.log('\n' + '='.repeat(50) + '\n');
      await generateSitemap();
      console.log('\n' + '='.repeat(50) + '\n');
      await exportForDeploy();
      console.log('\n' + '='.repeat(50) + '\n');
      await generateUrls();
      break;
    default:
      console.log('Usage: node build-tools.js <command>');
      console.log('\nCommands:');
      console.log('  validate  - Validate all data files');
      console.log('  urls      - Generate GitHub raw URLs');
      console.log('  sitemap   - Generate sitemap data');
      console.log('  deploy    - Export data for deployment');
      console.log('  all       - Run all commands');
  }
}

main().catch(console.error);