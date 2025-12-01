#!/usr/bin/env python3
"""
FastAPI Backend for LUNGSCAREAI Web Application
Integrates with existing audio analysis, X-ray tools, and RAG system
"""

# Suppress multiprocessing resource tracker warnings
import warnings
import multiprocessing
warnings.filterwarnings("ignore", message=".*resource_tracker.*", category=UserWarning)

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
from contextlib import asynccontextmanager
import os
import shutil
import uuid
import json
from datetime import datetime

# Add parent directory to path for imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our existing modules
from inf import AudioClassificationTool, AudioGradientXAITool, AudioAttentionXAITool
from xray_tools import XrayClassificationTool, XrayVisualizationTool
from rag import MedicalRAGAgent, PatientManager, MedicalReportGenerator

# Global variables for components
rag_agent = None
patient_manager = None
report_generator = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global rag_agent, patient_manager, report_generator
    print("🚀 Initializing LUNGSCAREAI Backend...")
    
    try:
        # Initialize components
        rag_agent = MedicalRAGAgent()
        patient_manager = PatientManager()
        report_generator = MedicalReportGenerator()
        print("✅ All components initialized successfully!")
    except Exception as e:
        print(f"❌ Initialization error: {e}")
        
    yield
    
    # Shutdown
    print("🔄 Shutting down LUNGSCAREAI Backend...")
    
    # Clean up resources
    try:
        # Force cleanup of multiprocessing resources
        for p in multiprocessing.active_children():
            p.terminate()
            p.join()
        print("✅ Resources cleaned up successfully!")
    except Exception as e:
        print(f"⚠️ Cleanup warning: {e}")

app = FastAPI(
    title="LUNGSCAREAI API",
    description="AI-Powered Lung Analysis System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)
os.makedirs("reports", exist_ok=True)

# Initialize global components
rag_agent = None
patient_manager = None
report_generator = None

# Pydantic models for API
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    area: str
    address: str

class PatientResponse(BaseModel):
    name: str
    age: int
    gender: str
    area: str
    address: str
    patient_number: str
    registration_date: str

class AnalysisResponse(BaseModel):
    success: bool
    result: dict
    detailed_analysis: Optional[str] = None
    report_path: Optional[str] = None
    visualization_path: Optional[str] = None

class ChatMessage(BaseModel):
    id: str
    type: str
    content: str
    timestamp: str

class QuestionRequest(BaseModel):
    question: str
    language: Optional[str] = "english"
    patient_number: Optional[str] = None
    chat_history: Optional[List[ChatMessage]] = None

# Components are now initialized in the lifespan handler above

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Patient Management Endpoints
@app.post("/api/patients/register", response_model=PatientResponse)
async def register_patient(patient_data: PatientCreate):
    """Register a new patient"""
    try:
        # Create patient info
        patient_counter = patient_manager.load_patient_counter()
        patient_counter += 1
        patient_number = f"PN{patient_counter}"
        
        patient_info = {
            'name': patient_data.name,
            'age': patient_data.age,
            'gender': patient_data.gender,
            'area': patient_data.area,
            'address': patient_data.address,
            'patient_number': patient_number,
            'registration_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'reports': []
        }
        
        # Set the counter before saving
        patient_manager.patient_counter = patient_counter
        patient_manager.save_patient_data(patient_info)
        
        return PatientResponse(**patient_info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/patients")
async def get_patients():
    """Get all registered patients"""
    try:
        with open("patient_records.json", "r") as f:
            data = json.load(f)
        
        # Handle both old format (direct array) and new format (with patients key)
        if isinstance(data, list):
            patients = data
        else:
            patients = data.get("patients", [])
            
        return {"patients": patients}
    except FileNotFoundError:
        return {"patients": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Audio Analysis Endpoints
@app.post("/api/analyze/audio/basic")
async def analyze_audio_basic(
    file: UploadFile = File(...),
    patient_number: str = Form(...)
):
    """Basic audio analysis"""
    return await _process_audio_analysis(file, patient_number, "basic")

@app.post("/api/analyze/audio/gradient")
async def analyze_audio_gradient(
    file: UploadFile = File(...),
    patient_number: str = Form(...)
):
    """Audio analysis with gradient XAI"""
    return await _process_audio_analysis(file, patient_number, "gradient")

@app.post("/api/analyze/audio/attention")
async def analyze_audio_attention(
    file: UploadFile = File(...),
    patient_number: str = Form(...)
):
    """Audio analysis with attention XAI"""
    return await _process_audio_analysis(file, patient_number, "attention")

async def _process_audio_analysis(file: UploadFile, patient_number: str, analysis_type: str):
    """Common audio analysis processing"""
    if not file.filename.lower().endswith(('.wav', '.mp3', '.m4a', '.flac')):
        raise HTTPException(status_code=400, detail="Invalid audio file format")
    
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        file_path = f"uploads/{file_id}{file_extension}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get patient info
        patient_info = _get_patient_info(patient_number)
        
        # Perform analysis based on type
        if analysis_type == "basic":
            tool = AudioClassificationTool()
            result_json = tool._run(file_path)
            result = json.loads(result_json)
            
            # Get detailed analysis from RAG
            detailed_analysis = rag_agent.process_audio_classification(result_json)
            
            # Generate report
            report_path = report_generator.generate_medical_report(
                patient_info, result['label'], detailed_analysis, file_path
            )
            
            # Add report to patient record
            report_info = {
                'type': 'Audio Analysis (Basic)',
                'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'result': result['label'],
                'confidence': result['confidence'],
                'report_path': report_path,
                'file_name': file.filename
            }
            _add_report_to_patient(patient_number, report_info)
            
            return AnalysisResponse(
                success=True,
                result=result,
                detailed_analysis=detailed_analysis,
                report_path=report_path
            )
        
        elif analysis_type == "gradient":
            tool = AudioGradientXAITool()
            result_json = tool._run(file_path)
            result = json.loads(result_json)
            
            detailed_analysis = rag_agent.process_audio_classification(
                json.dumps({
                    "label": result['label'],
                    "confidence": result['confidence'],
                    "classification_type": "lung_audio"
                })
            )
            
            report_path = report_generator.generate_medical_report(
                patient_info, result['label'], detailed_analysis, file_path, result.get('visualization_saved')
            )
            
            # Add report to patient record
            report_info = {
                'type': 'Audio Analysis (Gradient XAI)',
                'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'result': result['label'],
                'confidence': result['confidence'],
                'report_path': report_path,
                'visualization_path': result.get('visualization_saved'),
                'file_name': file.filename
            }
            _add_report_to_patient(patient_number, report_info)
            
            return AnalysisResponse(
                success=True,
                result=result,
                detailed_analysis=detailed_analysis,
                report_path=report_path,
                visualization_path=result.get('visualization_saved')
            )
        
        elif analysis_type == "attention":
            tool = AudioAttentionXAITool()
            result_json = tool._run(file_path)
            result = json.loads(result_json)
            
            detailed_analysis = rag_agent.process_audio_classification(
                json.dumps({
                    "label": result['label'],
                    "confidence": result['confidence'],
                    "classification_type": "lung_audio"
                })
            )
            
            report_path = report_generator.generate_medical_report(
                patient_info, result['label'], detailed_analysis, file_path, result.get('visualization_saved')
            )
            
            # Add report to patient record
            report_info = {
                'type': 'Audio Analysis (Attention XAI)',
                'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'result': result['label'],
                'confidence': result['confidence'],
                'report_path': report_path,
                'visualization_path': result.get('visualization_saved'),
                'file_name': file.filename
            }
            _add_report_to_patient(patient_number, report_info)
            
            return AnalysisResponse(
                success=True,
                result=result,
                detailed_analysis=detailed_analysis,
                report_path=report_path,
                visualization_path=result.get('visualization_saved')
            )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

# X-ray Analysis Endpoints
@app.post("/api/analyze/xray/basic")
async def analyze_xray_basic(
    file: UploadFile = File(...),
    patient_number: str = Form(...)
):
    """Basic X-ray analysis"""
    return await _process_xray_analysis(file, patient_number, "basic")

@app.post("/api/analyze/xray/visualization")
async def analyze_xray_visualization(
    file: UploadFile = File(...),
    patient_number: str = Form(...)
):
    """X-ray analysis with visualization"""
    return await _process_xray_analysis(file, patient_number, "visualization")

async def _process_xray_analysis(file: UploadFile, patient_number: str, analysis_type: str):
    """Common X-ray analysis processing"""
    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff')):
        raise HTTPException(status_code=400, detail="Invalid image file format")
    
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        file_path = f"uploads/{file_id}{file_extension}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get patient info
        patient_info = _get_patient_info(patient_number)
        
        # Perform analysis based on type
        if analysis_type == "basic":
            tool = XrayClassificationTool()
            result_json = tool._run(file_path)
            result = json.loads(result_json)
            
            # Get detailed analysis from RAG
            detailed_analysis = rag_agent.process_xray_classification(result_json)
            
            # Generate report
            report_path = report_generator.generate_xray_report(
                patient_info, result['label'], detailed_analysis, file_path
            )
            
            # Add report to patient record
            report_info = {
                'type': 'X-ray Analysis (Basic)',
                'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'result': result['label'],
                'confidence': result.get('confidence', 0),
                'report_path': report_path,
                'file_name': file.filename
            }
            _add_report_to_patient(patient_number, report_info)
            
            return AnalysisResponse(
                success=True,
                result=result,
                detailed_analysis=detailed_analysis,
                report_path=report_path
            )
        
        elif analysis_type == "visualization":
            tool = XrayVisualizationTool()
            result_json = tool._run(file_path)
            result = json.loads(result_json)
            
            detailed_analysis = rag_agent.process_xray_classification(
                json.dumps({
                    "label": result['label'],
                    "confidence": result['confidence'],
                    "classification_type": "chest_xray"
                })
            )
            
            report_path = report_generator.generate_xray_report(
                patient_info, result['label'], detailed_analysis, file_path, result.get('visualization_saved')
            )
            
            # Add report to patient record
            report_info = {
                'type': 'X-ray Analysis (Visualization)',
                'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'result': result['label'],
                'confidence': result.get('confidence', 0),
                'report_path': report_path,
                'visualization_path': result.get('visualization_saved'),
                'file_name': file.filename
            }
            _add_report_to_patient(patient_number, report_info)
            
            return AnalysisResponse(
                success=True,
                result=result,
                detailed_analysis=detailed_analysis,
                report_path=report_path,
                visualization_path=result.get('visualization_saved')
            )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

# General Q&A Endpoint
@app.post("/api/chat")
async def chat_with_system(request: QuestionRequest):
    """Chat with the medical AI system with patient context and chat history"""
    try:
        patient_info = None
        patient_reports_context = ""
        
        # Get patient context if provided
        if request.patient_number:
            try:
                patient_info = _get_patient_info(request.patient_number)
                patient_reports_context = _get_patient_reports_context(patient_info)
            except:
                # Continue without patient context if not found
                pass
        
        # Prepare chat history context
        chat_context = ""
        if request.chat_history and len(request.chat_history) > 0:
            chat_context = "\n\nPrevious conversation:\n"
            for msg in request.chat_history[-6:]:  # Use last 6 messages for context
                role = "Human" if msg.type == "user" else "Assistant"
                chat_context += f"{role}: {msg.content}\n"
        
        # Get response with full context
        response = rag_agent.answer_question_with_context(
            question=request.question,
            language=request.language,
            patient_info=patient_info,
            patient_reports_context=patient_reports_context,
            chat_context=chat_context
        )
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# File Download Endpoints
@app.get("/api/download/report/{filename}")
async def download_report(filename: str):
    """Download generated PDF reports"""
    file_path = f"reports/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(file_path, filename=filename)

@app.get("/api/download/visualization/{filename}")
async def download_visualization(filename: str):
    """Download visualization images"""
    file_path = f"outputs/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Visualization not found")
    return FileResponse(file_path, filename=filename)

# Static file serving for visualizations and reports
app.mount("/static/outputs", StaticFiles(directory="outputs"), name="outputs")
app.mount("/static/reports", StaticFiles(directory="reports"), name="reports")

# Helper functions
def _get_patient_info(patient_number: str) -> dict:
    """Get patient information by patient number"""
    try:
        with open("patient_records.json", "r") as f:
            data = json.load(f)
        
        # Handle both old format (direct array) and new format (with patients key)
        if isinstance(data, list):
            patients = data
        else:
            patients = data.get("patients", [])
        
        for patient in patients:
            if patient['patient_number'] == patient_number:
                return patient
        
        raise HTTPException(status_code=404, detail="Patient not found")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="No patients registered")

def _add_report_to_patient(patient_number: str, report_info: dict):
    """Add report information to patient record"""
    try:
        with open("patient_records.json", "r") as f:
            data = json.load(f)
        
        # Handle both old format (direct array) and new format (with patients key)
        if isinstance(data, list):
            patients = data
            counter = 100  # default counter
        else:
            patients = data.get("patients", [])
            counter = data.get("counter", 100)
        
        # Find and update the patient
        for patient in patients:
            if patient['patient_number'] == patient_number:
                if 'reports' not in patient:
                    patient['reports'] = []
                patient['reports'].append(report_info)
                break
        
        # Save updated data
        with open("patient_records.json", "w") as f:
            if isinstance(data, list):
                json.dump(patients, f, indent=2)
            else:
                json.dump({
                    'counter': counter,
                    'patients': patients
                }, f, indent=2)
                
    except Exception as e:
        print(f"Error adding report to patient: {e}")

def _get_patient_reports_context(patient_info: dict) -> str:
    """Extract patient reports context for AI chat"""
    try:
        context = f"\nPatient Information:\n"
        context += f"Name: {patient_info['name']}\n"
        context += f"Age: {patient_info.get('age', 'N/A')}\n"
        context += f"Gender: {patient_info.get('gender', 'N/A')}\n"
        context += f"Area: {patient_info.get('area', 'N/A')}\n"
        
        reports = patient_info.get('reports', [])
        if reports:
            context += f"\nMedical Reports Summary ({len(reports)} reports):\n"
            for i, report in enumerate(reports, 1):
                context += f"\nReport {i} ({report.get('date', 'No date')}):\n"
                context += f"- Type: {report.get('type', 'Unknown')}\n"
                context += f"- Result: {report.get('result', 'No result')}\n"
                if 'confidence' in report:
                    context += f"- Confidence: {report['confidence']}%\n"
                if 'file_name' in report:
                    context += f"- File: {report['file_name']}\n"
        else:
            context += "\nNo medical reports available for this patient.\n"
        
        return context
    except Exception as e:
        print(f"Error getting patient reports context: {e}")
        return f"\nPatient: {patient_info.get('name', 'Unknown')}\nNo additional context available.\n"

if __name__ == "__main__":
    import uvicorn
    print("🏥 Starting LUNGSCAREAI Backend Server...")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
