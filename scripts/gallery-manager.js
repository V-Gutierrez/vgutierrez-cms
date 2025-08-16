#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const IMAGES_DIR = path.join(DATA_DIR, 'images', 'gallery');

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

async function loadGallery() {
  try {
    const galleryData = await fs.readFile(GALLERY_FILE, 'utf8');
    return JSON.parse(galleryData);
  } catch (error) {
    return [];
  }
}

async function saveGallery(gallery) {
  await fs.writeFile(
    GALLERY_FILE,
    JSON.stringify(gallery, null, 2)
  );
}

async function createGalleryItem() {
  console.log('\n=== Creating New Gallery Item ===\n');
  
  const title = await question('Title: ');
  const description = await question('Description: ');
  const category = await question('Category (photography/digital-art/drawings/mixed-media): ');
  const technique = await question('Technique (e.g., Digital Photography, Pencil on Paper): ');
  const year = parseInt(await question('Year: ')) || new Date().getFullYear();
  const tags = await question('Tags (comma-separated): ');
  const dimensions = await question('Dimensions (e.g., 1920x1080, 297x420): ');
  const imageFilename = await question('Image filename (without extension): ');
  const featured = await question('Featured item? (yes/no): ');
  
  const gallery = await loadGallery();
  const newId = Math.max(0, ...gallery.map(item => item.id)) + 1;
  const slug = generateSlug(title);
  
  // Construct image URLs
  const baseUrl = 'https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/images/gallery';
  const imageUrl = `${baseUrl}/${imageFilename}.jpg`;
  const thumbnailUrl = `${baseUrl}/thumbnails/${imageFilename}-thumb.jpg`;
  
  const galleryItem = {
    id: newId,
    title,
    description,
    category: category.toLowerCase(),
    technique,
    year,
    image: imageUrl,
    thumbnail: thumbnailUrl,
    tags: tags.split(',').map(tag => tag.trim()),
    dimensions,
    featured: featured.toLowerCase() === 'yes',
    published: true
  };
  
  gallery.push(galleryItem);
  await saveGallery(gallery);
  
  console.log(`\n✅ Gallery item created successfully with ID: ${newId}`);
  console.log(`📸 Image URL: ${imageUrl}`);
  console.log(`🖼️  Thumbnail URL: ${thumbnailUrl}`);
  console.log('\n📝 Remember to upload the image files to:');
  console.log(`   - data/images/gallery/${imageFilename}.jpg`);
  console.log(`   - data/images/gallery/thumbnails/${imageFilename}-thumb.jpg`);
}

async function listGalleryItems() {
  const gallery = await loadGallery();
  
  console.log('\n=== All Gallery Items ===\n');
  
  if (gallery.length === 0) {
    console.log('No gallery items found.');
    return;
  }
  
  gallery.forEach(item => {
    const status = item.published ? '✅ Published' : '❌ Draft';
    const featured = item.featured ? '⭐ Featured' : '';
    console.log(`${item.id}. ${item.title} ${featured}`);
    console.log(`   Category: ${item.category} | Year: ${item.year} | Status: ${status}`);
    console.log(`   Technique: ${item.technique} | Dimensions: ${item.dimensions}`);
    console.log(`   Tags: ${item.tags.join(', ')}`);
    console.log(`   Description: ${item.description.substring(0, 100)}...`);
    console.log('');
  });
}

async function editGalleryItem() {
  const gallery = await loadGallery();
  
  if (gallery.length === 0) {
    console.log('No gallery items found to edit.');
    return;
  }
  
  await listGalleryItems();
  
  const itemId = parseInt(await question('Enter item ID to edit: '));
  const item = gallery.find(i => i.id === itemId);
  
  if (!item) {
    console.log('Gallery item not found.');
    return;
  }
  
  console.log(`\n=== Editing Gallery Item: ${item.title} ===\n`);
  
  const newTitle = await question(`Title (${item.title}): `) || item.title;
  const newDescription = await question(`Description (${item.description}): `) || item.description;
  const newCategory = await question(`Category (${item.category}): `) || item.category;
  const newTechnique = await question(`Technique (${item.technique}): `) || item.technique;
  const newYear = parseInt(await question(`Year (${item.year}): `)) || item.year;
  const newTags = await question(`Tags (${item.tags.join(', ')}): `) || item.tags.join(', ');
  const newDimensions = await question(`Dimensions (${item.dimensions}): `) || item.dimensions;
  const newFeatured = await question(`Featured (${item.featured}): `) || item.featured.toString();
  const newPublished = await question(`Published (${item.published}): `) || item.published.toString();
  
  // Update item
  item.title = newTitle;
  item.description = newDescription;
  item.category = newCategory.toLowerCase();
  item.technique = newTechnique;
  item.year = newYear;
  item.tags = newTags.split(',').map(tag => tag.trim());
  item.dimensions = newDimensions;
  item.featured = newFeatured.toLowerCase() === 'true';
  item.published = newPublished.toLowerCase() === 'true';
  
  await saveGallery(gallery);
  
  console.log('\n✅ Gallery item updated successfully!');
}

async function deleteGalleryItem() {
  const gallery = await loadGallery();
  
  if (gallery.length === 0) {
    console.log('No gallery items found to delete.');
    return;
  }
  
  await listGalleryItems();
  
  const itemId = parseInt(await question('Enter item ID to delete: '));
  const itemIndex = gallery.findIndex(i => i.id === itemId);
  
  if (itemIndex === -1) {
    console.log('Gallery item not found.');
    return;
  }
  
  const item = gallery[itemIndex];
  const confirm = await question(`Are you sure you want to delete "${item.title}"? (yes/no): `);
  
  if (confirm.toLowerCase() === 'yes') {
    gallery.splice(itemIndex, 1);
    await saveGallery(gallery);
    
    console.log('\n✅ Gallery item deleted successfully!');
    console.log('📝 Remember to manually delete the image files if no longer needed.');
  } else {
    console.log('Delete cancelled.');
  }
}

async function showCategories() {
  const gallery = await loadGallery();
  
  console.log('\n=== Gallery Categories ===\n');
  
  const categories = {};
  gallery.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });
  
  Object.keys(categories).forEach(category => {
    console.log(`📁 ${category}: ${categories[category].length} items`);
    categories[category].forEach(item => {
      const featured = item.featured ? '⭐' : '  ';
      console.log(`   ${featured} ${item.title} (${item.year})`);
    });
    console.log('');
  });
}

async function main() {
  console.log('🎨 Victor Gutierrez CMS - Gallery Management');
  console.log('===========================================');
  
  while (true) {
    console.log('\nOptions:');
    console.log('1. Create new gallery item');
    console.log('2. List all gallery items');
    console.log('3. Edit gallery item');
    console.log('4. Delete gallery item');
    console.log('5. Show categories');
    console.log('6. Exit');
    
    const choice = await question('\nChoose an option (1-6): ');
    
    switch (choice) {
      case '1':
        await createGalleryItem();
        break;
      case '2':
        await listGalleryItems();
        break;
      case '3':
        await editGalleryItem();
        break;
      case '4':
        await deleteGalleryItem();
        break;
      case '5':
        await showCategories();
        break;
      case '6':
        console.log('👋 Goodbye!');
        rl.close();
        return;
      default:
        console.log('Invalid option. Please choose 1-6.');
    }
  }
}

main().catch(console.error);