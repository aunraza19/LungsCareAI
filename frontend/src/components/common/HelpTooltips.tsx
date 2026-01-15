import React from 'react'
import { Tooltip, TooltipProps, Zoom, styled, tooltipClasses } from '@mui/material'

// Custom styled tooltip for medical information
const MedicalTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#1a3a5c' : '#ffffff',
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#333333',
    boxShadow: theme.shadows[4],
    fontSize: 13,
    padding: '12px 16px',
    borderRadius: 8,
    maxWidth: 320,
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(77, 182, 172, 0.3)' : 'rgba(0,0,0,0.1)'}`,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.mode === 'dark' ? '#1a3a5c' : '#ffffff',
  },
}))

// Predefined help tooltips
export const HelpTooltips = {
  // Patient Registration
  patientName: "Enter the patient's full legal name as it appears on their ID",
  patientAge: "Patient's age in years (0-150)",
  patientGender: "Select the patient's biological sex for accurate medical analysis",
  patientArea: "City or district where the patient resides",
  patientAddress: "Complete residential address for medical records",

  // Audio Analysis
  audioUpload: "Upload lung sound recordings in WAV, MP3, or OGG format. Best results with clear recordings of 5-30 seconds.",
  audioAnalysisBasic: "Standard classification of lung sounds as Normal or Abnormal",
  audioAnalysisGradient: "Classification with gradient-based XAI visualization showing which audio features influenced the decision",
  audioAnalysisAttention: "Classification with attention-based XAI highlighting the most important time segments",

  // X-ray Analysis
  xrayUpload: "Upload chest X-ray images in JPG, PNG, or DICOM format. Frontal (PA) views work best.",
  xrayAnalysisBasic: "Multi-class classification detecting conditions like Pneumonia, COVID-19, TB, etc.",
  xrayAnalysisVisualization: "Classification with visual heatmap showing areas of concern on the X-ray",

  // Chat
  chatVoiceInput: "Click to speak your question. Works in Chrome, Edge, and Safari.",
  chatLanguage: "Select your preferred language for responses",
  chatPatientContext: "Select a patient to include their medical history in the conversation",

  // Results
  confidenceScore: "AI confidence level. Higher values indicate more certain predictions. Scores above 80% are considered reliable.",
  differentialDiagnosis: "Alternative conditions to consider based on the analysis findings",
  secondOpinion: "AI-generated alternative perspective on the diagnosis for clinical consideration",

  // Reports
  downloadReport: "Download the complete medical report as a PDF document",
  viewVisualization: "View the AI explainability visualization showing the analysis reasoning",
}

interface HelpTooltipProps {
  helpKey: keyof typeof HelpTooltips
  children: React.ReactElement
  placement?: TooltipProps['placement']
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  helpKey,
  children,
  placement = 'top'
}) => {
  return (
    <MedicalTooltip
      title={HelpTooltips[helpKey]}
      placement={placement}
      arrow
      TransitionComponent={Zoom}
      enterDelay={300}
      leaveDelay={100}
    >
      {children}
    </MedicalTooltip>
  )
}

// Quick info tooltip with custom content
interface InfoTooltipProps {
  title: string
  content: React.ReactNode
  children: React.ReactElement
  placement?: TooltipProps['placement']
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  content,
  children,
  placement = 'top'
}) => {
  return (
    <MedicalTooltip
      title={
        <div>
          <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>
          {content}
        </div>
      }
      placement={placement}
      arrow
      TransitionComponent={Zoom}
    >
      {children}
    </MedicalTooltip>
  )
}

// Confidence score tooltip with visual indicator
interface ConfidenceTooltipProps {
  confidence: number
  children: React.ReactElement
}

export const ConfidenceTooltip: React.FC<ConfidenceTooltipProps> = ({
  confidence,
  children
}) => {
  const getConfidenceInfo = () => {
    if (confidence >= 90) return { label: 'Very High', color: '#4caf50', desc: 'The AI is highly confident in this result.' }
    if (confidence >= 80) return { label: 'High', color: '#8bc34a', desc: 'The AI has strong confidence in this result.' }
    if (confidence >= 70) return { label: 'Moderate', color: '#ff9800', desc: 'Consider additional tests for confirmation.' }
    if (confidence >= 60) return { label: 'Low', color: '#ff5722', desc: 'Results should be verified with additional analysis.' }
    return { label: 'Very Low', color: '#f44336', desc: 'Results are uncertain. Clinical correlation strongly recommended.' }
  }

  const info = getConfidenceInfo()

  return (
    <MedicalTooltip
      title={
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: info.color,
              display: 'inline-block'
            }} />
            <strong>Confidence: {info.label} ({confidence}%)</strong>
          </div>
          <div>{info.desc}</div>
        </div>
      }
      placement="top"
      arrow
      TransitionComponent={Zoom}
    >
      {children}
    </MedicalTooltip>
  )
}

export default MedicalTooltip

