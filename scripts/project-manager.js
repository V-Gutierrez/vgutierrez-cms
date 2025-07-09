#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '..', 'data');

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

async function loadProjects() {
  try {
    const projectsData = await fs.readFile(path.join(DATA_DIR, 'projects.json'), 'utf8');
    return JSON.parse(projectsData);
  } catch (error) {
    return [];
  }
}

async function saveProjects(projects) {
  await fs.writeFile(
    path.join(DATA_DIR, 'projects.json'),
    JSON.stringify(projects, null, 2)
  );
}

async function createProject() {
  console.log('\n=== Creating New Project ===\n');
  
  const title = await question('Project title: ');
  const description = await question('Project description: ');
  const category = await question('Category: ');
  const technologies = await question('Technologies (comma-separated): ');
  const status = await question('Status (completed/in-progress/planned): ');
  const startDate = await question('Start date (YYYY-MM-DD): ');
  const endDate = await question('End date (YYYY-MM-DD or "ongoing"): ');
  const featured = await question('Featured project? (true/false): ');
  
  const projects = await loadProjects();
  const newId = Math.max(0, ...projects.map(p => p.id)) + 1;
  const slug = generateSlug(title);
  
  // Create project
  const newProject = {
    id: newId,
    title,
    slug,
    description,
    category,
    technologies: technologies.split(',').map(tech => tech.trim()),
    status,
    startDate,
    endDate,
    metrics: {},
    highlights: [],
    featured: featured.toLowerCase() === 'true'
  };
  
  projects.push(newProject);
  await saveProjects(projects);
  
  console.log(`\n✅ Project created successfully with ID: ${newId}`);
}

async function listProjects() {
  const projects = await loadProjects();
  
  console.log('\n=== All Projects ===\n');
  
  if (projects.length === 0) {
    console.log('No projects found.');
    return;
  }
  
  projects.forEach(project => {
    const featuredIcon = project.featured ? '⭐' : '  ';
    console.log(`${featuredIcon} ${project.id}. ${project.title}`);
    console.log(`   Category: ${project.category} | Status: ${project.status}`);
    console.log(`   Technologies: ${project.technologies.join(', ')}`);
    console.log(`   Period: ${project.startDate} to ${project.endDate}`);
    console.log(`   Description: ${project.description.substring(0, 100)}...`);
    console.log('');
  });
}

async function editProject() {
  const projects = await loadProjects();
  
  if (projects.length === 0) {
    console.log('No projects found to edit.');
    return;
  }
  
  await listProjects();
  
  const projectId = parseInt(await question('Enter project ID to edit: '));
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    console.log('Project not found.');
    return;
  }
  
  console.log(`\n=== Editing Project: ${project.title} ===\n`);
  
  const newTitle = await question(`Title (${project.title}): `) || project.title;
  const newDescription = await question(`Description: `) || project.description;
  const newCategory = await question(`Category (${project.category}): `) || project.category;
  const newTechnologies = await question(`Technologies (${project.technologies.join(', ')}): `) || project.technologies.join(', ');
  const newStatus = await question(`Status (${project.status}): `) || project.status;
  const newStartDate = await question(`Start date (${project.startDate}): `) || project.startDate;
  const newEndDate = await question(`End date (${project.endDate}): `) || project.endDate;
  const newFeatured = await question(`Featured (${project.featured}): `) || project.featured.toString();
  
  // Update project
  project.title = newTitle;
  project.description = newDescription;
  project.category = newCategory;
  project.technologies = newTechnologies.split(',').map(tech => tech.trim());
  project.status = newStatus;
  project.startDate = newStartDate;
  project.endDate = newEndDate;
  project.featured = newFeatured.toLowerCase() === 'true';
  project.slug = generateSlug(newTitle);
  
  await saveProjects(projects);
  
  console.log('\n✅ Project updated successfully!');
}

async function deleteProject() {
  const projects = await loadProjects();
  
  if (projects.length === 0) {
    console.log('No projects found to delete.');
    return;
  }
  
  await listProjects();
  
  const projectId = parseInt(await question('Enter project ID to delete: '));
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex === -1) {
    console.log('Project not found.');
    return;
  }
  
  const project = projects[projectIndex];
  const confirm = await question(`Are you sure you want to delete "${project.title}"? (yes/no): `);
  
  if (confirm.toLowerCase() === 'yes') {
    projects.splice(projectIndex, 1);
    await saveProjects(projects);
    
    console.log('\n✅ Project deleted successfully!');
  } else {
    console.log('Delete cancelled.');
  }
}

async function main() {
  console.log('🚀 Victor Gutierrez CMS - Project Management');
  console.log('==========================================');
  
  while (true) {
    console.log('\nOptions:');
    console.log('1. Create new project');
    console.log('2. List all projects');
    console.log('3. Edit project');
    console.log('4. Delete project');
    console.log('5. Exit');
    
    const choice = await question('\nChoose an option (1-5): ');
    
    switch (choice) {
      case '1':
        await createProject();
        break;
      case '2':
        await listProjects();
        break;
      case '3':
        await editProject();
        break;
      case '4':
        await deleteProject();
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