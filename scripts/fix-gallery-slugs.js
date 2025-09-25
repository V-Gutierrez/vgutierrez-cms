#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
}

async function ensureUniqueSlug(baseSlug, existingItems) {
    let slug = baseSlug;
    let counter = 1;

    while (existingItems.some(item => item.slug === slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

async function fixGallerySlugs() {
    try {
        console.log('🔧 Fixing gallery slugs...');

        const galleryPath = path.join(DATA_DIR, 'gallery.json');
        const gallery = JSON.parse(await fs.readFile(galleryPath, 'utf8'));

        let modified = false;
        const existingSlugs = [];

        for (const item of gallery) {
            // Add slug if missing
            if (!item.slug) {
                const baseSlug = generateSlug(item.title);
                item.slug = await ensureUniqueSlug(baseSlug, [...gallery, ...existingSlugs.map(s => ({ slug: s }))]);
                existingSlugs.push(item.slug);
                modified = true;
                console.log(`✅ Added slug "${item.slug}" to item "${item.title}"`);
            } else {
                existingSlugs.push(item.slug);
            }

            // Ensure all items have required fields
            if (!item.tags) {
                item.tags = [];
                modified = true;
            }
            if (!item.category) {
                item.category = 'uncategorized';
                modified = true;
            }
            if (!item.description) {
                item.description = '';
                modified = true;
            }
            if (item.published === undefined) {
                item.published = true;
                modified = true;
            }
            if (item.featured === undefined) {
                item.featured = false;
                modified = true;
            }

            // Remove thumbnail field if it exists
            if (item.thumbnail !== undefined) {
                delete item.thumbnail;
                modified = true;
                console.log(`✅ Removed thumbnail from item "${item.title}"`);
            }
        }

        if (modified) {
            await fs.writeFile(galleryPath, JSON.stringify(gallery, null, 2));
            console.log('🎉 Gallery slugs fixed and saved!');
        } else {
            console.log('✅ All gallery items already have slugs!');
        }

    } catch (error) {
        console.error('❌ Error fixing gallery slugs:', error);
    }
}

fixGallerySlugs();