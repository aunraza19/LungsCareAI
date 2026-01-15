import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  Grid,
  MenuItem,
  Divider,
  Fade
} from '@mui/material'
import {
  Hearing as AudioIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Air as LungIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'

// Import new components
import FileDropzone from '../components/upload/FileDropzone'
import AudioWaveform from '../components/upload/AudioWaveform'
import LungLoader from '../components/common/LungLoader'
import SecondOpinion from '../components/analysis/SecondOpinion'

interface AnalysisResult {
  success: boolean
  result: {
    label: string
    confidence: number
    classification_type: string
  }
  detailed_analysis?: string
  report_path?: string
  visualization_path?: string
}

const AudioAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [patientNumber, setPatientNumber] = useState('')
  const [analysisType, setAnalysisType] = useState('basic')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  // Fetch patients for dropdown
  const { data: patientsData } = useQuery('patients', async () => {
    const response = await fetch('/api/patients')
    return response.json()
  })

  const analysisMutation = useMutation(
    async (data: { file: File; patientNumber: string; analysisType: string }) => {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('patient_number', data.patientNumber)

      let endpoint = '/api/analyze/audio/basic'
      if (data.analysisType === 'gradient') {
        endpoint = '/api/analyze/audio/gradient'
      } else if (data.analysisType === 'attention') {
        endpoint = '/api/analyze/audio/attention'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      return response.json()
    },
    {
      onSuccess: (data: AnalysisResult) => {
        setResult(data)
        toast.success('Audio analysis completed successfully!')
      },
      onError: (error: Error) => {
        toast.error(`Analysis failed: ${error.message}`)
      },
    }
  )

  const handleAnalysis = () => {
    if (selectedFile && patientNumber) {
      analysisMutation.mutate({
        file: selectedFile,
        patientNumber,
        analysisType
      })
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success'
    if (confidence >= 60) return 'warning' 
    return 'error'
  }

  const getAnalysisTypeDescription = (type: string) => {
    switch (type) {
      case 'basic':
        return 'Fast classification with confidence score'
      case 'gradient':
        return 'Analysis with gradient-based XAI visualization'
      case 'attention':
        return 'Analysis with attention heatmap visualization'
      default:
        return 'Audio classification'
    }
  }

  return (
    <Container maxWidth="lg">
      <Fade in timeout={500}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LungIcon
              sx={{
                fontSize: 56,
                color: 'secondary.main',
                mb: 2,
                animation: 'breathe 3s ease-in-out infinite',
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="700">
              Lung Audio Analysis
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload lung audio recordings for AI-powered analysis and diagnosis
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>
            {/* Upload Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                1. Upload Audio File
              </Typography>

              <FileDropzone
                onFileSelect={(file) => {
                  setSelectedFile(file)
                  setResult(null)
                }}
                accept={{ 'audio/*': ['.wav', '.mp3', '.m4a', '.flac'] }}
                selectedFile={selectedFile}
                icon={<AudioIcon sx={{ fontSize: 56, color: 'primary.main' }} />}
                title="Drag and drop lung audio file here"
                subtitle="Supports: WAV, MP3, M4A, FLAC (max 50MB)"
                color="primary"
              />

              {/* Audio Waveform Player */}
              {selectedFile && (
                <Fade in timeout={300}>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Audio Preview & Waveform
                    </Typography>
                    <AudioWaveform file={selectedFile} height={80} />
                  </Box>
                </Fade>
              )}

            {/* Patient Selection */}
            <TextField
              fullWidth
              select
              label="Select Patient"
              value={patientNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientNumber(e.target.value)}
              sx={{ mb: 2, mt: 3 }}
            >
              {patientsData?.patients && patientsData.patients.length > 0 ? (
                patientsData.patients.map((patient: any, index: number) => (
                  <MenuItem key={`${patient.patient_number}-${index}`} value={patient.patient_number}>
                    {patient.name} ({patient.patient_number})
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No patients registered
                </MenuItem>
              )}
            </TextField>

            {/* Analysis Type Selection */}
            <TextField
              fullWidth
              select
              label="Analysis Type"
              value={analysisType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnalysisType(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="basic">⚡ Basic Analysis</MenuItem>
              <MenuItem value="gradient">🔥 Gradient XAI Analysis</MenuItem>
              <MenuItem value="attention">🎯 Attention XAI Analysis</MenuItem>
            </TextField>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
              {getAnalysisTypeDescription(analysisType)}
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!selectedFile || !patientNumber || analysisMutation.isLoading}
              onClick={handleAnalysis}
              startIcon={!analysisMutation.isLoading && <PlayIcon />}
              sx={{
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              {analysisMutation.isLoading ? 'Analyzing...' : 'Start Analysis'}
            </Button>

            {/* Loading State with Lung Animation */}
            {analysisMutation.isLoading && (
              <Box sx={{ mt: 3 }}>
                <LungLoader
                  size="medium"
                  message="AI is analyzing lung sounds..."
                />
              </Box>
            )}
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              2. Analysis Results
            </Typography>

            {result ? (
              <Fade in timeout={500}>
                <Box>
                <Card sx={{
                  mb: 3,
                  background: result.result.label === 'Normal'
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(77, 182, 172, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(244, 67, 54, 0.15) 100%)',
                  border: 1,
                  borderColor: result.result.label === 'Normal' ? 'success.main' : 'warning.main',
                }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                      Classification Result
                    </Typography>

                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LungIcon
                        sx={{
                          fontSize: 48,
                          color: result.result.label === 'Normal' ? 'success.main' : 'warning.main'
                        }}
                      />
                      <Box>
                        <Typography variant="h4" component="div" fontWeight={700}>
                          {result.result.label}
                        </Typography>
                        <Chip
                          label={`${result.result.confidence}% Confidence`}
                          color={getConfidenceColor(result.result.confidence)}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    {result.detailed_analysis && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          Detailed Medical Analysis
                        </Typography>
                        <Box sx={{
                          bgcolor: 'background.paper',
                          p: 2,
                          borderRadius: 2,
                          maxHeight: 300,
                          overflow: 'auto',
                          border: 1,
                          borderColor: 'divider',
                        }}>
                          <ReactMarkdown className="medical-text">
                            {result.detailed_analysis}
                          </ReactMarkdown>
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {result.report_path && (
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={() => window.open(`/api/download/report/${result.report_path?.split('/').pop()}`, '_blank')}
                          sx={{ bgcolor: 'secondary.main' }}
                        >
                          Download Report
                        </Button>
                      )}
                      {result.visualization_path && (
                        <Button
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => window.open(`/static/outputs/${result.visualization_path?.split('/').pop()}`, '_blank')}
                        >
                          View XAI Visualization
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* AI Second Opinion */}
                <SecondOpinion
                  primaryDiagnosis={result.result.label}
                  confidence={result.result.confidence}
                  analysisType="audio"
                />
                </Box>
              </Fade>
            ) : (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: 28
                  }
                }}
              >
                Upload an audio file and select a patient to start AI analysis
              </Alert>
            )}
          </Grid>
        </Grid>
      </Paper>
      </Fade>
    </Container>
  )
}

export default AudioAnalysis
