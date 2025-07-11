#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");

const IMAGES_DIR = path.join(__dirname, "..", "data", "images");
const GITHUB_REPO = "V-Gutierrez/vgutierrez-cms";
const GITHUB_BRANCH = "main";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function generateImageUrls() {
  const baseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data/images`;

  console.log("🖼️  GitHub Image URLs:");
  console.log("=====================");
  console.log("");
  console.log("Base URL:", baseUrl);
  console.log("");
  console.log("URL Templates:");
  console.log("- Profile Photo: " + `${baseUrl}/profile/victor-photo.jpg`);
  console.log("- Project Images: " + `${baseUrl}/projects/{project-slug}.jpg`);
  console.log("- Blog Images: " + `${baseUrl}/blog/{post-slug}-hero.jpg`);
  console.log(
    "- Blog Content: " + `${baseUrl}/blog/{post-slug}-{image-name}.jpg`,
  );
  console.log("");

  return baseUrl;
}

async function listImages() {
  console.log("📁 Current Images Structure:");
  console.log("============================");

  try {
    const categories = ["profile", "projects", "blog"];

    for (const category of categories) {
      const categoryPath = path.join(IMAGES_DIR, category);

      try {
        const files = await fs.readdir(categoryPath);
        console.log(`\n📂 ${category}/`);

        if (files.length === 0) {
          console.log("   (empty - add images here)");
        } else {
          files.forEach((file) => {
            console.log(`   🖼️  ${file}`);
          });
        }
      } catch (error) {
        console.log(`\n📂 ${category}/`);
        console.log("   (directory not accessible)");
      }
    }
  } catch (error) {
    console.error("Error listing images:", error.message);
  }
}

async function addImageReference() {
  console.log("\n=== Add Image Reference ===\n");

  const type = await question("Image type (profile/project/blog): ");
  const name = await question("Image filename (with extension): ");
  const description = await question("Image description: ");

  const baseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data/images`;
  const imageUrl = `${baseUrl}/${type}/${name}`;

  console.log("\n✅ Image Reference Created:");
  console.log("==========================");
  console.log(`URL: ${imageUrl}`);
  console.log(`Type: ${type}`);
  console.log(`Description: ${description}`);
  console.log("");
  console.log("📝 Next Steps:");
  console.log(`1. Add the image file to: data/images/${type}/${name}`);
  console.log("2. Commit and push to GitHub");
  console.log("3. Use this URL in your content");

  // Save to images registry
  const registry = await loadImageRegistry();
  registry.push({
    type,
    filename: name,
    url: imageUrl,
    description,
    createdAt: new Date().toISOString(),
  });

  await saveImageRegistry(registry);
  console.log("✅ Added to image registry");
}

async function loadImageRegistry() {
  try {
    const registryPath = path.join(IMAGES_DIR, "registry.json");
    const data = await fs.readFile(registryPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveImageRegistry(registry) {
  const registryPath = path.join(IMAGES_DIR, "registry.json");
  await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
}

async function updateProfileImage() {
  console.log("\n=== Update Profile Image ===\n");

  const baseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data/images`;
  const profileImageUrl = `${baseUrl}/profile/victor-photo.jpg`;

  // Load and update profile.json
  try {
    const profilePath = path.join(__dirname, "..", "data", "profile.json");
    const profileData = await fs.readFile(profilePath, "utf8");
    const profile = JSON.parse(profileData);

    profile.personalInfo.profileImage = profileImageUrl;

    await fs.writeFile(profilePath, JSON.stringify(profile, null, 2));

    console.log("✅ Profile updated with image URL:");
    console.log(`   ${profileImageUrl}`);
    console.log("");
    console.log("📝 To use this image:");
    console.log("1. Add your photo as: data/images/profile/victor-photo.jpg");
    console.log("2. Recommended size: 400x500px or similar ratio");
    console.log("3. Format: JPG or PNG");
    console.log("4. Commit and push to GitHub");
  } catch (error) {
    console.error("Error updating profile:", error.message);
  }
}

async function generateProjectImages() {
  console.log("\n=== Generate Project Image References ===\n");

  try {
    const projectsPath = path.join(__dirname, "..", "data", "projects.json");
    const projectsData = await fs.readFile(projectsPath, "utf8");
    const projects = JSON.parse(projectsData);

    const baseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data/images`;

    for (let project of projects) {
      project.image = `${baseUrl}/projects/${project.slug}.jpg`;
    }

    await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2));

    console.log("✅ Project images added to all projects:");
    projects.forEach((project) => {
      console.log(`   ${project.title}: ${project.image}`);
    });

    console.log("");
    console.log("📝 To use these images:");
    console.log(
      "1. Create images for each project with the exact filenames shown above",
    );
    console.log("2. Recommended size: 600x400px");
    console.log("3. Format: JPG or PNG");
    console.log("4. Add to data/images/projects/ folder");
  } catch (error) {
    console.error("Error updating projects:", error.message);
  }
}

async function showImageBestPractices() {
  console.log("\n📖 Image Best Practices:");
  console.log("========================");
  console.log("");
  console.log("🖼️  Profile Photo:");
  console.log("   • Size: 400x500px (or 4:5 ratio)");
  console.log("   • Format: JPG (smaller file) or PNG (better quality)");
  console.log("   • File size: < 500KB for fast loading");
  console.log("   • Professional headshot recommended");
  console.log("");
  console.log("🏗️  Project Images:");
  console.log("   • Size: 600x400px (3:2 ratio)");
  console.log("   • Screenshots, diagrams, or architecture visuals");
  console.log("   • Clear, high-contrast images");
  console.log("   • File size: < 300KB each");
  console.log("");
  console.log("📝 Blog Images:");
  console.log("   • Hero images: 800x400px (2:1 ratio)");
  console.log("   • Content images: 600x300px or as needed");
  console.log("   • Relevant to the post content");
  console.log("   • Consider accessibility (alt text)");
  console.log("");
  console.log("🚀 Optimization Tips:");
  console.log("   • Use tools like TinyPNG to compress");
  console.log("   • WebP format for better compression (if supported)");
  console.log("   • Consistent naming convention");
  console.log("   • Keep original high-res versions as backup");
  console.log("");
  console.log("🔗 Alternative CDN Options:");
  console.log("   • Cloudinary (free tier available)");
  console.log("   • ImgBB (free image hosting)");
  console.log("   • GitHub (what we're using - free and reliable)");
  console.log("   • AWS S3 + CloudFront (professional option)");
}

async function main() {
  console.log("🖼️  Victor Gutierrez CMS - Image Management");
  console.log("==========================================");

  while (true) {
    console.log("\nOptions:");
    console.log("1. List current images");
    console.log("2. Generate image URLs");
    console.log("3. Add new image reference");
    console.log("4. Update profile image");
    console.log("5. Generate project images");
    console.log("6. Show best practices");
    console.log("7. Exit");

    const choice = await question("\nChoose an option (1-7): ");

    switch (choice) {
      case "1":
        await listImages();
        break;
      case "2":
        await generateImageUrls();
        break;
      case "3":
        await addImageReference();
        break;
      case "4":
        await updateProfileImage();
        break;
      case "5":
        await generateProjectImages();
        break;
      case "6":
        await showImageBestPractices();
        break;
      case "7":
        console.log("👋 Goodbye!");
        rl.close();
        return;
      default:
        console.log("Invalid option. Please choose 1-7.");
    }
  }
}

main().catch(console.error);

