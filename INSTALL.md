# Installation Guide - LungsCareAI

This guide provides detailed step-by-step instructions for installing and setting up LungsCareAI.

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 5GB free space
- **Internet**: Required for API calls and dependency downloads

### Software Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **Docker**: Latest version
- **Git**: Latest version

---

## 🔧 Step 1: Install Prerequisites

### Windows

**Python:**
1. Download from https://www.python.org/downloads/
2. Run installer, check "Add Python to PATH"
3. Verify: `python --version`

**Node.js:**
1. Download from https://nodejs.org/
2. Run installer
3. Verify: `node --version` and `npm --version`

**Docker Desktop:**
1. Download from https://www.docker.com/products/docker-desktop
2. Install and start Docker
3. Verify: `docker --version`

### macOS

Using Homebrew:
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python@3.10

# Install Node.js
brew install node

# Install Docker Desktop
brew install --cask docker
```

### Linux (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.10 python3-pip python3-venv -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Docker
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

---

## 📦 Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/aunraza19/LungsCareAI.git

# Navigate to project directory
cd LungsCareAI
```

---

## 🧠 Step 3: Download ML Models

Due to GitHub file size limits, download models separately:

### Option A: Direct Download
1. Download **Audio Model** (final_model_ast (1).pt) from: [Link]
2. Download **X-ray Model** (final_model.keras) from: [Link]
3. Place both files in the project root directory

### Option B: Google Drive (if provided)
```bash
# Using gdown (install first: pip install gdown)
gdown --id YOUR_AUDIO_MODEL_ID -O "final_model_ast (1).pt"
gdown --id YOUR_XRAY_MODEL_ID -O "final_model.keras"
```

### Verify Models
```bash
# Should see both model files
ls -lh *.pt *.keras
```

---

## 🔑 Step 4: Configure Environment

### Get Google Gemini API Key
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create new API key
4. Copy the key

### Set Up Environment File
```bash
# Copy example file
cp .env.example .env

# Edit .env file
# Windows: notepad .env
# Mac/Linux: nano .env
```

Add your API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**⚠️ Important**: Never commit the .env file to Git!

---

## 🐍 Step 5: Backend Setup

### Create Virtual Environment

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies
```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

This may take 5-10 minutes depending on your internet speed.

### Verify Installation
```bash
python -c "import torch; import tensorflow; print('✅ Backend dependencies installed')"
```

---

## ⚛️ Step 6: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

This may take 3-5 minutes.

### Verify Installation
```bash
npm list react react-dom
```

---

## 🗄️ Step 7: Start Qdrant Vector Database

### Using Docker (Recommended)

**Option A: Basic**
```bash
docker run -p 6333:6333 qdrant/qdrant
```

**Option B: With Persistent Storage**
```bash
docker run -p 6333:6333 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

**Windows PowerShell:**
```powershell
docker run -p 6333:6333 -v ${PWD}/qdrant_storage:/qdrant/storage qdrant/qdrant
```

### Verify Qdrant
Open browser: http://localhost:6333/dashboard

---

## 🚀 Step 8: Start the Application

You need **3 terminals** running simultaneously:

### Terminal 1: Qdrant (if not already running)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

### Terminal 2: Backend
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Wait for:
```
✅ All components initialized successfully!
INFO:     Application startup complete.
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

Wait for:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

---

## ✅ Step 9: Verify Installation

### Check All Services

1. **Backend API**: http://localhost:8000/docs
   - Should see Swagger UI

2. **Frontend**: http://localhost:3000
   - Should see LungsCareAI homepage

3. **Qdrant**: http://localhost:6333/dashboard
   - Should see vector database dashboard

### Test Basic Functionality

1. Navigate to http://localhost:3000
2. Go to "Patient Registration"
3. Register a test patient
4. Try audio or X-ray analysis with sample files

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error: Port 8000 already in use**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8000
kill -9 <PID>
```

**Error: GEMINI_API_KEY not found**
- Check .env file exists in project root
- Verify GEMINI_API_KEY is set correctly
- Restart backend after updating .env

**Error: Module not found**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Won't Start

**Error: Port 3000 already in use**
```bash
# Change port in vite.config.ts
server: {
  port: 3001  // Use different port
}
```

**Error: Cannot find module**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Qdrant Issues

**Error: Cannot connect to Qdrant**
```bash
# Check Docker is running
docker ps

# Restart Qdrant
docker stop <container_id>
docker run -p 6333:6333 qdrant/qdrant
```

### Model Loading Issues

**Error: Model file not found**
- Verify model files are in project root
- Check file names match exactly:
  - `final_model_ast (1).pt`
  - `final_model.keras`

**Error: Out of memory**
- Close other applications
- Use CPU instead of GPU (automatic fallback)
- Reduce batch size if processing multiple files

---

## 🎯 Next Steps

After successful installation:

1. **Read the User Guide**: See how to use all features
2. **Try Sample Data**: Test with included sample files
3. **Explore API Docs**: http://localhost:8000/docs
4. **Check Configuration**: Review settings in vite.config.ts and app.py

---

## 📞 Getting Help

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/aunraza19/LungsCareAI/issues)
3. Create a new issue with:
   - OS and versions
   - Error messages
   - Steps to reproduce

---

## 🔄 Updating

To update to the latest version:

```bash
# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt --upgrade

# Update frontend dependencies
cd ../frontend
npm install
npm update

# Restart all services
```

---

**Installation complete! 🎉 Enjoy using LungsCareAI!**

