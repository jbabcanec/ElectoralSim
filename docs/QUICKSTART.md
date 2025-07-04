# Quick Start Guide

## 🚀 Run the Application

### Option 1: Easy Run Script (Recommended)
```bash
./run.sh
```

This script will:
- Check if Node.js and npm are installed
- Install dependencies automatically
- Process the electoral data
- Start the development server
- Open your browser to http://localhost:3000

### Option 2: Manual Setup
If you prefer to run commands manually:

```bash
# 1. Install dependencies
npm install

# 2. Process the data (first time only)
cd scripts
python3 processData.py
cd ..

# 3. Start the development server
npm run dev
```

## 📋 Requirements

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python 3** (for data processing) - Usually pre-installed on Mac/Linux
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🎯 Quick Tour

Once the app is running:

1. **Navigate through time** - Use the timeline slider at the bottom
2. **Switch view modes** - Try different visualizations in the left panel
3. **Hover over states** - See detailed information
4. **Try normalized view** - Select a state to see what happens if all states had its ratio
5. **Play animation** - Click the play button to see electoral history unfold

## 🔧 Common Issues

### "Node.js not found"
Install Node.js from https://nodejs.org/

### "Python not found" 
On Mac: `brew install python3`
On Windows: Download from https://python.org/

### Port 3000 already in use
The app will automatically try port 3001, 3002, etc.

### Data files missing
Run: `cd scripts && python3 processData.py`

## 🛑 Stopping the App

Press `Ctrl+C` in the terminal where you ran the script.

## 📞 Need Help?

Check the full README.md for detailed documentation and troubleshooting.