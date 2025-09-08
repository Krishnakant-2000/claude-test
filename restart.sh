#!/bin/bash

# Kill any existing React dev server processes on port 3001
echo "🔄 Stopping existing server on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No existing server found"

# Wait a moment for cleanup
sleep 2

# Start the development server
echo "🚀 Starting development server on port 3001..."
PORT=3001 npm start