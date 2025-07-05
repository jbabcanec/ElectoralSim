# 🚀 GitHub Pages Deployment Guide

## Quick Setup Steps

### 1. Create GitHub Repository
```bash
# If you don't already have this as a GitHub repo, create one at github.com
# Then add it as a remote (replace YOUR_USERNAME with your GitHub username):
git remote add origin https://github.com/YOUR_USERNAME/electoral-visualizer.git
```

### 2. Push to GitHub
```bash
# Push all your changes to GitHub
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to your repository on GitHub.com
2. Click **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically run and deploy your site

### 4. Your Live Site
Your site will be available at:
```
https://YOUR_USERNAME.github.io/electoral-visualizer/
```

## 🔧 Development Workflow

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Data Updates
```bash
python3 scripts/processing/processData.py    # Regenerate data
python3 scripts/validation/validate_data.py  # Validate data
```

## 📁 Project Structure

- **Frontend**: React + TypeScript + Vite
- **Data**: Single source CSV with processing pipeline
- **Deployment**: GitHub Actions + GitHub Pages
- **Default View**: 2024 Election (Trump vs Harris)

## 🎯 Features

- **Interactive Map**: Click states to see detailed data
- **Timeline Scrubber**: Navigate through 1789-2024 elections
- **View Modes**: Standard, population-normalized, what-if analysis
- **Real Data**: Official Census Bureau 2024 population estimates
- **Complete Dataset**: All 60 presidential elections with state-by-state results

Your electoral visualizer is now ready to be shared with the world! 🗳️