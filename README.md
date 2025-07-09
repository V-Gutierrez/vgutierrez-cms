# Victor Gutierrez CMS

Content Management System for Victor Gutierrez personal website and blog.

## 📁 Structure

```
vgutierrez-cms/
├── data/
│   ├── posts.json          # Blog posts index
│   ├── projects.json       # Portfolio projects
│   ├── profile.json        # Personal information and settings
│   └── posts/
│       ├── post-1.json     # Individual blog posts
│       ├── post-2.json
│       └── post-3.json
├── scripts/
│   ├── blog-manager.js     # Blog post management
│   ├── project-manager.js  # Portfolio management
│   ├── profile-manager.js  # Profile settings management
│   └── build-tools.js      # Build and deployment tools
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14.0.0 or higher

### Installation
```bash
cd /Users/emptyhardware/Projetos/Codebases/Personal/vgutierrez-cms
npm install
```

## 📝 Content Management

### Blog Management
```bash
npm run blog
```
Interactive CLI for:
- Creating new blog posts
- Editing existing posts
- Listing all posts
- Deleting posts

### Project Management
```bash
npm run projects
```
Interactive CLI for:
- Adding new portfolio projects
- Editing project details
- Managing project status and metrics
- Deleting projects

### Image Management
```bash
npm run images
```
Interactive CLI for:
- Managing profile photos
- Adding project images
- Generating image URLs
- Following best practices

### Profile Management
```bash
npm run profile
```
Interactive CLI for:
- Editing personal information
- Managing skills and technical stack
- Updating site settings
- Viewing current profile

## 🔧 Build Tools

### Validate All Data
```bash
npm run validate
```
Checks data integrity and structure.

### Generate GitHub URLs
```bash
npm run urls
```
Generates the GitHub raw URLs for your website integration.

### Generate Sitemap
```bash
npm run sitemap
```
Creates sitemap data for SEO optimization.

### Prepare for Deployment
```bash
npm run deploy
```
Exports all data to a deploy-ready folder.

### Run All Build Tasks
```bash
npm run build
```
Runs validation, sitemap generation, deployment prep, and URL generation.

## 🌐 GitHub Integration

### Setup Steps:

1. **Your GitHub Repository is Already Configured**
   ```bash
   # Your repository: https://github.com/V-Gutierrez/vgutierrez-cms
   git init
   git add .
   git commit -m "Initial CMS setup"
   git remote add origin https://github.com/V-Gutierrez/vgutierrez-cms.git
   git push -u origin main
   ```

2. **Repository Configuration is Complete**
   ✅ Already configured in `scripts/build-tools.js`:
   ```javascript
   const GITHUB_REPO = 'V-Gutierrez/vgutierrez-cms'; // ✅ Ready to use
   ```

3. **Deploy Data**
   ```bash
   npm run deploy
   # Upload the contents of the 'deploy' folder to your GitHub repository
   ```

4. **Get URLs for Website**
   ```bash
   npm run urls
   # Copy the generated URLs to your website code
   ```

### Sample GitHub URLs:
- Posts Index: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/posts.json`
- Projects: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/projects.json`
- Profile: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/profile.json`
- Post Content: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/posts/post-{id}.json`

## 📊 Data Structure

### Blog Post Structure
```json
{
  "id": 1,
  "title": "Post Title",
  "slug": "post-title",
  "date": "2025-01-15",
  "author": "Victor Gutierrez",
  "tags": ["tag1", "tag2"],
  "published": true,
  "excerpt": "Short description...",
  "content": "Full HTML content...",
  "readingTime": 3,
  "seo": {
    "metaTitle": "SEO title",
    "metaDescription": "SEO description",
    "keywords": ["keyword1", "keyword2"]
  }
}
```

### Project Structure
```json
{
  "id": 1,
  "title": "Project Title",
  "slug": "project-title",
  "description": "Project description...",
  "category": "Category",
  "technologies": ["tech1", "tech2"],
  "status": "completed",
  "startDate": "2023-01-01",
  "endDate": "2023-06-01",
  "metrics": {},
  "highlights": [],
  "featured": true
}
```

## 🔄 Workflow

### Adding New Content:
1. Use the appropriate manager script (`npm run blog`, `npm run projects`)
2. Create/edit content through the interactive CLI
3. Validate data: `npm run validate`
4. Deploy: `npm run deploy`
5. Upload to GitHub
6. Your website will automatically fetch the new content

### Updating Profile:
1. Run: `npm run profile`
2. Update information through the CLI
3. Deploy changes: `npm run deploy`
4. Upload to GitHub

## 🛠️ Customization

### Adding New Data Types:
1. Create new JSON structure in `/data/`
2. Build corresponding manager script in `/scripts/`
3. Add npm script to `package.json`
4. Update build tools to include validation

### Extending Build Tools:
Modify `scripts/build-tools.js` to add new validation rules or export formats.

### Custom Fields:
Extend existing JSON structures by adding new fields. The website should handle graceful fallbacks for missing data.

## 🔍 Content Guidelines

### Blog Posts:
- **Title**: Clear, descriptive, SEO-friendly
- **Excerpt**: 1-2 sentences summarizing the post
- **Tags**: 3-5 relevant tags for categorization
- **Content**: Use HTML formatting with proper headings (h2, h3)
- **Reading Time**: Automatically calculated based on word count

### Projects:
- **Description**: Focus on impact and results
- **Metrics**: Include quantifiable achievements
- **Technologies**: List relevant technologies and skills
- **Status**: Keep status current (completed/in-progress/planned)
- **Featured**: Mark your best projects as featured

### Profile:
- **Skills**: Organize by category for better presentation
- **Technical Stack**: Keep technologies current and relevant
- **Description**: Professional summary highlighting key strengths

## 📈 SEO Optimization

### Built-in SEO Features:
- Automatic meta title and description generation
- Sitemap generation for search engines
- Structured data for blog posts and projects
- Semantic HTML structure
- Reading time estimation

### Best Practices:
- Use descriptive titles and slugs
- Write compelling meta descriptions
- Include relevant keywords naturally
- Update content regularly
- Monitor performance with analytics

## 🚨 Troubleshooting

### Common Issues:

**"Post not found" error:**
- Check that post ID exists in posts.json
- Verify post content file exists in `/data/posts/`
- Run `npm run validate` to check data integrity

**GitHub URLs not working:**
- Ensure repository is public
- Check repository name in build-tools.js
- Verify file paths are correct
- Allow time for GitHub CDN to update

**JSON validation errors:**
- Use online JSON validators to check syntax
- Ensure all quotes are properly escaped
- Check for trailing commas

### Debug Mode:
```bash
# Check all data files
npm run validate

# Verify GitHub integration
npm run urls

# Test deployment package
npm run deploy
```

## 🔧 Advanced Configuration

### Environment Variables:
Create `.env` file for sensitive configuration:
```bash
GITHUB_TOKEN=your_token_here
GITHUB_REPO=your-username/vgutierrez-data
```

### Automated Deployment:
Set up GitHub Actions for automatic deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy CMS Data
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - run: npm install
    - run: npm run build
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./deploy
```

### Backup Strategy:
```bash
# Create timestamped backup
cp -r data/ "backups/backup-$(date +%Y%m%d-%H%M%S)"

# Automated daily backup (add to crontab)
0 2 * * * /path/to/backup-script.sh
```

## 📚 API Reference

### Data Endpoints:
When deployed to GitHub, your data will be available at:

- `GET /posts.json` - Blog posts index
- `GET /projects.json` - Portfolio projects
- `GET /profile.json` - Personal profile
- `GET /posts/post-{id}.json` - Individual post content
- `GET /sitemap.json` - Site structure

### Response Formats:
All endpoints return JSON with consistent structure and error handling.

## 🤝 Contributing

### Adding Features:
1. Fork the repository
2. Create feature branch
3. Add tests if applicable
4. Submit pull request

### Reporting Issues:
- Use GitHub Issues
- Include error messages
- Provide reproduction steps
- Specify Node.js version

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Support

For questions or support:
- Email: victorgutierrezgomes@gmail.com
- LinkedIn: https://www.linkedin.com/in/victtorgutierrez/
- GitHub: Create an issue in the repository

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintainer**: Victor Gutierrez