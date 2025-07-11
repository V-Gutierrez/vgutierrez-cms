# Victor Gutierrez CMS

Comprehensive Content Management System with integrated static website for Victor Gutierrez's personal portfolio, blog, and professional showcase.

## 🌟 Features

- **📝 Content Management**: CLI tools for managing blog posts, projects, and profile
- **🎨 Static Website**: Modern, responsive HTML site with smooth animations
- **🌍 Multilingual Support**: Multi-language profile with flag indicators
- **💼 Portfolio Showcase**: Professional project cards with metrics and status tracking
- **📱 Responsive Design**: Mobile-first design with tablet and desktop optimization
- **⚡ Performance**: Static site with GitHub Pages integration for fast loading
- **🔍 SEO Optimized**: Meta tags, structured data, and search engine friendly URLs

## 📁 Project Structure

```
vgutierrez-cms/
├── index.html              # Main website file with integrated design
├── data/
│   ├── posts.json          # Blog posts index
│   ├── projects.json       # Portfolio projects with metrics
│   ├── profile.json        # Complete profile with languages & tech stack
│   ├── images/
│   │   ├── profile/        # Profile photos
│   │   ├── projects/       # Project images
│   │   └── registry.json   # Image metadata
│   └── posts/
│       └── *.json          # Individual blog post content
├── scripts/
│   ├── blog-manager.js     # Blog post management CLI
│   ├── project-manager.js  # Portfolio management CLI
│   ├── profile-manager.js  # Profile & settings management CLI
│   ├── image-manager.js    # Image upload & management CLI
│   ├── build-tools.js      # Build, validation & deployment tools
│   └── structure.js        # Project initialization
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14.0.0 or higher
- Git (for GitHub Pages deployment)

### Installation
```bash
git clone https://github.com/V-Gutierrez/vgutierrez-cms.git
cd vgutierrez-cms
npm install
```

### Initialize Project Structure
```bash
npm start
# or
npm run structure
```

## 🎨 Website Features

### 🌐 Static Website (index.html)
- **Modern Design**: Dark theme with gold accents
- **Smooth Animations**: CSS transitions between tabs and hover effects
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Tab Navigation**: Home, Portfolio, and Blog sections with smooth transitions

### 🌍 Multilingual Section
- **Language Display**: Shows proficiency levels with country flags
- **Visual Indicators**: 🇧🇷 🇪🇸 🇺🇸 🇮🇹 🇫🇷 flag representations
- **Responsive Grid**: Adapts to different screen sizes

### 💻 Technical Stack Display
- **Categorized Technologies**: Backend, Databases, DevOps, Cloud
- **Interactive Tags**: Hover effects and organized presentation
- **Dynamic Loading**: Automatically populates from profile.json

### 📱 Social Integration
- **GitHub & LinkedIn Links**: Direct links with icons
- **Responsive Positioning**: Centered on mobile, left-aligned on desktop
- **Professional Styling**: Consistent with overall design theme

## 📝 Content Management

### Blog Management
```bash
npm run blog
```
Interactive CLI for:
- ✅ Creating new blog posts with full content editor
- ✅ Editing existing posts with rich formatting
- ✅ Managing tags, categories, and SEO settings
- ✅ Publishing/unpublishing posts
- ✅ Auto-generating reading time estimates

### Project Management
```bash
npm run projects
```
Interactive CLI for:
- ✅ Adding portfolio projects with detailed metrics
- ✅ Managing project status (completed/in-progress/planned)
- ✅ Setting featured projects for homepage display
- ✅ Tracking technologies and achievements
- ✅ Adding project highlights and impact metrics

### Profile Management
```bash
npm run profile
```
Interactive CLI for:
- ✅ Updating personal information and bio
- ✅ Managing skills across multiple categories
- ✅ Updating technical stack (Backend, DevOps, Cloud, Databases)
- ✅ Managing languages with proficiency levels
- ✅ Configuring site settings and themes

### Image Management
```bash
npm run images
```
Interactive CLI for:
- ✅ Uploading profile photos
- ✅ Managing project images with metadata
- ✅ Generating optimized GitHub URLs
- ✅ Image registry with organized storage

## 🔧 Build & Deployment Tools

### Validate All Data
```bash
npm run validate
```
Comprehensive validation including:
- JSON structure verification
- Required field validation
- Data type checking
- Cross-reference integrity

### Generate GitHub URLs
```bash
npm run urls
```
Generates deployment-ready URLs for:
- Profile data endpoint
- Projects API endpoint
- Blog posts API endpoint
- Individual post content URLs

### Prepare for Deployment
```bash
npm run deploy
```
Creates deployment package with:
- Optimized data files
- Generated sitemap
- SEO metadata
- Image registry

### Run All Build Tasks
```bash
npm run build
```
Complete build process including validation, deployment prep, and URL generation.

## 🌐 GitHub Pages Integration

### Quick Deploy to GitHub Pages

1. **Repository Setup** (Already configured):
   ```bash
   # Repository: https://github.com/V-Gutierrez/vgutierrez-cms
   git add .
   git commit -m "Update website content"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)

3. **Access Your Website**:
   ```
   https://v-gutierrez.github.io/vgutierrez-cms/
   ```

### Live Data Endpoints
When deployed, your data is available at:
- **Profile**: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/profile.json`
- **Projects**: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/projects.json`
- **Blog Posts**: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/posts.json`
- **Post Content**: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/posts/post-{id}.json`

## 📊 Data Structure

### Enhanced Profile Structure
```json
{
  "personalInfo": {
    "name": "Victor Gutierrez",
    "title": "Senior Technical Leader",
    "description": "Technical Leader & Solutions Architect...",
    "linkedin": "https://www.linkedin.com/in/victtorgutierrez/",
    "github": "https://github.com/V-Gutierrez",
    "profileImage": "https://raw.githubusercontent.com/..."
  },
  "languages": [
    {
      "language": "Portuguese",
      "level": "Native Language"
    }
  ],
  "technicalStack": {
    "backend": ["TypeScript", "Python", "Java", "Rust"],
    "databases": ["PostgreSQL", "MongoDB", "Redis"],
    "devops": ["Docker", "Kubernetes", "Terraform"],
    "cloud": ["AWS", "GCP", "Serverless Architectures"]
  },
  "skills": {
    "leadershipAndStrategy": [...],
    "architectureAndSystems": [...],
    "engineeringExcellence": [...]
  }
}
```

### Project Structure with Enhanced Metrics
```json
{
  "id": 1,
  "title": "Digital Transformation",
  "description": "Led strategic technical initiatives...",
  "category": "Enterprise Architecture",
  "technologies": ["Enterprise Architecture", "Team Leadership"],
  "status": "in-progress",
  "startDate": "2025-06-01",
  "endDate": "ongoing",
  "metrics": {
    "usersImpacted": "3+ million",
    "scope": "Country-wide retail operations",
    "teamSize": "5+ developers"
  },
  "highlights": [
    "Coordinate international stakeholder alignment",
    "Define technical roadmaps through ADR processes"
  ],
  "featured": true
}
```

## 🎨 Design System

### Color Palette
- **Primary**: `#ffd700` (Gold)
- **Background**: `#0a0a0a` (Dark)
- **Cards**: `#1a1a1a` (Dark Gray)
- **Text**: `#ffffff` (White)
- **Borders**: `#333` (Gray)

### Typography
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- **Headings**: Bold weights with gold accent color
- **Body**: Regular weight with high contrast

### Animation System
- **Tab Transitions**: Directional slides with fade effects
- **Hover Effects**: Smooth transforms and color transitions
- **Loading States**: Fade-in animations for content

## 🔄 Content Workflow

### Adding New Content
1. **Create Content**: Use CLI tools (`npm run blog`, `npm run projects`)
2. **Validate**: Run `npm run validate` to check data integrity
3. **Deploy**: Commit and push to GitHub
4. **Live Updates**: Website automatically fetches new content from GitHub

### Updating Profile
1. **Update Profile**: `npm run profile`
2. **Manage Languages**: Add/edit language proficiencies
3. **Update Tech Stack**: Keep technologies current
4. **Deploy Changes**: Push to GitHub for live updates

### Managing Images
1. **Upload Images**: `npm run images`
2. **Generate URLs**: Automatic GitHub URL generation
3. **Update Registry**: Metadata tracking for all images
4. **Optimize**: Built-in best practices for web performance

## 🔍 SEO & Performance

### Built-in SEO Features
- **Meta Tags**: Automatic generation from content
- **Structured Data**: Rich snippets for search engines
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Sitemap**: Auto-generated for search engine discovery
- **Performance**: Static site with minimal JavaScript

### Performance Optimizations
- **Static Generation**: No server-side processing required
- **CDN Delivery**: GitHub Pages global CDN
- **Optimized Images**: Automatic URL generation and best practices
- **Minimal Dependencies**: Pure HTML/CSS/JS with no frameworks

## 🛠️ Customization

### Extending the Website
- **New Sections**: Add new tab content in index.html
- **Custom Styling**: Modify CSS variables for theming
- **Animation Tweaks**: Adjust transition timings and effects

### Adding Data Types
1. Create new JSON structure in `/data/`
2. Build corresponding manager script in `/scripts/`
3. Add npm script to `package.json`
4. Update website to consume new data

### Custom Themes
Modify CSS variables in index.html:
```css
:root {
  --primary-color: #ffd700;
  --background-color: #0a0a0a;
  --card-background: #1a1a1a;
}
```

## 🚨 Troubleshooting

### Common Issues

**Website not loading data:**
- Ensure repository is public
- Check GitHub Pages is enabled
- Verify file paths in GitHub raw URLs
- Allow time for GitHub CDN updates (1-2 minutes)

**Animations not working:**
- Check CSS support for transforms and transitions
- Verify JavaScript is enabled
- Clear browser cache

**Content not updating:**
- Run `npm run validate` to check data integrity
- Verify JSON syntax with online validators
- Check GitHub commit status

### Debug Tools
```bash
# Validate all data
npm run validate

# Check URLs
npm run urls

# Test deployment package
npm run deploy
```

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: CSS Grid, Flexbox, CSS Transforms, ES6 JavaScript

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test locally
4. Submit pull request with detailed description

### Code Standards
- **HTML**: Semantic markup with accessibility considerations
- **CSS**: Mobile-first responsive design
- **JavaScript**: Modern ES6+ with backward compatibility
- **JSON**: Validated structure with consistent formatting

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Support

For questions, issues, or contributions:
- **Email**: victorgutierrezgomes@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/victtorgutierrez/
- **GitHub Issues**: Create an issue in this repository

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Maintainer**: Victor Gutierrez  
**Live Site**: https://v-gutierrez.github.io/vgutierrez-cms/