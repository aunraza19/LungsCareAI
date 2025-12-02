# 🏥 LungsCareAI - AI-Powered Lung Analysis System

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**LungsCareAI** is a comprehensive, full-stack AI-powered medical diagnostic system for lung disease detection and analysis. It combines advanced deep learning models with RAG (Retrieval-Augmented Generation) technology to provide intelligent medical insights through both lung audio analysis and chest X-ray classification.

![LungsCareAI Demo](docs/demo-screenshot.png)

## ✨ Features

### 🎵 Audio Analysis
- **Binary Classification**: Normal vs Abnormal lung sounds
- **XAI (Explainable AI)**: Gradient saliency and attention rollout visualizations
- **Model**: Fine-tuned Audio Spectrogram Transformer (AST)
- **Supported Formats**: WAV, MP3, M4A, FLAC

### 🏥 Chest X-ray Analysis
- **Multi-class Classification**: 10 lung conditions
  - Control (Normal)
  - COVID-19
  - Pleural Effusion
  - Lung Opacity
  - Mass
  - Nodule
  - Pneumonia
  - Pneumothorax
  - Pulmonary Fibrosis
  - Tuberculosis
- **Advanced Preprocessing**: CLAHE + GFB colormap enhancement
- **Visualization**: 4-panel analysis with confidence scores
- **Supported Formats**: JPG, PNG, BMP, TIFF

### 🤖 RAG-Powered Medical Assistant
- **17,000+ Medical Q&A** knowledge base
- **Context-Aware Chat**: Patient-specific information retrieval
- **Multi-language**: English and Urdu support
- **LLM**: Google Gemini 2.0 Flash

### 📄 Professional Reports
- **Automated PDF Generation**: Medical-grade reports
- **AI-Generated Summaries**: Concise clinical insights
- **Integrated Visualizations**: XAI heatmaps and analysis
- **Patient History Tracking**: Complete analysis records

### 👥 Patient Management
- **Registration System**: Demographics and patient tracking
- **Report History**: All analyses linked to patient records
- **Multi-patient Support**: Manage multiple patients

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Docker** (for Qdrant vector database)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aunraza19/LungsCareAI.git
   cd LungsCareAI
   ```

2. **Download ML Models**
   
   Due to GitHub's file size limitations, download the models separately:
   
   - **Audio Model** (`final_model_ast (1).pt` - ~350MB)
   - **X-ray Model** (`final_model.keras` - ~100MB)
   
   **Download Instructions:**
   - See [MODELS.md](MODELS.md) for detailed download options
   - Upload to Google Drive, Hugging Face, or use Git LFS
   - Place both model files in the project root directory

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

4. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

5. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

6. **Start Qdrant Vector Database**
   ```bash
   docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
   ```

### Running the Application

**Option 1: Using the setup script** (Linux/Mac)
```bash
chmod +x run_webapp_demo.sh
./run_webapp_demo.sh
```

**Option 2: Manual start**

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - Qdrant:
```bash
docker run -p 6333:6333 qdrant/qdrant
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │   Home   │ Register │  Audio   │  X-ray   │   Chat   │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                     Backend (FastAPI)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Audio Analysis    │   X-ray Analysis   │   RAG Chat  │ │
│  │   (AST Model)      │   (Custom CNN)     │  (Gemini)   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Patient Manager │ Report Generator           │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  Models  │  │  Qdrant  │  │  Files   │
    │  (.pt,   │  │ Vector   │  │ (JSON,   │
    │ .keras)  │  │   DB     │  │  PDF)    │
    └──────────┘  └──────────┘  └──────────┘
```

---

## 📊 Tech Stack

### Backend
- **Framework**: FastAPI
- **ML**: PyTorch, TensorFlow/Keras, Transformers
- **RAG**: LangChain, Qdrant, SentenceTransformers
- **LLM**: Google Gemini 2.0 Flash
- **Image Processing**: OpenCV, Pillow
- **Audio Processing**: torchaudio, librosa
- **Reports**: ReportLab

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI**: Material-UI (MUI) v5
- **State**: React Query
- **Routing**: React Router v6
- **File Upload**: React Dropzone

### Database
- **Vector DB**: Qdrant
- **Patient Data**: JSON (upgradable to PostgreSQL)

---

## 📁 Project Structure

```
LungsCareAI/
├── backend/
│   ├── app.py                 # FastAPI server
│   ├── requirements.txt       # Python dependencies
│   ├── logo.png              # Report logo
│   └── patient_records.json  # Patient database
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/            # React pages
│   │   └── components/       # React components
│   ├── package.json
│   └── vite.config.ts
├── inf.py                     # Audio analysis module
├── xray_tools.py              # X-ray analysis module
├── rag.py                     # RAG system & reports
├── final_model_ast (1).pt     # Audio model (download separately)
├── final_model.keras          # X-ray model (download separately)
├── inv_class_indices.json     # X-ray class labels
├── medical_meadow_*.json      # Medical knowledge base
├── Green Fire Blue (1).lut    # X-ray colormap
├── .env.example               # Environment template
├── .gitignore
└── README.md
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Backend Configuration

- **Host**: 0.0.0.0
- **Port**: 8000
- **CORS**: Enabled for localhost:3000

### Frontend Configuration

- **Port**: 3000
- **Proxy**: API requests proxied to localhost:8000

---

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

**Patient Management**
- `POST /api/patients/register` - Register new patient
- `GET /api/patients` - List all patients

**Audio Analysis**
- `POST /api/analyze/audio/basic`
- `POST /api/analyze/audio/gradient`
- `POST /api/analyze/audio/attention`

**X-ray Analysis**
- `POST /api/analyze/xray/basic`
- `POST /api/analyze/xray/visualization`

**AI Chat**
- `POST /api/chat`

---

## 🎯 Usage

### 1. Register a Patient
Navigate to **Patient Registration** and fill in patient details.

### 2. Upload Medical Data
- Go to **Audio Analysis** or **X-ray Analysis**
- Select the patient from dropdown
- Upload audio file or X-ray image
- Choose analysis type

### 3. View Results
- Classification with confidence score
- Detailed medical analysis (RAG-powered)
- Download PDF report
- View XAI visualizations

### 4. Chat with AI
- Select patient (optional)
- Choose language
- Ask medical questions
- Get context-aware responses

### 5. Access Reports
- View all patient reports
- Download PDFs
- Access XAI visualizations

---

## 🧪 Testing

### Sample Data
Sample medical files are included in the `examples/` folder:
- **Audio**: `examples/H005_R4.wav`
- **X-ray**: `examples/covid00186.jpg`, `examples/fib.jpeg`, `examples/pn1.jpeg`, `examples/xray.jpeg`

### Test Workflow
1. Register a test patient
2. Analyze sample audio file
3. Analyze sample X-ray image
4. Check generated reports
5. Test chatbot with medical questions

---

## 🚨 Important Notes

### ⚠️ Medical Disclaimer
This system is for **research and educational purposes only**. It is NOT FDA approved and should NOT be used for actual medical diagnosis without oversight from qualified healthcare professionals.

### 🔒 Security Considerations
- **Production**: Implement authentication (JWT)
- **Data**: Encrypt sensitive patient information
- **Database**: Use PostgreSQL instead of JSON
- **Compliance**: Follow HIPAA/medical data regulations
- **API Keys**: Never commit .env file to version control

### 📦 Model Files
The ML models are not included in the repository due to size constraints. Download them separately:
- Audio Model: ~350MB
- X-ray Model: ~100MB

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript strict mode
- Add comments for complex logic
- Write unit tests for new features
- Update documentation

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **MIT AST Model** for audio analysis
- **Medical Meadow Dataset** for knowledge base
- **Google Gemini** for LLM capabilities
- **Qdrant** for vector database
- **LangChain** for RAG framework
- **Material-UI** for React components

---

## 📧 Contact

**Project Maintainer**: [@aunraza19](https://github.com/aunraza19)
- GitHub: [@aunraza19](https://github.com/aunraza19)
- Repository: [LungsCareAI](https://github.com/aunraza19/LungsCareAI)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time audio streaming analysis
- [ ] DICOM support
- [ ] Multi-user authentication
- [ ] Advanced analytics dashboard
- [ ] Treatment tracking
- [ ] Appointment scheduling
- [ ] Multi-language expansion
- [ ] Model fine-tuning interface
- [ ] Integration with EHR systems

---

## 📊 Performance

- **Audio Analysis**: ~3-5 seconds
- **X-ray Analysis**: ~2-4 seconds
- **Report Generation**: ~1-2 seconds
- **Chat Response**: ~2-3 seconds

### Optimizations
- Model caching for fast inference
- GPU acceleration support
- HNSW vector indexing
- Async processing

---

## 🐛 Known Issues

- Large model files require separate download
- Qdrant must be running before backend
- First analysis takes longer (model loading)
- Limited to English/Urdu languages

See [Issues](https://github.com/aunraza19/LungsCareAI/issues) for full list.

---

**Made with ❤️ for advancing AI in healthcare**

