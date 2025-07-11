# 🖼️ Image Management Guide

## Overview

This guide explains how to add and manage images for your personal website using GitHub as a CDN.

## 📁 Directory Structure

```
data/images/
├── profile/
│   └── victor-photo.jpg          # Your profile photo
├── projects/
│   ├── project-slug-1.jpg        # Project screenshots/diagrams
│   ├── project-slug-2.jpg
│   └── ...
├── blog/
│   ├── post-slug-hero.jpg        # Blog post hero images
│   ├── post-slug-diagram.jpg     # Blog post content images
│   └── ...
└── registry.json                 # Image metadata (auto-generated)
```

## 🚀 Quick Start

### 1. Manage Images

```bash
npm run images
```

This opens the interactive image management tool.

### 2. Add Your Profile Photo

1. Run `npm run images`
2. Choose option 4 (Update profile image)
3. Add your photo as `data/images/profile/victor-photo.jpg`
4. Commit and push to GitHub

### 3. Add Project Images

1. Run `npm run images`
2. Choose option 5 (Generate project images)
3. Add images for each project with the generated filenames
4. Commit and push to GitHub

## 📐 Image Specifications

### Profile Photo

- **Size**: 400x500px (4:5 ratio)
- **Format**: JPG or PNG
- **File size**: < 500KB
- **Filename**: `victor-photo.jpg`
- **Location**: `data/images/profile/`

### Project Images

- **Size**: 600x400px (3:2 ratio)
- **Format**: JPG or PNG
- **File size**: < 300KB each
- **Filename**: `{project-slug}.jpg`
- **Location**: `data/images/projects/`

### Blog Images

- **Hero images**: 800x400px (2:1 ratio)
- **Content images**: Variable sizes as needed
- **Format**: JPG or PNG
- **File size**: < 400KB each
- **Location**: `data/images/blog/`

## 🔗 URL Structure

When uploaded to GitHub, your images will be available at:

```
https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/{category}/{filename}
```

### Examples

- Profile: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/profile/victor-photo.jpg`
- Project: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/projects/adeo-transformation.jpg`
- Blog: `https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/blog/team-building-hero.jpg`

## 🛠️ Image Optimization

### Before Upload

1. **Resize** images to the specified dimensions
2. **Compress** using tools like:
   - [TinyPNG](https://tinypng.com/) - Online compression
   - [ImageOptim](https://imageoptim.com/) - Mac app
   - [Squoosh](https://squoosh.app/) - Web-based tool

### Recommended Tools

- **Photoshop**: Professional editing
- **GIMP**: Free alternative
- **Canva**: Easy templates and editing
- **Figma**: Design and export

## 📝 Adding Images to Content

### Profile (Automatic)

Your profile image is automatically loaded when you run:

```bash
npm run images → option 4
```

### Projects (Automatic)

Project images are automatically referenced when you run:

```bash
npm run images → option 5
```

### Blog Posts (Manual)

Add images to blog posts by including them in the HTML content:

```html
<!-- Hero image -->
<img
  src="https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/blog/post-title-hero.jpg"
  alt="Hero image description"
  style="width: 100%; border-radius: 8px; margin-bottom: 2rem;"
/>

<!-- Content image -->
<img
  src="https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/blog/post-title-diagram.jpg"
  alt="Architecture diagram"
  style="width: 100%; max-width: 600px; margin: 2rem auto; display: block;"
/>
```

## 🔄 Workflow

### Adding New Images

1. **Prepare image** (resize, optimize)
2. **Add to appropriate folder** in `data/images/`
3. **Run image manager**: `npm run images`
4. **Update references** if needed
5. **Commit and push** to GitHub
6. **Test URLs**: `npm run test-urls`

### Updating Existing Images

1. **Replace file** with same filename
2. **Commit and push** to GitHub
3. **Clear browser cache** to see changes

## 🚨 Troubleshooting

### Image Not Loading

1. **Check filename** matches exactly (case-sensitive)
2. **Verify file is pushed** to GitHub
3. **Wait 1-2 minutes** for GitHub CDN
4. **Test URL directly** in browser
5. **Check file size** (< 25MB GitHub limit)

### Image Shows Broken

1. **Verify image format** (JPG, PNG, GIF, WebP)
2. **Check file corruption** (re-upload if needed)
3. **Validate URL structure**
4. **Test with different browser**

### Slow Loading

1. **Optimize file size** (aim for < 300KB)
2. **Use progressive JPEG**
3. **Consider WebP format** for modern browsers
4. **Add loading="lazy"** for content images

## 🌟 Advanced Options

### Alternative CDN Services

#### Cloudinary (Recommended for production)

- **Pros**: Automatic optimization, transformations, generous free tier
- **Cons**: Requires account setup
- **Setup**: Upload to Cloudinary, use their URLs

#### ImgBB

- **Pros**: Simple, no account needed
- **Cons**: No guarantees for permanence
- **Setup**: Upload via web interface

#### AWS S3 + CloudFront

- **Pros**: Professional, scalable, fast
- **Cons**: More complex, costs money
- **Setup**: Requires AWS account

### Image Transformations

```html
<!-- Cloudinary example -->
<img
  src="https://res.cloudinary.com/your-account/image/upload/w_400,h_500,c_fill/profile/victor-photo.jpg"
/>

<!-- GitHub (no transformations) -->
<img
  src="https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/profile/victor-photo.jpg"
/>
```

## 📊 Best Practices

### SEO Optimization

- **Use descriptive filenames**: `team-leadership-workshop.jpg` vs `img001.jpg`
- **Add alt text**: Always include meaningful alt attributes
- **Optimize for speed**: Compress images appropriately
- **Use structured data**: Consider schema.org markup

### Accessibility

- **Alt text**: Describe the image content and context
- **Color contrast**: Ensure text over images is readable
- **Loading states**: Show placeholders while images load
- **Fallbacks**: Handle broken images gracefully

### Performance

- **Lazy loading**: Use `loading="lazy"` for content images
- **Responsive images**: Consider different sizes for different devices
- **Modern formats**: Use WebP where supported
- **CDN**: Use GitHub or dedicated image CDN

## 📞 Support

For image-related issues:

1. **Check this guide** first
2. **Run**: `npm run images` for interactive help
3. **Test URLs**: `npm run test-urls`
4. **Create GitHub issue** if problems persist

---

**Last Updated**: January 2025  
**Image Manager Version**: 1.0.0

