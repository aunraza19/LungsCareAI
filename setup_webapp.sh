#!/bin/bash

# LUNGSCAREAI Web Application Setup Script
echo "🏥 Setting up LUNGSCAREAI Web Application..."
echo "=" * 60

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo ""
echo "🔧 Setting up Backend (FastAPI)..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup complete"

# Setup Frontend
echo ""
echo "🔧 Setting up Frontend (React + Vite)..."
cd ../frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete"

# Create startup scripts
cd ..
echo ""
echo "📝 Creating startup scripts..."

# Backend startup script
cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting LUNGSCAREAI Backend Server..."
cd backend
source venv/bin/activate
python app.py
EOF

# Frontend startup script
cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting LUNGSCAREAI Frontend Server..."
cd frontend
npm run dev
EOF

# Make scripts executable
chmod +x start_backend.sh
chmod +x start_frontend.sh

echo ""
echo "🎉 LUNGSCAREAI Web Application Setup Complete!"
echo "=" * 60
echo ""
echo "📋 Next Steps:"
echo "1. Make sure Qdrant is running:"
echo "   sudo docker run -p 6333:6333 -p 6334:6334 -v \$(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant:latest"
echo ""
echo "2. Make sure Ollama is running with Gemma model:"
echo "   ollama serve"
echo "   ollama pull gemma3:latest"
echo ""
echo "3. Start the backend server:"
echo "   ./start_backend.sh"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   ./start_frontend.sh"
echo ""
echo "5. Open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "🔧 The backend API will be available at:"
echo "   http://localhost:8000"
echo "   API documentation: http://localhost:8000/docs"
echo ""
echo "✅ Setup completed successfully!"
