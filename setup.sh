#!/bin/bash

# Victor Gutierrez CMS - Quick Setup Script
# This script helps you set up the CMS and create your first content

echo "🚀 Victor Gutierrez CMS Setup"
echo "============================"
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies (if package.json exists)
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Validate existing data
echo "🔍 Validating data structure..."
node scripts/build-tools.js validate
echo ""

# Display current content summary
echo "📊 Current Content Summary:"
echo "=========================="

# Count posts
if [ -f "data/posts.json" ]; then
    POST_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('data/posts.json')).length)")
    echo "📝 Blog Posts: $POST_COUNT"
fi

# Count projects
if [ -f "data/projects.json" ]; then
    PROJECT_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('data/projects.json')).length)")
    echo "💼 Projects: $PROJECT_COUNT"
fi

echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1. Create a new blog post"
echo "2. Add a new project"
echo "3. Edit profile information"
echo "4. Generate GitHub URLs"
echo "5. Build and deploy"
echo "6. Exit"
echo ""

read -p "Choose an option (1-6): " choice

case $choice in
    1)
        echo "🆕 Creating new blog post..."
        npm run blog
        ;;
    2)
        echo "🆕 Adding new project..."
        npm run projects
        ;;
    3)
        echo "✏️ Editing profile..."
        npm run profile
        ;;
    4)
        echo "🔗 Generating GitHub URLs..."
        npm run urls
        ;;
    5)
        echo "🏗️ Building and preparing for deployment..."
        npm run build
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid option. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Task completed!"
echo ""

# Ask if user wants to build for deployment
if [ "$choice" != "5" ]; then
    read -p "Would you like to build for deployment? (y/n): " build_choice
    if [ "$build_choice" = "y" ] || [ "$build_choice" = "Y" ]; then
        echo "🏗️ Building..."
        npm run build
        echo ""
        echo "📦 Ready for deployment! Check the 'deploy' folder."
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a GitHub repository for your data"
echo "2. Update GITHUB_REPO in scripts/build-tools.js"
echo "3. Run 'npm run deploy' and upload the deploy folder"
echo "4. Update your website with the GitHub URLs"
echo ""
echo "For help, check README.md or run individual scripts:"
echo "- npm run blog (manage blog posts)"
echo "- npm run projects (manage portfolio)"
echo "- npm run profile (edit profile)"
echo "- npm run build (prepare for deployment)"