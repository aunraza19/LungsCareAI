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

# New models for enhanced features
class SymptomCheckRequest(BaseModel):
    symptoms: List[str]
    duration: Optional[str] = None
    severity: Optional[str] = "moderate"  # mild, moderate, severe
    patient_number: Optional[str] = None

class SecondOpinionRequest(BaseModel):
    diagnosis: str
    confidence: float
    analysis_type: str  # "audio" or "xray"
    patient_number: Optional[str] = None

class HealthTipsRequest(BaseModel):
    category: Optional[str] = "general"  # general, lung_health, post_diagnosis
    condition: Optional[str] = None
    patient_number: Optional[str] = None

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

# Load sample data for demo
@app.post("/api/demo/load-sample-data")
async def load_sample_data():
    """Load sample patient data for demo purposes"""
    try:
        import shutil
        sample_file = "sample_patient_records.json"
        target_file = "patient_records.json"

        if os.path.exists(sample_file):
            shutil.copy(sample_file, target_file)
            return {"success": True, "message": "Sample data loaded successfully"}
        else:
            return {"success": False, "message": "Sample data file not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/demo/clear-data")
async def clear_demo_data():
    """Clear all patient data (for demo reset)"""
    try:
        with open("patient_records.json", "w") as f:
            json.dump({"counter": 100, "patients": []}, f, indent=2)
        return {"success": True, "message": "Data cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
            
            # Get detailed analysis for UI (conversational)
            detailed_analysis = rag_agent.process_audio_classification(result_json)
            
            # Generate clinical report text for PDF (formal, non-conversational)
            clinical_report_text = rag_agent.generate_clinical_report_text(
                result['label'], result['confidence'], "audio"
            )

            # Generate report with clinical text
            report_path = report_generator.generate_medical_report(
                patient_info, result['label'], clinical_report_text, file_path
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
            
            # Conversational response for UI
            detailed_analysis = rag_agent.process_audio_classification(
                json.dumps({
                    "label": result['label'],
                    "confidence": result['confidence'],
                    "classification_type": "lung_audio"
                })
            )
            
            # Clinical report text for PDF
            clinical_report_text = rag_agent.generate_clinical_report_text(
                result['label'], result['confidence'], "audio"
            )

            report_path = report_generator.generate_medical_report(
                patient_info, result['label'], clinical_report_text, file_path, result.get('visualization_saved')
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
            
            # Conversational response for UI
            detailed_analysis = rag_agent.process_audio_classification(
                json.dumps({
                    "label": result['label'],
                    "confidence": result['confidence'],
                    "classification_type": "lung_audio"
                })
            )
            
            # Clinical report text for PDF
            clinical_report_text = rag_agent.generate_clinical_report_text(
                result['label'], result['confidence'], "audio"
            )

            report_path = report_generator.generate_medical_report(
                patient_info, result['label'], clinical_report_text, file_path, result.get('visualization_saved')
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
            
            # Conversational response for UI
            detailed_analysis = rag_agent.process_xray_classification(result_json)
            
            # Clinical report text for PDF (formal, non-conversational)
            clinical_report_text = rag_agent.generate_clinical_report_text(
                result['label'], result.get('confidence', 0), "xray"
            )

            # Generate report with clinical text
            report_path = report_generator.generate_xray_report(
                patient_info, result['label'], clinical_report_text, file_path
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
            
            # Conversational response for UI
            detailed_analysis = rag_agent.process_xray_classification(
                json.dumps({
                    "label": result['label'],
                    "confidence": result['confidence'],
                    "classification_type": "chest_xray"
                })
            )
            
            # Clinical report text for PDF
            clinical_report_text = rag_agent.generate_clinical_report_text(
                result['label'], result['confidence'], "xray"
            )

            report_path = report_generator.generate_xray_report(
                patient_info, result['label'], clinical_report_text, file_path, result.get('visualization_saved')
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

# ═══════════════════════════════════════════════════════════
# UNIQUE FEATURES - Symptom Checker, Second Opinion, Health Tips
# ═══════════════════════════════════════════════════════════

@app.post("/api/symptom-checker")
async def check_symptoms(request: SymptomCheckRequest):
    """AI-powered symptom checker for respiratory conditions"""
    try:
        # Build symptom analysis prompt
        symptoms_str = ", ".join(request.symptoms)

        prompt = f"""You are MedGemma, an expert medical AI assistant specializing in respiratory health.

═══════════════════════════════════════════════════════════
🩺 SYMPTOM ANALYSIS REQUEST
═══════════════════════════════════════════════════════════
Reported Symptoms: {symptoms_str}
Duration: {request.duration or 'Not specified'}
Severity: {request.severity}

═══════════════════════════════════════════════════════════
📝 YOUR TASK
═══════════════════════════════════════════════════════════
Analyze these respiratory symptoms and provide:

⚠️ **Urgency Assessment**
Rate the urgency: 🟢 Low | 🟡 Moderate | 🔴 High | 🚨 Emergency
Explain why.

🔍 **Possible Conditions**
List 3-5 respiratory conditions that could cause these symptoms.
Format: **Condition** - Brief explanation of why it fits

📋 **Recommended Actions**
1. Immediate steps to take
2. When to see a doctor
3. Tests that might be helpful

💡 **Self-Care Tips**
Provide 3-4 safe home care suggestions while awaiting medical consultation.

🚨 **Warning Signs**
List symptoms that would require IMMEDIATE emergency care.

Be thorough but not alarmist. Focus on respiratory conditions.

⚕️ End with medical disclaimer.

RESPONSE:"""

        response = rag_agent.llm.invoke(prompt)
        if hasattr(response, 'content'):
            response_text = response.content
        else:
            response_text = str(response)

        # Determine urgency level from response
        urgency = "moderate"
        if "🔴" in response_text or "High" in response_text:
            urgency = "high"
        elif "🚨" in response_text or "Emergency" in response_text:
            urgency = "emergency"
        elif "🟢" in response_text or "Low" in response_text:
            urgency = "low"

        return {
            "success": True,
            "analysis": response_text,
            "urgency": urgency,
            "symptoms_analyzed": request.symptoms
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/second-opinion")
async def get_second_opinion(request: SecondOpinionRequest):
    """Generate AI second opinion with differential diagnoses"""
    try:
        analysis_type_label = "lung audio" if request.analysis_type == "audio" else "chest X-ray"

        prompt = f"""You are MedGemma providing a clinical second opinion analysis.

═══════════════════════════════════════════════════════════
📊 PRIMARY DIAGNOSIS
═══════════════════════════════════════════════════════════
Analysis Type: {analysis_type_label}
Primary Diagnosis: {request.diagnosis}
AI Confidence: {request.confidence}%

═══════════════════════════════════════════════════════════
📝 YOUR TASK
═══════════════════════════════════════════════════════════
Provide a thoughtful second opinion considering:

🧠 **Clinical Consideration**
Provide a 2-3 sentence alternative perspective or confirmation of the diagnosis.
Consider factors that might affect accuracy.

🔄 **Differential Diagnoses**
List 3 alternative conditions to consider:
1. **Condition** - One-line clinical rationale
2. **Condition** - One-line clinical rationale  
3. **Condition** - One-line clinical rationale

📊 **Confidence Assessment**
- Is the {request.confidence}% confidence appropriate?
- What factors support or challenge this confidence?

🔬 **Suggested Confirmatory Tests**
List 2-3 tests that could confirm or rule out the diagnosis.

💡 **Clinical Pearls**
Provide 1-2 key clinical insights about this diagnosis.

Keep response concise and clinically relevant.

RESPONSE:"""

        response = rag_agent.llm.invoke(prompt)
        if hasattr(response, 'content'):
            response_text = response.content
        else:
            response_text = str(response)

        # Parse key elements for structured response
        return {
            "success": True,
            "primary_diagnosis": request.diagnosis,
            "confidence": request.confidence,
            "second_opinion": response_text,
            "analysis_type": request.analysis_type
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/health-tips")
async def get_health_tips(request: HealthTipsRequest):
    """Get personalized health tips based on category or condition"""
    try:
        # Customize prompt based on request
        if request.condition:
            topic = f"managing {request.condition}"
        elif request.category == "lung_health":
            topic = "maintaining optimal lung health"
        elif request.category == "post_diagnosis":
            topic = "recovery and health maintenance after respiratory diagnosis"
        else:
            topic = "general respiratory wellness"

        prompt = f"""You are MedGemma, providing expert health advice.

═══════════════════════════════════════════════════════════
💡 HEALTH TIPS REQUEST
═══════════════════════════════════════════════════════════
Topic: {topic}
Category: {request.category}
{f"Specific Condition: {request.condition}" if request.condition else ""}

═══════════════════════════════════════════════════════════
📝 YOUR TASK
═══════════════════════════════════════════════════════════
Provide practical, evidence-based health tips:

🫁 **Daily Habits for Lung Health**
List 5 daily practices with brief explanations.

🏃 **Exercise Recommendations**
- Breathing exercises (describe 2-3)
- Physical activity suggestions
- Precautions if any

🍎 **Nutrition Tips**
Foods and nutrients that support respiratory health.

🏠 **Environmental Factors**
- Indoor air quality tips
- Allergen reduction
- Humidity management

⚠️ **Things to Avoid**
List 4-5 things harmful to respiratory health.

📅 **Monitoring Your Health**
- Symptoms to track
- When to seek medical attention
- Recommended checkup frequency

Make tips practical and actionable. Use emojis for visual appeal.

⚕️ End with: "These are general wellness tips. Consult your doctor for personalized advice."

RESPONSE:"""

        response = rag_agent.llm.invoke(prompt)
        if hasattr(response, 'content'):
            response_text = response.content
        else:
            response_text = str(response)

        return {
            "success": True,
            "category": request.category,
            "condition": request.condition,
            "tips": response_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/quick-info/{topic}")
async def get_quick_info(topic: str):
    """Get quick medical information on common topics"""

    # Predefined quick info topics
    quick_topics = {
        "breathing-exercises": "breathing exercises for lung health",
        "pneumonia": "pneumonia symptoms prevention treatment",
        "covid": "COVID-19 symptoms prevention recovery",
        "asthma": "asthma management triggers treatment",
        "copd": "COPD chronic obstructive pulmonary disease",
        "tuberculosis": "tuberculosis TB symptoms treatment",
        "smoking-cessation": "quit smoking lung health recovery",
        "air-quality": "indoor air quality respiratory health"
    }

    if topic.lower() not in quick_topics:
        return {
            "success": False,
            "error": "Topic not found",
            "available_topics": list(quick_topics.keys())
        }

    try:
        query = quick_topics[topic.lower()]

        # Get relevant docs from RAG
        docs = rag_agent.retriever.invoke(query)
        context = "\n".join([doc.page_content for doc in docs[:3]])

        prompt = f"""You are MedGemma providing quick medical information.

Topic: {query}

Context from medical knowledge base:
{context}

Provide a concise, informative response about {query}:
- Use bullet points for key facts
- Include 3-4 most important points
- Keep it under 200 words
- Add one practical tip
- End with a brief disclaimer

RESPONSE:"""

        response = rag_agent.llm.invoke(prompt)
        if hasattr(response, 'content'):
            response_text = response.content
        else:
            response_text = str(response)

        return {
            "success": True,
            "topic": topic,
            "info": response_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
