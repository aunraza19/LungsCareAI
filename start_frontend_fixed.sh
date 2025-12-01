#!/bin/bash

# Script to fix TypeScript issues and start the frontend development server

echo "🔧 Starting Frontend Setup..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

echo "📦 Installing dependencies..."
npm install

echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit

echo "🚀 Starting development server..."
echo "Open VS Code Command Palette (Ctrl+Shift+P) and run 'TypeScript: Restart TS Server' to fix red underlines"
echo "Then your frontend will be available at http://localhost:3000"

npm run dev
