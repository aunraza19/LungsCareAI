#!/bin/bash

# LUNGSCAREAI Web Application Demo Script
echo "🏥 LUNGSCAREAI Web Application Demo"
echo "===================================="

echo ""
echo "📋 This demo will show you how to:"
echo "1. Set up the complete web application"
echo "2. Start the backend and frontend servers"
echo "3. Use the web interface for medical analysis"
echo ""

echo "🔧 PREREQUISITES:"
echo "- Python 3.8+ with pip"
echo "- Node.js 16+ with npm"
echo "- Docker (for Qdrant database)"
echo "- Ollama (for AI models)"
echo ""

read -p "📝 Do you have all prerequisites installed? (y/n): " prerequisites
if [ "$prerequisites" != "y" ]; then
    echo "❌ Please install the prerequisites first"
    exit 1
fi

echo ""
echo "🚀 STEP 1: Setting up the web application..."
echo "Making setup script executable..."
chmod +x setup_webapp.sh

echo ""
echo "Running web application setup..."
./setup_webapp.sh

echo ""
echo "🗄️ STEP 2: Starting required services..."

# Check if Qdrant is running
echo "Checking Qdrant database..."
if ! curl -s http://localhost:6333/health > /dev/null 2>&1; then
    echo "Starting Qdrant database (Docker)..."
    docker run -d --name lungscareai-qdrant \
        -p 6333:6333 -p 6334:6334 \
        -v "$(pwd)/qdrant_storage:/qdrant/storage" \
        qdrant/qdrant:latest
    
    echo "Waiting for Qdrant to start..."
    sleep 10
fi

# Check if Ollama is running
echo "Checking Ollama service..."
if ! curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "❌ Ollama is not running. Please start it with:"
    echo "   ollama serve"
    echo ""
    echo "And make sure you have the Gemma model:"
    echo "   ollama pull gemma3:latest"
    exit 1
fi

echo "✅ All services are running!"

echo ""
echo "🖥️ STEP 3: Starting web application servers..."

# Start backend in background
echo "Starting backend server..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 5

# Start frontend in background
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 LUNGSCAREAI Web Application is now running!"
echo "================================================"
echo ""
echo "🌐 Frontend (React):  http://localhost:3000"
echo "⚙️ Backend (FastAPI): http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🗄️ Qdrant Database:  http://localhost:6333"
echo ""
echo "📋 WEB INTERFACE USAGE:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to 'Register' to add a new patient"
echo "3. Use 'Audio Analysis' for lung sound analysis"
echo "4. Use 'X-ray Analysis' for chest X-ray analysis"
echo "5. Use 'AI Chat' to ask medical questions"
echo "6. View generated reports in 'Reports' section"
echo ""
echo "🔧 API ENDPOINTS (for developers):"
echo "POST /api/patients/register        - Register new patient"
echo "POST /api/analyze/audio/basic       - Basic audio analysis"
echo "POST /api/analyze/audio/gradient    - Audio analysis with gradient XAI"
echo "POST /api/analyze/audio/attention   - Audio analysis with attention XAI"
echo "POST /api/analyze/xray/basic        - Basic X-ray analysis"
echo "POST /api/analyze/xray/visualization - X-ray analysis with visualization"
echo "POST /api/chat                      - Chat with AI assistant"
echo "GET  /api/patients                  - Get all patients"
echo ""
echo "📁 FILE STRUCTURE:"
echo "backend/         - FastAPI backend server"
echo "frontend/        - React frontend application"
echo "uploads/         - Temporary uploaded files"
echo "outputs/         - Analysis visualizations"
echo "reports/         - Generated PDF reports"
echo "qdrant_storage/  - Vector database storage"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🔄 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Cleanup completed"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

echo "Press Ctrl+C to stop all servers and exit"
echo ""

# Keep script running and show logs
while true; do
    sleep 10
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend server stopped unexpectedly"
        break
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend server stopped unexpectedly"  
        break
    fi
done

cleanup
