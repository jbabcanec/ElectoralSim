# Electoral Representation Visualizer

An interactive visualization tool that explores the relationship between population and electoral votes in U.S. presidential elections from 1789 to 2024.

## Overview

This project provides an interactive map-based visualization of U.S. electoral data, allowing users to:
- Explore historical electoral vote allocations relative to state populations
- Visualize representation disparities across states
- View hypothetical scenarios with equal population-to-electoral vote ratios
- Analyze state-specific electoral data through interactive tooltips
- Compare different election years and see state admission timelines

## Features

### Core Visualizations
- **Population per Electoral Vote**: Color-coded map showing representation levels
- **Electoral Vote Size Scaling**: States sized by their electoral vote count
- **Historical Timeline**: Navigate through all presidential elections (1789-2024)
- **Equal Representation Mode**: View hypothetical electoral distributions
- **State-Based Normalization**: Set any state as the baseline for electoral vote calculations

### Interactive Elements
- **Hover Information**: Detailed state data including:
  - Electoral votes and population
  - Winner and runner-up parties
  - Population per electoral vote
  - Representation ratio compared to national average
- **Time Slider**: Smoothly transition between election years
- **View Modes**: 
  - Standard view
  - Population-weighted view
  - Equal representation hypothesis
  - State-normalized view
- **Party Coloring**: Traditional red/blue/other party colors

### Data Features
- Non-existent states are greyed out for historical accuracy
- Special handling for Civil War and Reconstruction periods
- Third-party victories properly displayed
- Split electoral votes indicated

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Visualization**: D3.js for map rendering and interactions
- **Styling**: Tailwind CSS for modern UI
- **Data Processing**: Python for data preparation
- **Build Tool**: Vite for fast development

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/electoral-visualizer.git
cd electoral-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
electoral-visualizer/
├── src/
│   ├── components/
│   │   ├── Map.tsx              # Main map component
│   │   ├── Timeline.tsx         # Year selector
│   │   ├── Tooltip.tsx          # State information display
│   │   ├── Controls.tsx         # View mode controls
│   │   └── Legend.tsx           # Map legend
│   ├── utils/
│   │   ├── dataProcessor.ts     # Data transformation utilities
│   │   ├── colorScales.ts       # Color mapping functions
│   │   └── calculations.ts      # Electoral math utilities
│   ├── data/
│   │   └── processedData.json   # Preprocessed electoral data
│   └── styles/
│       └── main.css             # Global styles
├── public/
│   └── assets/
│       └── us-states.svg        # U.S. map SVG
├── data/
│   ├── electoral_data_final.xlsx # Source data
│   └── electoral_enhanced.csv    # Enhanced data with calculations
└── scripts/
    └── processData.py           # Data preprocessing script
```

## Data Sources

- Electoral vote allocations: Historical records (1789-2024)
- Population data: U.S. Census Bureau
- State boundaries: Standard U.S. map projection
- Party affiliations: Historical election results

## Usage

### Basic Navigation
1. Use the timeline slider to select an election year
2. Hover over states to see detailed information
3. Click view mode buttons to switch visualizations

### View Modes
- **Standard**: Traditional electoral map with party colors
- **Representation**: Color gradient showing population per electoral vote
- **Scaled**: States sized by electoral vote count
- **Equal**: Hypothetical equal representation scenario
- **Normalized**: Select a state to recalculate all electoral votes based on its ratio

### Keyboard Shortcuts
- `←/→`: Navigate between election years
- `Space`: Play/pause animation through years
- `1-5`: Switch between view modes
- `R`: Reset to default view

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Data Updates
To update the electoral data:
```bash
cd scripts
python processData.py --input ../data/electoral_data_final.xlsx
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Historical electoral data compiled from National Archives
- Population data from U.S. Census Bureau
- Map SVG adapted from public domain sources

## Contact

For questions or feedback, please open an issue on GitHub.