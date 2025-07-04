#!/bin/bash

# Electoral Visualizer - Quick Start Script
echo "🏛️  Electoral Representation Visualizer"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "✅ Node.js and npm found"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in the project directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if data files exist
if [ ! -f "src/data/config.json" ]; then
    echo "📊 Processing electoral data..."
    cd scripts
    python3 processData.py
    cd ..
    if [ $? -ne 0 ]; then
        echo "❌ Failed to process data. Make sure Python 3 is installed."
        exit 1
    fi
    echo "✅ Data processed successfully"
else
    echo "✅ Data files found"
fi

# Check if we have a map file, create minimal one if not
if [ ! -f "public/assets/us-states.json" ]; then
    echo "📍 Creating minimal map file for testing..."
    mkdir -p public/assets
    echo "⚠️  Note: Using simplified 5-state map for demo. Replace with full US map data for production."
else
    echo "✅ Map file found"
fi

echo ""
echo "🚀 Starting development server..."
echo "📱 The app will open in your browser at http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""
echo "🔍 DEBUGGING TIPS:"
echo "   - Open browser DevTools (F12) to see console messages"
echo "   - Look for '✅ SVG loaded successfully' in console"
echo "   - If map doesn't appear, check Network tab for 404 errors"
echo "   - All states should be colored according to the selected view mode"
echo ""

# Start the development server
npm run dev