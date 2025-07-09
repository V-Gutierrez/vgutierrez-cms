#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function displayStructure() {
  console.log('🗂️  Victor Gutierrez CMS - Project Structure');
  console.log('==========================================');
  console.log('');
  
  const structure = `
📁 vgutierrez-cms/
├── 📄 README.md                 # Complete documentation
├── 📄 package.json              # Node.js project configuration
├── 📄 .gitignore               # Git ignore rules
├── 🚀 setup.sh                 # Quick setup script
│
├── 📁 data/                    # All content data
│   ├── 📄 posts.json           # Blog posts index
│   ├── 📄 projects.json        # Portfolio projects
│   ├── 📄 profile.json         # Personal information
│   └── 📁 posts/               # Individual blog posts
│       ├── 📄 post-1.json      # Blog post content
│       ├── 📄 post-2.json
│       └── 📄 post-3.json
│
├── 📁 scripts/                 # Management tools
│   ├── 🛠️  blog-manager.js     # Blog management CLI
│   ├── 🛠️  project-manager.js  # Portfolio management CLI
│   ├── 🛠️  profile-manager.js  # Profile management CLI
│   └── 🛠️  build-tools.js      # Build and deployment tools
│
└── 📁 examples/                # Integration examples
    ├── 📄 website-integration.js # How to integrate with your site
    └── 📄 github-workflow.yml   # GitHub Actions example
`;
  
  console.log(structure);
  
  // Display file counts and sizes
  try {
    const stats = {
      posts: 0,
      projects: 0,
      totalSize: 0
    };
    
    // Count posts
    const postsData = await fs.readFile(path.join(__dirname, '..', 'data', 'posts.json'), 'utf8');
    stats.posts = JSON.parse(postsData).length;
    
    // Count projects
    const projectsData = await fs.readFile(path.join(__dirname, '..', 'data', 'projects.json'), 'utf8');
    stats.projects = JSON.parse(projectsData).length;
    
    console.log('📊 Content Summary:');
    console.log('=================');
    console.log(`📝 Blog Posts: ${stats.posts}`);
    console.log(`💼 Projects: ${stats.projects}`);
    console.log('');
    
    console.log('🚀 Available Commands:');
    console.log('====================');
    console.log('npm run blog      - Manage blog posts (create, edit, delete)');
    console.log('npm run projects  - Manage portfolio projects');
    console.log('npm run profile   - Edit personal information and settings');
    console.log('npm run validate  - Check data integrity');
    console.log('npm run build     - Build everything for deployment');
    console.log('npm run deploy    - Prepare deployment package');
    console.log('npm run urls      - Generate GitHub integration URLs');
    console.log('');
    
    console.log('📝 Quick Start:');
    console.log('==============');
    console.log('1. Run "npm run blog" to create your first post');
    console.log('2. Run "npm run projects" to add portfolio items');
    console.log('3. Run "npm run build" to prepare for deployment');
    console.log('4. Create GitHub repo and upload deploy folder');
    console.log('5. Update your website with GitHub URLs');
    console.log('');
    
  } catch (error) {
    console.log('📊 Content Summary: Unable to read data files');
    console.log('Run "npm run validate" to check for issues');
  }
}

displayStructure().catch(console.error);