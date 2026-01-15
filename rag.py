from langchain_community.document_loaders import JSONLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Qdrant
from langchain.agents import initialize_agent, AgentType, Tool
import google.generativeai as genai
import os
from dotenv import load_dotenv
from inf import AudioClassificationTool, AudioGradientXAITool, AudioAttentionXAITool  # Fixed import
from xray_tools import XrayClassificationTool, XrayVisualizationTool
import json
import os
from qdrant_client import QdrantClient
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from datetime import datetime

class PatientManager:
    def __init__(self):
        self.patient_file = "patient_records.json"
        self.patient_counter = self.load_patient_counter()
    
    def load_patient_counter(self):
        """Load the patient counter from file"""
        try:
            if os.path.exists(self.patient_file):
                with open(self.patient_file, 'r') as f:
                    data = json.load(f)
                    return data.get('counter', 100)
            return 100
        except:
            return 100
    
    def save_patient_data(self, patient_info):
        """Save patient data to file"""
        try:
            patients = []
            if os.path.exists(self.patient_file):
                with open(self.patient_file, 'r') as f:
                    data = json.load(f)
                    patients = data.get('patients', [])
            
            patients.append(patient_info)
            
            with open(self.patient_file, 'w') as f:
                json.dump({
                    'counter': self.patient_counter,
                    'patients': patients
                }, f, indent=2)
        except Exception as e:
            print(f"Error saving patient data: {e}")
    
    def register_patient(self):
        """Register a new patient"""
        print("\n" + "="*60)
        print("🏥 LUNGSCAREAI - PATIENT REGISTRATION")
        print("="*60)
        
        # Patient Name
        patient_name = input("📝 Enter Patient Name: ").strip()
        while not patient_name:
            patient_name = input("❌ Name cannot be empty. Please enter Patient Name: ").strip()
        
        # Age
        while True:
            try:
                age = input("🎂 Enter Age: ").strip()
                if not age:
                    print("❌ Age cannot be empty.")
                    continue
                age = int(age)
                if age < 0 or age > 150:
                    print("❌ Please enter a valid age (0-150).")
                    continue
                break
            except ValueError:
                print("❌ Please enter a valid number for age.")
        
        # Gender
        while True:
            gender = input("👤 Enter Gender (M/F/Other): ").strip().upper()
            if gender in ['M', 'F', 'MALE', 'FEMALE', 'OTHER']:
                if gender == 'M':
                    gender = 'Male'
                elif gender == 'F':
                    gender = 'Female'
                elif gender == 'MALE':
                    gender = 'Male'
                elif gender == 'FEMALE':
                    gender = 'Female'
                else:
                    gender = 'Other'
                break
            else:
                print("❌ Please enter M (Male), F (Female), or Other.")
        
        # Area
        area = input("🏘️ Enter Area/City: ").strip()
        while not area:
            area = input("❌ Area cannot be empty. Please enter Area/City: ").strip()
        
        # Address
        address = input("🏠 Enter Full Address: ").strip()
        while not address:
            address = input("❌ Address cannot be empty. Please enter Full Address: ").strip()
        
        # Generate patient number
        self.patient_counter += 1
        patient_number = f"PN{self.patient_counter}"
        
        patient_info = {
            'name': patient_name,
            'age': age,
            'gender': gender,
            'area': area,
            'address': address,
            'patient_number': patient_number,
            'registration_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'reports': []
        }
        
        self.save_patient_data(patient_info)
        
        print(f"\n✅ Patient Registered Successfully!")
        print(f"👤 Patient Name: {patient_name}")
        print(f"� Age: {age}")
        print(f"👥 Gender: {gender}")
        print(f"🏘️ Area: {area}")
        print(f"🏠 Address: {address}")
        print(f"�🆔 Patient Number: {patient_number}")
        print(f"📅 Registration Date: {patient_info['registration_date']}")
        print("="*60)
        
        return patient_info

class MedicalReportGenerator:
    def __init__(self):
        self.setup_styles()
    
    def setup_styles(self):
        """Setup document styles"""
        self.styles = getSampleStyleSheet()
        
        # Custom styles
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        self.header_style = ParagraphStyle(
            'CustomHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.darkblue
        )
        
        self.body_style = ParagraphStyle(
            'CustomBody',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            leftIndent=20
        )

    def _create_enhanced_classification_summary(self, classification_result, detailed_analysis, analysis_type="Audio"):
        """Generate a professional clinical summary for medical reports"""
        try:
            # Create a prompt for clinical report-style summary
            summary_prompt = f"""You are a medical report writer. Generate a professional clinical summary for a formal medical report.

CLASSIFICATION RESULT: {classification_result}
ANALYSIS TYPE: {analysis_type}

DETAILED ANALYSIS:
{detailed_analysis}

INSTRUCTIONS:
Write a formal 3-4 sentence clinical summary suitable for a medical report. Requirements:
- Use formal medical terminology and third-person perspective
- State the primary finding and its clinical significance
- Include relevant clinical recommendations
- Do NOT use conversational language, emojis, or bullet points
- Do NOT address the patient directly (no "you" or "your")
- Write as if for a physician reviewing the report
- Keep it concise and professional

Example format:
"The [analysis type] examination revealed [finding]. This finding is consistent with [clinical interpretation]. Clinical correlation with [relevant tests/symptoms] is recommended. Follow-up evaluation is advised [timeframe/conditions]."

CLINICAL SUMMARY:"""

            # Get summary from LLM
            if hasattr(self, 'llm') and self.llm:
                summary = self.llm.invoke(summary_prompt)
                if hasattr(summary, 'content'):
                    summary = summary.content
                else:
                    summary = str(summary)
            else:
                raise Exception("LLM not available")

            # Clean up - remove any conversational elements
            summary = summary.strip()
            summary = summary.replace("I ", "").replace("you ", "the patient ")
            summary = summary.replace("You ", "The patient ").replace("your ", "the patient's ")

            if len(summary) > 600:
                summary = summary[:597] + "..."

            return summary
            
        except Exception as e:
            # Professional fallback
            analysis_prefix = "audio auscultation" if analysis_type == "Audio" else "chest radiograph"
            return (f"The {analysis_prefix} analysis demonstrated findings classified as {classification_result}. "
                   f"Clinical correlation with patient symptoms and history is recommended. "
                   f"Further evaluation by a qualified healthcare provider is advised for definitive diagnosis and management.")

    def generate_medical_report(self, patient_info, classification_result, detailed_analysis, audio_file_path, visualization_path=None):
        """Generate a professional medical report PDF with detailed analysis"""
        # Create reports directory
        os.makedirs("reports", exist_ok=True)
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"reports/{patient_info['patient_number']}_{timestamp}_LungReport.pdf"
        
        # Create PDF document
        doc = SimpleDocTemplate(filename, pagesize=A4, topMargin=1*inch)
        story = []
        
        # Use relative path from backend directory
        logo_path = os.path.join(os.path.dirname(__file__), "backend", "logo.png")
        # Fallback to current directory
        if not os.path.exists(logo_path):
            logo_path = os.path.join(os.path.dirname(__file__), "logo.png")

        if os.path.exists(logo_path):
            try:
                # Add logo centered
                logo_table = Table([[Image(logo_path, width=1.5*inch, height=1.5*inch)]], colWidths=[6*inch])
                logo_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
                ]))
                story.append(logo_table)
                story.append(Spacer(1, 0.2*inch))
            except Exception as e:
                # Fallback if logo can't be loaded
                print(f"Could not load logo: {e}")
        
        # Title
        title = Paragraph("LUNGSCAREAI", self.title_style)
        story.append(title)
        story.append(Spacer(1, 0.3*inch))
        
        # Patient Information Table
        patient_data = [
            ["MEDICAL LUNG ANALYSIS REPORT", ""],
            ["", ""],
            ["Patient Name:", patient_info['name']],
            ["Age:", str(patient_info.get('age', 'N/A'))],
            ["Gender:", patient_info.get('gender', 'N/A')],
            ["Area:", patient_info.get('area', 'N/A')],
            ["Address:", patient_info.get('address', 'N/A')],
            ["Patient Number:", patient_info['patient_number']],
            ["Report Date:", datetime.now().strftime("%B %d, %Y")],
            ["Report Time:", datetime.now().strftime("%I:%M %p")],
            ["Audio File:", os.path.basename(audio_file_path)],
        ]
        
        patient_table = Table(patient_data, colWidths=[2*inch, 3*inch])
        patient_table.setStyle(TableStyle([
            ('SPAN', (0, 0), (1, 0)),  # Merge first row
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (1, 0), 16),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.darkblue),
            ('BOTTOMPADDING', (0, 0), (1, 0), 12),
            
            ('FONTNAME', (0, 2), (0, 10), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 2), (1, 10), 12),
            ('ALIGN', (0, 2), (0, 10), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 2), (1, 10), 1, colors.lightgrey),
            ('BACKGROUND', (0, 2), (0, 10), colors.lightblue),
        ]))
        
        story.append(patient_table)
        story.append(Spacer(1, 0.4*inch))
        
        # Add Visualization Section if available
        if visualization_path and os.path.exists(visualization_path):
            viz_header = Paragraph("VISUALIZATION ANALYSIS", self.header_style)
            story.append(viz_header)
            story.append(Spacer(1, 0.1*inch))
            
            # Add visualization image
            try:
                # Calculate appropriate image size (max width 6 inches)
                img = Image(visualization_path, width=6*inch, height=4*inch)
                story.append(img)
                story.append(Spacer(1, 0.1*inch))
                
                # Add visualization description
                viz_desc = Paragraph(
                    "<b>XAI Visualization:</b> This image shows the AI model's attention patterns and gradient analysis "
                    "highlighting the most important audio features that contributed to the classification decision. "
                    "Brighter regions indicate areas of higher significance in the analysis.",
                    self.body_style
                )
                story.append(viz_desc)
                story.append(Spacer(1, 0.3*inch))
                
            except Exception as e:
                viz_error = Paragraph(f"<b>Visualization Note:</b> Image could not be loaded ({str(e)})", self.body_style)
                story.append(viz_error)
                story.append(Spacer(1, 0.2*inch))
        
        # Analysis Results Header
        analysis_header = Paragraph("LUNG AUDIO ANALYSIS RESULTS", self.header_style)
        story.append(analysis_header)
        story.append(Spacer(1, 0.2*inch))
        
        # Detailed Analysis - Format the detailed analysis for PDF
        detailed_text = self._format_analysis_for_pdf(detailed_analysis)
        detailed_para = Paragraph(detailed_text, self.body_style)
        story.append(detailed_para)
        story.append(Spacer(1, 0.3*inch))
        
        # Summary Classification
        summary_header = Paragraph("CLASSIFICATION SUMMARY", self.header_style)
        story.append(summary_header)
        story.append(Spacer(1, 0.1*inch))
        
        # Enhanced classification summary
        enhanced_summary = self._create_enhanced_classification_summary(classification_result, detailed_analysis, "Audio")
        result_text = f"<b>Final Classification:</b> {classification_result}<br/><br/>{enhanced_summary}"
        result_para = Paragraph(result_text, self.body_style)
        story.append(result_para)
        story.append(Spacer(1, 0.3*inch))
        
        # Disclaimer
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.red,
            leftIndent=20,
            rightIndent=20,
            spaceAfter=12
        )
        
        disclaimer_text = "<b>MEDICAL DISCLAIMER:</b> This report is generated by an AI system for preliminary analysis only. It does not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for proper medical evaluation and treatment decisions."
        disclaimer_para = Paragraph(disclaimer_text, disclaimer_style)
        story.append(disclaimer_para)
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        
        story.append(Spacer(1, 0.5*inch))
        footer_text = f"Generated by LUNGSCAREAI System | Report ID: {patient_info['patient_number']}_{timestamp}"
        footer_para = Paragraph(footer_text, footer_style)
        story.append(footer_para)
        
        # Build PDF
        doc.build(story)
        
        return filename
    
    def _format_analysis_for_pdf(self, analysis_text):
        """Format analysis text for PDF with proper HTML"""
        if not analysis_text:
            return "No detailed analysis available."
        
        # Clean and format the text properly
        lines = analysis_text.split('\n')
        formatted_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Format differential diagnosis bullet points
            if line.startswith('*   **') and ':**' in line:
                # Extract condition and rationale
                parts = line.split(':**', 1)
                condition = parts[0].replace('*   **', '')
                rationale = parts[1].strip() if len(parts) > 1 else ''
                formatted_line = f"• <b>{condition}:</b> {rationale}"
                formatted_lines.append(formatted_line)
            
            # Format section headers
            elif line.startswith('**') and line.endswith('**'):
                header = line.replace('**', '')
                # Remove emojis from headers
                header = self._remove_emojis(header)
                formatted_lines.append(f"<br/><b>{header}</b><br/>")
            
            # Format regular bullet points
            elif line.startswith('*   '):
                bullet_text = line.replace('*   ', '')
                formatted_lines.append(f"• {bullet_text}")
            
            # Handle other text
            else:
                # Clean up any remaining markdown and emojis
                clean_line = line.replace('**', '').replace('*', '')
                clean_line = self._remove_emojis(clean_line)
                # Remove conversational phrases
                clean_line = self._make_clinical(clean_line)
                if clean_line.strip():
                    formatted_lines.append(clean_line)
        
        return '<br/>'.join(formatted_lines)

    def _remove_emojis(self, text):
        """Remove emojis from text for professional reports"""
        import re
        # Remove common emoji patterns
        emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            u"\U0001f926-\U0001f937"
            u"\U0001F1F2-\U0001F1F4"
            u"\U0001F620-\U0001F629"
            u"\U0001F4A0-\U0001F4FF"
            u"\u200d"
            u"\u2640-\u2642"
            u"\u2600-\u2B55"
            u"\u23cf"
            u"\u23e9"
            u"\u231a"
            u"\ufe0f"
            u"\u3030"
            "]+", flags=re.UNICODE)
        return emoji_pattern.sub('', text).strip()

    def _make_clinical(self, text):
        """Convert conversational text to clinical language"""
        # Replace conversational phrases with clinical alternatives
        replacements = {
            "you should": "it is recommended to",
            "You should": "It is recommended to",
            "you need": "the patient requires",
            "You need": "The patient requires",
            "your doctor": "the treating physician",
            "Your doctor": "The treating physician",
            "your lungs": "the patient's lungs",
            "Your lungs": "The patient's lungs",
            "you have": "the patient has",
            "You have": "The patient has",
            "you are": "the patient is",
            "You are": "The patient is",
            "Great news!": "Findings:",
            "Good news!": "Findings:",
            "I recommend": "It is recommended",
            "I suggest": "It is suggested",
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text

    def generate_xray_report(self, patient_info, classification_result, detailed_analysis, xray_file_path, visualization_path=None):
        """Generate a professional X-ray analysis PDF report with detailed analysis"""
        # Create reports directory
        os.makedirs("reports", exist_ok=True)
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"reports/{patient_info['patient_number']}_{timestamp}_XrayReport.pdf"
        
        # Create PDF document
        doc = SimpleDocTemplate(filename, pagesize=A4, topMargin=1*inch)
        story = []
        
        # Use relative path from backend directory
        logo_path = os.path.join(os.path.dirname(__file__), "backend", "logo.png")
        # Fallback to current directory
        if not os.path.exists(logo_path):
            logo_path = os.path.join(os.path.dirname(__file__), "logo.png")

        if os.path.exists(logo_path):
            try:
                # Add logo centered
                logo_table = Table([[Image(logo_path, width=1.5*inch, height=1.5*inch)]], colWidths=[6*inch])
                logo_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
                ]))
                story.append(logo_table)
                story.append(Spacer(1, 0.2*inch))
            except Exception as e:
                # Fallback if logo can't be loaded
                print(f"Could not load logo: {e}")
        
        
        # Title
        title = Paragraph("LUNGSCAREAI", self.title_style)
        story.append(title)
        story.append(Spacer(1, 0.3*inch))
        
        # Patient Information Table
        patient_data = [
            ["CHEST X-RAY ANALYSIS REPORT", ""],
            ["", ""],
            ["Patient Name:", patient_info['name']],
            ["Age:", str(patient_info.get('age', 'N/A'))],
            ["Gender:", patient_info.get('gender', 'N/A')],
            ["Area:", patient_info.get('area', 'N/A')],
            ["Address:", patient_info.get('address', 'N/A')],
            ["Patient Number:", patient_info['patient_number']],
            ["Report Date:", datetime.now().strftime("%B %d, %Y")],
            ["Report Time:", datetime.now().strftime("%I:%M %p")],
            ["X-ray Image:", os.path.basename(xray_file_path)],
        ]
        
        patient_table = Table(patient_data, colWidths=[2*inch, 3*inch])
        patient_table.setStyle(TableStyle([
            ('SPAN', (0, 0), (1, 0)),
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (1, 0), 16),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.darkblue),
            ('BOTTOMPADDING', (0, 0), (1, 0), 12),
            
            ('FONTNAME', (0, 2), (0, 10), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 2), (1, 10), 12),
            ('ALIGN', (0, 2), (0, 10), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 2), (1, 10), 1, colors.lightgrey),
            ('BACKGROUND', (0, 2), (0, 10), colors.lightblue),
        ]))
        
        story.append(patient_table)
        story.append(Spacer(1, 0.4*inch))
        
        # Add Visualization Section if available
        if visualization_path and os.path.exists(visualization_path):
            viz_header = Paragraph("X-RAY VISUALIZATION ANALYSIS", self.header_style)
            story.append(viz_header)
            story.append(Spacer(1, 0.1*inch))
            
            # Add visualization image
            try:
                # Calculate appropriate image size (max width 6 inches)
                img = Image(visualization_path, width=6*inch, height=3*inch)
                story.append(img)
                story.append(Spacer(1, 0.1*inch))
                
                # Add visualization description
                viz_desc = Paragraph(
                    "<b>X-ray Visualization:</b> This composite image displays the original chest X-ray alongside "
                    "the AI model's confidence predictions for different pathological conditions. The bar chart "
                    "shows the confidence scores for various diagnoses, helping to understand the model's decision-making process.",
                    self.body_style
                )
                story.append(viz_desc)
                story.append(Spacer(1, 0.3*inch))
                
            except Exception as e:
                viz_error = Paragraph(f"<b>Visualization Note:</b> Image could not be loaded ({str(e)})", self.body_style)
                story.append(viz_error)
                story.append(Spacer(1, 0.2*inch))
        
        # Analysis Results Header
        analysis_header = Paragraph("CHEST X-RAY ANALYSIS RESULTS", self.header_style)
        story.append(analysis_header)
        story.append(Spacer(1, 0.2*inch))
        
        # Detailed Analysis - Format the detailed analysis for PDF
        detailed_text = self._format_analysis_for_pdf(detailed_analysis)
        detailed_para = Paragraph(detailed_text, self.body_style)
        story.append(detailed_para)
        story.append(Spacer(1, 0.3*inch))
        
        # Summary Classification
        summary_header = Paragraph("CLASSIFICATION SUMMARY", self.header_style)
        story.append(summary_header)
        story.append(Spacer(1, 0.1*inch))
        
        # Enhanced classification summary
        enhanced_summary = self._create_enhanced_classification_summary(classification_result, detailed_analysis, "X-ray")
        result_text = f"<b>Final Classification:</b> {classification_result}<br/><br/>{enhanced_summary}"
        result_para = Paragraph(result_text, self.body_style)
        story.append(result_para)
        story.append(Spacer(1, 0.3*inch))
        
        # Disclaimer
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.red,
            leftIndent=20,
            rightIndent=20,
            spaceAfter=12
        )
        
        disclaimer_text = "<b>MEDICAL DISCLAIMER:</b> This report is generated by an AI system for preliminary analysis only. It does not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for proper medical evaluation and treatment decisions."
        disclaimer_para = Paragraph(disclaimer_text, disclaimer_style)
        story.append(disclaimer_para)
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        
        story.append(Spacer(1, 0.5*inch))
        footer_text = f"Generated by LUNGSCAREAI System | Report ID: {patient_info['patient_number']}_{timestamp}"
        footer_para = Paragraph(footer_text, footer_style)
        story.append(footer_para)
        
        # Build PDF
        doc.build(story)
        
        return filename

class MedicalRAGAgent:
    def __init__(self):
        self.patient_manager = PatientManager()
        self.report_generator = MedicalReportGenerator()
        self.current_patient = None
        self.last_detailed_analysis = ""
        self.setup_rag()
        self.setup_prompts()
        self.setup_agent()
        # Pass LLM instance to report generator for summary generation
        self.report_generator.llm = self.llm
    
    def setup_rag(self):
        print("🚀 Setting up optimized RAG system...")
        def add_input_to_metadata(record, metadata):
            metadata["input"] = record.get("input", "")
            return metadata
        
        # Set up Qdrant connection to Docker instance
        qdrant_url = "http://localhost:6333"
        collection_name = "medical_meadow"
        
        # Create embeddings instance
        print("📚 Loading embeddings model...")
        emb = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        
        # Create Qdrant client to check if collection exists
        client = QdrantClient(url=qdrant_url)
        
        try:
            # Try to get collection info to see if it exists
            collection_info = client.get_collection(collection_name)
            print(f"✅ Found existing collection '{collection_name}' with {collection_info.points_count} points")
            
            # Load existing collection
            self.vectorstore = Qdrant(
                client=client,
                collection_name=collection_name,
                embeddings=emb
            )
            print("✅ Connected to existing collection!")
            
        except Exception as e:
            print(f"Collection '{collection_name}' not found. Creating new collection...")
            self._create_new_collection(add_input_to_metadata, emb, client, collection_name)
        
        # Optimize retriever for faster responses (HNSW will be used automatically)
        self.retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 5}  # Keep simple - HNSW optimization happens at collection level
        )
        
        print("🤖 Connecting to Gemini 2.0 Flash...")
        # Load environment variables
        load_dotenv()
        
        # Configure Gemini API
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        
        # Initialize Gemini 2.0 Flash model
        from langchain_google_genai import ChatGoogleGenerativeAI
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,  # Explicitly pass the API key
            temperature=0.1,
            max_tokens=2048,
            timeout=60,
            max_retries=2
        )
    
    def _create_new_collection(self, add_input_to_metadata, emb, client, collection_name):
        """Create a new Qdrant collection from documents"""
        loader = JSONLoader(
            file_path="medical_meadow_wikidoc_patient_info_cleaned.json",
            jq_schema=".[]",
            text_content=True,
            content_key="output",
            metadata_func=add_input_to_metadata
        )
        docs = loader.load()

        for d in docs:
            d.page_content = f"Q: {d.metadata.get('input','')}\nA: {d.page_content}"

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        split_docs = splitter.split_documents(docs)

        # Create persistent vectorstore with Docker Qdrant using HNSW optimization
        from qdrant_client.models import Distance, VectorParams, HnswConfigDiff
        
        # Configure HNSW for faster similarity search
        hnsw_config = HnswConfigDiff(
            m=16,              # Number of connections per node (balance between speed and accuracy)
            ef_construct=200,  # Size of dynamic candidate list during construction
            full_scan_threshold=10000,  # Use exact search for small datasets
            max_indexing_threads=4      # Parallel indexing
        )
        
        # Create collection with proper vector configuration first
        try:
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=384,  # all-MiniLM-L6-v2 embedding dimension
                    distance=Distance.COSINE,
                    hnsw_config=hnsw_config
                )
            )
        except Exception as e:
            # Collection might already exist
            print(f"Collection creation note: {e}")
        
        # Now create the vectorstore without vector_config parameter
        self.vectorstore = Qdrant.from_documents(
            split_docs, 
            emb, 
            url="http://localhost:6333",
            collection_name=collection_name
        )
        print(f"✅ New collection '{collection_name}' created with HNSW optimization and {len(split_docs)} documents!")

    def setup_prompts(self):
        """Setup enhanced prompts for better medical responses"""

        # MedGemma Persona - consistent identity across all interactions
        self.PERSONA = """🏥 IDENTITY: MedGemma - Advanced Medical AI Assistant by LungsCareAI
💡 SPECIALTY: Pulmonology, Respiratory Medicine, General Healthcare
⚠️ BOUNDARIES: Educational support only - always recommend professional consultation"""

        self.NORMAL_PROMPT = """You are MedGemma, an expert AI medical assistant for lung health analysis.

{persona}

═══════════════════════════════════════════════════════════
🎧 AUDIO ANALYSIS RESULT
═══════════════════════════════════════════════════════════
Classification: {label}
Confidence: {confidence}%
{xai_info}

═══════════════════════════════════════════════════════════
📚 MEDICAL KNOWLEDGE
═══════════════════════════════════════════════════════════
{context}

═══════════════════════════════════════════════════════════
📝 YOUR TASK
═══════════════════════════════════════════════════════════
The lung sounds are classified as **NORMAL** ✅

Provide a helpful response including:

🎉 **Great News!**
- What normal lung sounds indicate
- Reassurance about the positive finding

🫁 **Lung Health Tips**
Provide 5 actionable recommendations:
• Breathing exercises for lung capacity
• Environmental factors to optimize
• Lifestyle habits for respiratory health
• Warning signs to monitor
• Recommended follow-up timeline

📅 **Next Steps**
- When to schedule next checkup
- Symptoms requiring earlier consultation

Keep tone positive and informative. Use emojis for visual appeal.

⚕️ End with: "**Disclaimer:** This is AI-generated health information. Always consult healthcare professionals for medical advice."

YOUR RESPONSE:"""

        self.ABNORMAL_PROMPT = """You are MedGemma, an expert AI medical assistant for lung health analysis.

{persona}

═══════════════════════════════════════════════════════════
🎧 AUDIO ANALYSIS RESULT
═══════════════════════════════════════════════════════════
Classification: {label}
Confidence: {confidence}%
{xai_info}

═══════════════════════════════════════════════════════════
📚 MEDICAL KNOWLEDGE
═══════════════════════════════════════════════════════════
{context}

═══════════════════════════════════════════════════════════
📝 YOUR TASK
═══════════════════════════════════════════════════════════
The lung sounds are classified as **ABNORMAL** ⚠️

Provide a comprehensive clinical response:

🔍 **Finding Summary**
- What abnormal lung sounds may indicate
- Confidence level interpretation

🩺 **Differential Diagnoses** (List 4-5 possibilities)
Format each as: **Condition** - Clinical rationale

⚠️ **Urgency Assessment**
- 🔴 High Priority conditions
- 🟡 Moderate Priority conditions  
- 🟢 Lower Priority conditions

🏥 **Recommended Actions**
1. Immediate steps to take
2. Tests that may be needed
3. Specialists to consult

🫁 **Precautions**
- Activity modifications
- Environmental considerations
- Emergency warning signs

Be thorough but not alarmist. Balance accuracy with reassurance.

⚕️ End with: "**Disclaimer:** This is AI-generated health information. Always consult healthcare professionals for medical advice."

YOUR RESPONSE:"""

        self.XRAY_PROMPT = """You are MedGemma, an expert AI medical assistant for chest X-ray analysis.

{persona}

═══════════════════════════════════════════════════════════
🩻 X-RAY ANALYSIS RESULT
═══════════════════════════════════════════════════════════
Detected Condition: {label}
Confidence: {confidence}%

═══════════════════════════════════════════════════════════
📚 MEDICAL KNOWLEDGE
═══════════════════════════════════════════════════════════
{context}

═══════════════════════════════════════════════════════════
📝 YOUR TASK
═══════════════════════════════════════════════════════════
Provide comprehensive information about **{label}**:

📖 **Condition Overview**
- What is {label}?
- How common is it?
- Who is typically affected?

🔎 **Key Symptoms**
- Early symptoms
- Progressive symptoms
- Warning signs requiring immediate care

⚠️ **Risk Factors**
- Modifiable factors
- Non-modifiable factors
- Environmental factors

🛡️ **Prevention Strategies**
- Primary prevention
- Lifestyle modifications
- Screening recommendations

💊 **Treatment Overview** (General)
- Standard approaches
- What to expect
- Recovery expectations

📋 **Questions for Your Doctor**
Suggest 3-4 important questions to ask healthcare providers.

🚨 **When to Seek Immediate Care**
List emergency symptoms.

Use clear headings and bullet points. Be informative yet reassuring.

⚕️ End with: "**Disclaimer:** This is AI-generated health information. Always consult healthcare professionals for medical advice."

YOUR RESPONSE:"""

        self.QUESTION_PROMPT = """You are MedGemma, an expert AI medical assistant from LungsCareAI.

{persona}

═══════════════════════════════════════════════════════════
📋 CONTEXT
═══════════════════════════════════════════════════════════
{context}

═══════════════════════════════════════════════════════════
❓ USER QUESTION
═══════════════════════════════════════════════════════════
Language: {language}
Question: {question}

═══════════════════════════════════════════════════════════
📝 RESPONSE GUIDELINES
═══════════════════════════════════════════════════════════

🚫 **NON-MEDICAL FILTER** (CRITICAL):
If the question is NOT about health, medicine, symptoms, diseases, treatments, or wellness, respond ONLY with:
"I'm MedGemma, your medical AI assistant 🏥. I specialize in health and medical questions only. Please ask me about lung health, symptoms, medical conditions, or wellness advice!"

✅ **FOR MEDICAL QUESTIONS:**

**Symptom Questions:**
- Acknowledge symptoms mentioned
- List possible causes (common → rare)
- Indicate urgency: 🟢 Low | 🟡 Moderate | 🔴 High
- Recommend next steps

**Disease/Condition Questions:**
- Clear, accurate information
- Symptoms, causes, risk factors
- Prevention strategies
- General treatment approaches

**Wellness Questions:**
- Evidence-based tips
- Focus on lung/respiratory health
- Practical, actionable advice

**Response Format:**
- Use emojis for visual sections 📋 🩺 💡 ⚠️
- Bullet points for lists
- **Bold** key information
- Short paragraphs (2-3 sentences)
- Medical terms with simple explanations

⚕️ **ALWAYS END WITH:**
"**Medical Disclaimer:** This information is for educational purposes only. Always consult qualified healthcare professionals for diagnosis and treatment."

═══════════════════════════════════════════════════════════
YOUR RESPONSE:"""

    def get_relevant_context(self, query_type="general"):
        """Get relevant context based on query type - optimized for speed while keeping quality"""
        if query_type == "normal":
            queries = [
                "How can a patient keep lungs healthy? tips and precautions",
                "Advice to maintain healthy lungs; preventive measures"
            ]
        elif query_type == "abnormal":
            queries = [
                "What are possible lung diseases given abnormal lung sounds? give differential diagnosis",
                "Common respiratory conditions associated with abnormal lung exam; brief rationales",
                "How can a patient keep lungs healthy? tips and precautions"
            ]
        else:
            return ""
        
        # Optimized context retrieval with error handling
        all_context = []
        try:
            for query in queries:
                docs = self.retriever.invoke(query)
                for doc in docs[:2]:  # Keep top 2 docs per query for quality
                    all_context.append(doc.page_content)
        except Exception as e:
            print(f"Warning: RAG context retrieval failed: {e}")
            return ""  # Return empty context if retrieval fails

        # Keep full context but optimize formatting
        return "\n\n".join(all_context[:6])  # Slightly more context for quality

    def generate_clinical_report_text(self, classification_result: str, confidence: float, analysis_type: str = "audio") -> str:
        """Generate professional clinical report text (not conversational)"""

        analysis_label = "Lung Audio Auscultation" if analysis_type == "audio" else "Chest Radiograph"

        prompt = f"""You are a medical report writer generating text for a formal clinical report.

ANALYSIS TYPE: {analysis_label}
CLASSIFICATION RESULT: {classification_result}
CONFIDENCE LEVEL: {confidence}%

Generate a professional clinical analysis report. Requirements:

1. CLINICAL FINDINGS:
Write 2-3 sentences describing the analysis findings in formal medical language.

2. CLINICAL SIGNIFICANCE:
Write 2-3 sentences about what this finding means clinically.

3. DIFFERENTIAL CONSIDERATIONS:
List 3-4 conditions to consider, each with a brief clinical rationale.

4. RECOMMENDATIONS:
List 3-4 recommended next steps (tests, consultations, monitoring).

CRITICAL FORMATTING RULES:
- Use formal third-person medical language (NOT "you" or "your")
- NO emojis or informal language
- NO conversational phrases like "Great news" or "I recommend"
- Write as if for a medical professional reviewing the report
- Use proper medical terminology
- Each section should be clearly labeled

CLINICAL REPORT:"""

        try:
            response = self.llm.invoke(prompt)
            if hasattr(response, 'content'):
                text = response.content
            else:
                text = str(response)

            # Clean up any remaining conversational elements
            text = self.report_generator._remove_emojis(text) if hasattr(self.report_generator, '_remove_emojis') else text
            text = self.report_generator._make_clinical(text) if hasattr(self.report_generator, '_make_clinical') else text

            return text
        except Exception as e:
            return f"Classification: {classification_result} (Confidence: {confidence}%). Clinical correlation recommended."

    def process_audio_classification(self, audio_result: str) -> str:
        """Process audio classification result and provide appropriate response"""
        try:
            # Check if the result is an error message first
            if audio_result.startswith("Error processing audio:"):
                return f"Audio analysis failed: {audio_result}"
            
            # Try to parse as JSON
            result = json.loads(audio_result)
            label = result.get("label", "").lower()
            confidence = result.get("confidence", 0)
            
            # Handle XAI information if present
            xai_info = ""
            if "xai_type" in result:
                xai_info = f"XAI Analysis: {result.get('explanation', '')}"
                
            # Add visualization info if available
            if "visualization_saved" in result:
                xai_info += f"\nVisualization saved: {result.get('visualization_saved')}"

            if label == "normal":
                context = self.get_relevant_context("normal")
                prompt = self.NORMAL_PROMPT.format(
                    persona=self.PERSONA,
                    label=result.get("label"),
                    confidence=confidence,
                    xai_info=xai_info,
                    context=context
                )
            elif label == "abnormal":
                context = self.get_relevant_context("abnormal")
                prompt = self.ABNORMAL_PROMPT.format(
                    persona=self.PERSONA,
                    label=result.get("label"),
                    confidence=confidence,
                    xai_info=xai_info,
                    context=context
                )
            else:
                return "Unable to process audio classification result."
            
            response = self.llm.invoke(prompt)
            # Handle AIMessage object from newer versions of langchain-google-genai  
            if hasattr(response, 'content'):
                response = response.content
            else:
                response = str(response)
            
            # Add visualization info to the final response if available
            if "visualization_saved" in result:
                response += f"\n\n📊 XAI Visualization has been saved to: {result.get('visualization_saved')}"
            
            return response
            
        except json.JSONDecodeError as e:
            return f"Error parsing audio classification result: {audio_result}"
        except Exception as e:
            return f"Error processing audio result: {str(e)}"
        
    def process_xray_classification(self, xray_result: str) -> str:
        """Process X-ray classification result and provide comprehensive information"""
        try:
            # Check if the result is an error message first
            if xray_result.startswith("Error processing X-ray"):
                return f"X-ray analysis failed: {xray_result}"
            
            # Try to parse as JSON
            result = json.loads(xray_result)
            label = result.get("label", "Unknown")
            confidence = result.get("confidence", 0)
            
            # Add visualization info if available
            viz_info = ""
            if "visualization_saved" in result:
                viz_info = f"\n📊 X-ray visualization saved: {result.get('visualization_saved')}"

            # Get relevant context about the disease/condition
            context = self.get_relevant_context(f"{label} disease symptoms prevention treatment")
            
            # Generate comprehensive response using the X-ray specific prompt
            prompt = self.XRAY_PROMPT.format(
                persona=self.PERSONA,
                label=label,
                confidence=confidence,
                context=context
            )
            
            detailed_response = self.llm.invoke(prompt)
            # Handle AIMessage object from newer versions of langchain-google-genai
            if hasattr(detailed_response, 'content'):
                detailed_response = detailed_response.content
            else:
                detailed_response = str(detailed_response)
            
            # Store for PDF generation
            self.last_detailed_analysis = detailed_response
            
            # Add visualization info to the final response
            if viz_info:
                detailed_response += viz_info
            
            return detailed_response
            
        except json.JSONDecodeError as e:
            return f"Error parsing X-ray classification result: {xray_result}"
        except Exception as e:
            return f"Error processing X-ray result: {str(e)}"

    def answer_general_question(self, question: str) -> str:
        """Answer general medical questions using RAG"""
        try:
            docs = self.retriever.invoke(question)
            context = "\n\n".join([doc.page_content for doc in docs[:3]])
        except Exception as e:
            print(f"Warning: RAG retrieval failed: {e}")
            context = ""  # Continue without RAG context

        prompt = self.QUESTION_PROMPT.format(
            persona=self.PERSONA,
            question=question,
            context=context if context else "No additional medical context available.",
            language="english"
        )
        
        response = self.llm.invoke(prompt)
        if hasattr(response, 'content'):
            return response.content
        return str(response)

    def answer_question_with_context(self, question: str, language: str = "english", patient_info: dict = None, 
                                   patient_reports_context: str = "", chat_context: str = "") -> str:
        """Answer questions with patient context and chat history - Enhanced version"""
        # Get relevant medical knowledge from RAG with error handling
        medical_context = ""
        try:
            docs = self.retriever.invoke(question)
            medical_context = "\n\n".join([doc.page_content for doc in docs[:4]])
        except Exception as e:
            print(f"Warning: RAG retrieval failed: {e}")
            medical_context = ""  # Continue without RAG context

        # Build comprehensive context with clear sections
        context_parts = []

        # Add medical knowledge
        if medical_context:
            context_parts.append(f"📚 **Medical Knowledge Base:**\n{medical_context}")

        # Add patient info if available
        if patient_info:
            patient_section = f"""👤 **Patient Profile:**
• Name: {patient_info.get('name', 'Unknown')}
• Age: {patient_info.get('age', 'N/A')} years
• Gender: {patient_info.get('gender', 'N/A')}
• Area: {patient_info.get('area', 'N/A')}"""
            context_parts.append(patient_section)

        # Add patient reports context
        if patient_reports_context:
            context_parts.append(f"📋 **Patient Medical History:**\n{patient_reports_context}")

        # Add chat history context
        if chat_context:
            context_parts.append(f"💬 **Recent Conversation:**\n{chat_context}")

        full_context = "\n\n".join(context_parts) if context_parts else "No additional context available."

        # Use enhanced prompt with persona
        prompt = self.QUESTION_PROMPT.format(
            persona=self.PERSONA,
            context=full_context,
            question=question,
            language=language
        )

        response = self.llm.invoke(prompt)
        # Handle AIMessage object from newer versions of langchain-google-genai
        if hasattr(response, 'content'):
            return response.content
        return str(response)

    def setup_agent(self):
        print("🔧 Setting up optimized audio and X-ray analysis tools...")
        # Create all audio analysis tools (now using shared cached models)
        basic_audio_tool = AudioClassificationTool()
        gradient_xai_tool = AudioGradientXAITool()
        attention_xai_tool = AudioAttentionXAITool()
        
        # Create X-ray analysis tools
        basic_xray_tool = XrayClassificationTool()
        xray_viz_tool = XrayVisualizationTool()
        
        def process_basic_audio(path: str) -> str:
            """Basic audio classification with medical response"""
            audio_result = basic_audio_tool._run(path)
            detailed_result = self.process_audio_classification(audio_result)
            # Store detailed result for PDF generation
            self.last_detailed_analysis = detailed_result
            return detailed_result
        
        def process_gradient_audio(path: str) -> str:
            """Audio classification with gradient XAI and medical response"""
            audio_result = gradient_xai_tool._run(path)
            detailed_result = self.process_audio_classification(audio_result)
            # Store detailed result for PDF generation
            self.last_detailed_analysis = detailed_result
            return detailed_result
        
        def process_attention_audio(path: str) -> str:
            """Audio classification with attention XAI and medical response"""
            audio_result = attention_xai_tool._run(path)
            detailed_result = self.process_audio_classification(audio_result)
            # Store detailed result for PDF generation
            self.last_detailed_analysis = detailed_result
            return detailed_result
        
        def process_basic_xray(path: str) -> str:
            """X-ray classification with medical response"""
            xray_result = basic_xray_tool._run(path)
            detailed_result = self.process_xray_classification(xray_result)
            # Store detailed result for PDF generation
            self.last_detailed_analysis = detailed_result
            return detailed_result
        
        def process_xray_with_viz(path: str) -> str:
            """X-ray classification with visualization and medical response"""
            xray_result = xray_viz_tool._run(path)
            detailed_result = self.process_xray_classification(xray_result)
            # Store detailed result for PDF generation
            self.last_detailed_analysis = detailed_result
            return detailed_result
        
        tools = [
            Tool(
                name="analyze_lung_audio",
                description="Basic lung audio classification (Normal/Abnormal) with medical advice. Use for quick analysis. Input: path to audio file",
                func=process_basic_audio
            ),
            Tool(
                name="analyze_lung_audio_gradient_xai",
                description="Lung audio classification with gradient-based explainability showing which audio parts influenced the prediction. Use when explanation is needed. Input: path to audio file",
                func=process_gradient_audio
            ),
            Tool(
                name="analyze_lung_audio_attention_xai", 
                description="Lung audio classification with attention-based explainability showing which regions the model focused on. Use for detailed analysis. Input: path to audio file",
                func=process_attention_audio
            ),
            Tool(
                name="analyze_chest_xray",
                description="Basic chest X-ray classification for lung diseases/conditions with medical information about symptoms and prevention. Input: path to X-ray image file (jpg, png, jpeg)",
                func=process_basic_xray
            ),
            Tool(
                name="analyze_chest_xray_with_visualization",
                description="Chest X-ray classification with visualization showing top predictions and confidence scores. Use for detailed X-ray analysis. Input: path to X-ray image file",
                func=process_xray_with_viz
            ),
            Tool(
                name="medical_knowledge_search", 
                description="Search medical knowledge base for general medical questions. Input: medical question",
                func=self.answer_general_question
            )
        ]

        # Optimize agent for faster responses while keeping all functionality
        self.agent = initialize_agent(
            tools=tools,
            llm=self.llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            max_iterations=5,  # Limit iterations for speed while keeping functionality
            early_stopping_method="generate"  # Stop early when answer is found
        )
        print("✅ Optimized agent setup complete!")

    def query(self, user_input: str) -> str:
        """Main query interface"""
        # Check if the query is about audio analysis
        if any(keyword in user_input.lower() for keyword in ["audio", "sound", "wav", "file", "analyze", "classify"]):
            return self.agent.run(user_input)
        else:
            # For general medical questions, use direct RAG
            return self.answer_general_question(user_input)
    
    def analyze_audio_with_report(self, audio_path: str, analysis_type: str = "attention"):
        """Analyze audio and generate PDF report"""
        if not self.current_patient:
            print("❌ No patient registered! Please register first.")
            return None
        
        print(f"\n🔊 Analyzing audio file: {os.path.basename(audio_path)}")
        print("⏳ Please wait...")
        
        # Choose analysis type
        if analysis_type == "basic":
            query = f"Can you analyze this lung audio file: {audio_path}"
        elif analysis_type == "gradient":
            query = f"Can you analyze this lung audio with gradient explanation: {audio_path}"
        else:  # attention (default)
            query = f"Can you analyze this lung audio with detailed explanation: {audio_path}"
        
        # Get analysis result
        result = self.query(query)
        
        # Generate PDF report with detailed analysis
        report_path = self.report_generator.generate_medical_report(
            self.current_patient, 
            result,  # Final summary
            self.last_detailed_analysis,  # Detailed analysis from LLM
            audio_path
        )
        
        print(f"\n✅ Analysis Complete!")
        print(f"📄 Medical Report Generated: {report_path}")
        
        return result, report_path

    def analyze_xray_with_report(self, xray_path: str, analysis_type: str = "basic"):
        """Analyze X-ray and generate PDF report"""
        if not self.current_patient:
            print("❌ No patient registered! Please register first.")
            return None
        
        print(f"\n🩻 Analyzing X-ray image: {os.path.basename(xray_path)}")
        print("⏳ Please wait...")
        
        # Choose analysis type
        if analysis_type == "visualization":
            query = f"Can you analyze this chest X-ray with visualization: {xray_path}"
        else:  # basic (default)
            query = f"Can you analyze this chest X-ray image: {xray_path}"
        
        # Get analysis result
        result = self.query(query)
        
        # Generate PDF report with detailed analysis
        report_path = self.report_generator.generate_xray_report(
            self.current_patient, 
            result,  # Final summary
            self.last_detailed_analysis,  # Detailed analysis from LLM
            xray_path
        )
        
        print(f"\n✅ X-ray Analysis Complete!")
        print(f"📄 Medical Report Generated: {report_path}")
        
        return result, report_path
    
    def start_patient_session(self):
        """Start a new patient session"""
        self.current_patient = self.patient_manager.register_patient()
        return self.current_patient

# Main Application
def main():
    print("\n" + "="*70)
    print("🏥 WELCOME TO LUNGSCAREAI - AI-POWERED LUNG ANALYSIS SYSTEM")
    print("="*70)
    
    # Initialize system
    agent = MedicalRAGAgent()
    
    # Patient Registration
    patient = agent.start_patient_session()
    
    print(f"\n🩺 Welcome {patient['name']}! Ready for medical analysis.")
    print("\n📋 Available Analysis Types:")
    print("🎵 AUDIO ANALYSIS:")
    print("  1. Basic Analysis (Fast)")
    print("  2. Gradient XAI Analysis (With Visual Explanation)")  
    print("  3. Attention XAI Analysis (Detailed Visual Explanation)")
    print("\n🩻 X-RAY ANALYSIS:")
    print("  4. Basic X-ray Analysis")
    print("  5. X-ray Analysis with Visualization")
    
    while True:
        print("\n" + "-"*60)
        print("OPTIONS:")
        print("• Enter audio file path (.wav) for lung audio analysis")
        print("• Enter X-ray image path (.jpg/.png/.jpeg) for chest analysis")
        print("• Type 'new-patient' for new patient registration")
        print("• Type 'quit' to exit")
        print("-"*60)
        
        user_input = input("\n🎤 Enter file path or command: ").strip()
        
        if user_input.lower() == 'quit':
            print("\n👋 Thank you for using LUNGSCAREAI!")
            break
        
        elif user_input.lower() == 'new-patient':
            patient = agent.start_patient_session()
            print(f"\n🩺 Welcome {patient['name']}! Ready for analysis.")
            continue
        
        elif user_input.endswith('.wav') or '/Audio' in user_input:
            # Audio file analysis
            if not os.path.exists(user_input):
                print(f"❌ Audio file not found: {user_input}")
                continue
            
            # Choose analysis type
            print("\n🔬 Select Analysis Type:")
            print("1. Basic (b)")
            print("2. Gradient XAI (g)")  
            print("3. Attention XAI (a) [Default]")
            
            analysis_choice = input("Enter choice (b/g/a): ").strip().lower()
            
            if analysis_choice == 'b':
                analysis_type = "basic"
            elif analysis_choice == 'g':
                analysis_type = "gradient"
            else:
                analysis_type = "attention"
            
            try:
                result, report_path = agent.analyze_audio_with_report(user_input, analysis_type)
                
                print("\n" + "="*60)
                print("📋 ANALYSIS RESULT:")
                print("="*60)
                print(result)
                print("="*60)
                print(f"📄 Full medical report saved: {report_path}")
                
            except Exception as e:
                print(f"❌ Error during analysis: {e}")
        
        elif user_input.lower().endswith(('.jpg', '.jpeg', '.png')) or 'covid' in user_input.lower():
            # X-ray image analysis
            if not os.path.exists(user_input):
                print(f"❌ X-ray image not found: {user_input}")
                continue
            
            # Choose analysis type
            print("\n🔬 Select X-ray Analysis Type:")
            print("1. Basic Analysis (b) [Default]")
            print("2. Analysis with Visualization (v)")
            
            analysis_choice = input("Enter choice (b/v): ").strip().lower()
            
            if analysis_choice == 'v':
                analysis_type = "visualization"
            else:
                analysis_type = "basic"
            
            try:
                result, report_path = agent.analyze_xray_with_report(user_input, analysis_type)
                
                print("\n" + "="*60)
                print("📋 X-RAY ANALYSIS RESULT:")
                print("="*60)
                print(result)
                print("="*60)
                print(f"📄 Full medical report saved: {report_path}")
                
            except Exception as e:
                print(f"❌ Error during X-ray analysis: {e}")
        
        else:
            # Handle general medical questions
            print(f"\n🤖 Searching medical knowledge...")
            try:
                response = agent.answer_general_question(user_input)
                print("\n📋 MEDICAL INFORMATION:")
                print("="*50)
                print(response)
                print("="*50)
            except Exception as e:
                print(f"❌ Error: {e}")
                print("💡 Please enter a valid file path (.wav for audio, .jpg/.png for X-ray) or medical question.")

if __name__ == "__main__":
    main()