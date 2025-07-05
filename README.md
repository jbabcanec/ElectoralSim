# 🗳️ Electoral Representation Visualizer

**Live Site: [https://jbabcanec.github.io/ElectoralSim/](https://jbabcanec.github.io/ElectoralSim/)**

Interactive visualization of U.S. electoral votes relative to population from 1789 to 2024.

## ✨ Features

- **Complete Historical Data**: Every presidential election from 1789-2024 (60 elections)
- **2024 Election Results**: Trump 312 EVs (31 states) vs Harris 226 EVs (20 states)
- **Official 2024 Population Data**: US Census Bureau estimates for all 51 jurisdictions
- **Interactive Map**: Click states to explore detailed electoral and population data  
- **Dynamic Timeline**: Scrub through history or play animations
- **Multiple View Modes**: 
  - Standard electoral map with party colors
  - Population-normalized representation analysis
  - What-if scenarios and redistricting tools
- **Rich Analytics**: Population per electoral vote, representation ratios, historical trends

## 🚀 Quick Start

### Development
```bash
npm install        # Install dependencies
npm run dev        # Start development server (localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
```

### Data Management
```bash
python3 scripts/processing/processData.py    # Regenerate all data
python3 scripts/validation/validate_data.py  # Validate data integrity
```

## 📊 Data Architecture

- **Single Source of Truth**: `data/raw/electoral_enhanced.csv`
- **Complete Dataset**: 2,360 records covering all states and elections
- **Official Sources**: US Census Bureau, state election records
- **Automated Processing**: Python pipeline generates optimized JSON for frontend
- **Data Validation**: Comprehensive integrity checks

## 🏛️ 2024 Election Highlights

- **Total US Population**: 340,092,578
- **Most Represented**: Wyoming (195k people per EV)
- **Least Represented**: Texas (782k people per EV)
- **Battleground States**: All 7 swing states won by Trump
- **Split Votes**: Maine (3 Harris, 1 Trump), Nebraska (4 Trump, 1 Harris)

## 📁 Project Structure

```
├── src/                    # React/TypeScript frontend
├── data/
│   ├── raw/               # Single source of truth CSV
│   └── outputs/           # Generated JSON files
├── scripts/
│   ├── processing/        # Data processing pipeline
│   └── validation/        # Data integrity checks
├── docs/                  # Documentation
└── .github/workflows/     # GitHub Actions deployment
```

## 🌐 Deployment

Automatically deployed to GitHub Pages via GitHub Actions. Every push to `master` triggers a new deployment.

**Tech Stack**: React + TypeScript + Vite + TailwindCSS + D3.js

## 📈 Navigation

### View Modes
- **Standard**: Traditional electoral map with party colors
- **Representation**: Color gradient showing population per electoral vote  
- **Equal**: Hypothetical equal representation scenario
- **Normalized**: Compare all states to a selected baseline

### Interactive Features
- **Timeline Scrubber**: Navigate between 1789-2024
- **State Details**: Click any state for detailed information
- **Play Animation**: Watch electoral history unfold over time
- **What-If Analysis**: Explore alternative representation scenarios

## 🔧 Development

### Commands
```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Code linting
npm run preview    # Preview build
```

### Data Pipeline
```bash
# Update data and regenerate outputs
python3 scripts/processing/processData.py

# Validate data integrity
python3 scripts/validation/validate_data.py
```

## 🎯 Key Insights

Explore fascinating patterns in American electoral history:
- **Wyoming Effect**: Small states get outsized representation
- **Texas Scale**: Large states are underrepresented per capita
- **Historical Shifts**: See how population and power evolved
- **Modern Elections**: Analyze contemporary political geography

---

Built with comprehensive historical data and modern web technologies for an engaging exploration of American democracy.