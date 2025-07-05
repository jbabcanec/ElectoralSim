#!/bin/bash

# Run the data processing script
echo "Processing electoral data..."
python3 scripts/processing/processData.py

# Check if processing was successful
if [ $? -eq 0 ]; then
    echo "Data processing complete!"
    
    # Start the development server
    echo "Starting development server..."
    npm run dev
else
    echo "Data processing failed. Please check the error messages above."
    exit 1
fi