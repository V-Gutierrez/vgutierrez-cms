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

async function loadProfile() {
  try {
    const profileData = await fs.readFile(path.join(DATA_DIR, 'profile.json'), 'utf8');
    return JSON.parse(profileData);
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
}

async function saveProfile(profile) {
  await fs.writeFile(
    path.join(DATA_DIR, 'profile.json'),
    JSON.stringify(profile, null, 2)
  );
}

async function editPersonalInfo() {
  const profile = await loadProfile();
  if (!profile) return;
  
  console.log('\n=== Edit Personal Information ===\n');
  
  const info = profile.personalInfo;
  
  const newName = await question(`Name (${info.name}): `) || info.name;
  const newTitle = await question(`Title (${info.title}): `) || info.title;
  const newSubtitle = await question(`Subtitle (${info.subtitle}): `) || info.subtitle;
  const newLocation = await question(`Location (${info.location}): `) || info.location;
  const newEmail = await question(`Email (${info.email}): `) || info.email;
  const newLinkedin = await question(`LinkedIn (${info.linkedin}): `) || info.linkedin;
  const newGithub = await question(`GitHub (${info.github}): `) || info.github;
  const newDescription = await question(`Description: `) || info.description;
  
  profile.personalInfo = {
    ...info,
    name: newName,
    title: newTitle,
    subtitle: newSubtitle,
    location: newLocation,
    email: newEmail,
    linkedin: newLinkedin,
    github: newGithub,
    description: newDescription
  };
  
  await saveProfile(profile);
  console.log('\n✅ Personal information updated successfully!');
}

async function editSkills() {
  const profile = await loadProfile();
  if (!profile) return;
  
  console.log('\n=== Edit Skills ===\n');
  console.log('Current skill categories:');
  Object.keys(profile.skills).forEach((category, index) => {
    console.log(`${index + 1}. ${category}`);
  });
  
  const choice = await question('\nChoose category to edit (number): ');
  const categories = Object.keys(profile.skills);
  const selectedCategory = categories[parseInt(choice) - 1];
  
  if (!selectedCategory) {
    console.log('Invalid category selection.');
    return;
  }
  
  console.log(`\nEditing: ${selectedCategory}`);
  console.log('Current skills:');
  profile.skills[selectedCategory].forEach((skill, index) => {
    console.log(`${index + 1}. ${skill}`);
  });
  
  const action = await question('\n1. Add skill\n2. Remove skill\n3. Edit skill\nChoose action: ');
  
  switch (action) {
    case '1':
      const newSkill = await question('Enter new skill: ');
      profile.skills[selectedCategory].push(newSkill);
      break;
    case '2':
      const removeIndex = parseInt(await question('Enter skill number to remove: ')) - 1;
      if (removeIndex >= 0 && removeIndex < profile.skills[selectedCategory].length) {
        profile.skills[selectedCategory].splice(removeIndex, 1);
      }
      break;
    case '3':
      const editIndex = parseInt(await question('Enter skill number to edit: ')) - 1;
      if (editIndex >= 0 && editIndex < profile.skills[selectedCategory].length) {
        const currentSkill = profile.skills[selectedCategory][editIndex];
        const updatedSkill = await question(`Edit skill (${currentSkill}): `) || currentSkill;
        profile.skills[selectedCategory][editIndex] = updatedSkill;
      }
      break;
  }
  
  await saveProfile(profile);
  console.log('\n✅ Skills updated successfully!');
}

async function editTechnicalStack() {
  const profile = await loadProfile();
  if (!profile) return;
  
  console.log('\n=== Edit Technical Stack ===\n');
  console.log('Current technical categories:');
  Object.keys(profile.technicalStack).forEach((category, index) => {
    console.log(`${index + 1}. ${category}: ${profile.technicalStack[category].join(', ')}`);
  });
  
  const choice = await question('\nChoose category to edit (number): ');
  const categories = Object.keys(profile.technicalStack);
  const selectedCategory = categories[parseInt(choice) - 1];
  
  if (!selectedCategory) {
    console.log('Invalid category selection.');
    return;
  }
  
  const currentTech = profile.technicalStack[selectedCategory].join(', ');
  const newTech = await question(`${selectedCategory} (${currentTech}): `) || currentTech;
  
  profile.technicalStack[selectedCategory] = newTech.split(',').map(tech => tech.trim());
  
  await saveProfile(profile);
  console.log('\n✅ Technical stack updated successfully!');
}

async function editSiteSettings() {
  const profile = await loadProfile();
  if (!profile) return;
  
  console.log('\n=== Edit Site Settings ===\n');
  
  const settings = profile.siteSettings;
  
  const newSiteTitle = await question(`Site Title (${settings.siteTitle}): `) || settings.siteTitle;
  const newSiteDescription = await question(`Site Description: `) || settings.siteDescription;
  const newTheme = await question(`Theme (${settings.theme}): `) || settings.theme;
  const newPrimaryColor = await question(`Primary Color (${settings.primaryColor}): `) || settings.primaryColor;
  
  profile.siteSettings = {
    ...settings,
    siteTitle: newSiteTitle,
    siteDescription: newSiteDescription,
    theme: newTheme,
    primaryColor: newPrimaryColor
  };
  
  await saveProfile(profile);
  console.log('\n✅ Site settings updated successfully!');
}

async function viewProfile() {
  const profile = await loadProfile();
  if (!profile) return;
  
  console.log('\n=== Current Profile ===\n');
  console.log(`Name: ${profile.personalInfo.name}`);
  console.log(`Title: ${profile.personalInfo.title}`);
  console.log(`Location: ${profile.personalInfo.location}`);
  console.log(`Email: ${profile.personalInfo.email}`);
  console.log(`LinkedIn: ${profile.personalInfo.linkedin}`);
  console.log(`GitHub: ${profile.personalInfo.github}`);
  console.log(`\nDescription: ${profile.personalInfo.description}`);
  
  console.log('\nLanguages:');
  profile.languages.forEach(lang => {
    console.log(`- ${lang.language}: ${lang.level}`);
  });
  
  console.log('\nAssets:');
  profile.assets.forEach(asset => {
    console.log(`- ${asset}`);
  });
}

async function main() {
  console.log('🚀 Victor Gutierrez CMS - Profile Management');
  console.log('==========================================');
  
  while (true) {
    console.log('\nOptions:');
    console.log('1. View current profile');
    console.log('2. Edit personal information');
    console.log('3. Edit skills');
    console.log('4. Edit technical stack');
    console.log('5. Edit site settings');
    console.log('6. Exit');
    
    const choice = await question('\nChoose an option (1-6): ');
    
    switch (choice) {
      case '1':
        await viewProfile();
        break;
      case '2':
        await editPersonalInfo();
        break;
      case '3':
        await editSkills();
        break;
      case '4':
        await editTechnicalStack();
        break;
      case '5':
        await editSiteSettings();
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