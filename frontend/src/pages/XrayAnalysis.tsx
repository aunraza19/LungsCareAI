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
  MenuItem,
  Fade,
  Stack
} from '@mui/material'
import {
  LocalHospital as XrayIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Air as LungIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'
import FileDropzone from '../components/upload/FileDropzone'
import ImagePreview from '../components/upload/ImagePreview'
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

const XrayAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [patientNumber, setPatientNumber] = useState('')
  const [analysisType, setAnalysisType] = useState('basic')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const { data: patientsData } = useQuery('patients', async () => {
    const response = await fetch('/api/patients')
    return response.json()
  })

  const analysisMutation = useMutation(
    async (data: { file: File; patientNumber: string; analysisType: string }) => {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('patient_number', data.patientNumber)

      let endpoint = '/api/analyze/xray/basic'
      if (data.analysisType === 'visualization') {
        endpoint = '/api/analyze/xray/visualization'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Analysis failed')
      return response.json()
    },
    {
      onSuccess: (data: AnalysisResult) => {
        setResult(data)
        toast.success('X-ray analysis completed!')
      },
      onError: (error: Error) => {
        toast.error(`Analysis failed: ${error.message}`)
      },
    }
  )

  const handleAnalysis = () => {
    if (selectedFile && patientNumber) {
      analysisMutation.mutate({ file: selectedFile, patientNumber, analysisType })
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success'
    if (confidence >= 60) return 'warning'
    return 'error'
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Paper elevation={2} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LungIcon
              sx={{
                fontSize: 64,
                color: 'secondary.main',
                mb: 2,
                animation: 'breathe 3s ease-in-out infinite',
              }}
            />
            <Typography variant="h4" gutterBottom fontWeight="700">
              Chest X-ray Analysis
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload chest X-ray images for AI-powered disease detection
            </Typography>
          </Box>

          {/* Main Content */}
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              {/* File Upload */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  1. Upload X-ray Image
                </Typography>
                <FileDropzone
                  onFileSelect={(file) => {
                    setSelectedFile(file)
                    setResult(null)
                  }}
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'] }}
                  selectedFile={selectedFile}
                  icon={<XrayIcon sx={{ fontSize: 56, color: 'secondary.main' }} />}
                  title="Drag and drop X-ray image here"
                  subtitle="JPG, PNG, BMP, TIFF (max 50MB)"
                  color="secondary"
                />
              </Box>

              {/* Image Preview */}
              {selectedFile && (
                <Fade in timeout={300}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      X-ray Preview
                    </Typography>
                    <ImagePreview
                      file={selectedFile}
                      onRemove={() => {
                        setSelectedFile(null)
                        setResult(null)
                      }}
                      maxHeight={250}
                    />
                  </Box>
                </Fade>
              )}

              {/* Patient & Analysis Type Selection */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  2. Select Patient & Analysis Type
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    select
                    label="Patient"
                    value={patientNumber}
                    onChange={(e) => setPatientNumber(e.target.value)}
                  >
                    {patientsData?.patients?.length > 0 ? (
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

                  <TextField
                    fullWidth
                    select
                    label="Analysis Type"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                  >
                    <MenuItem value="basic">Basic Analysis</MenuItem>
                    <MenuItem value="visualization">With Visualization</MenuItem>
                  </TextField>
                </Stack>
              </Box>

              {/* Analyze Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!selectedFile || !patientNumber || analysisMutation.isLoading}
                onClick={handleAnalysis}
                startIcon={!analysisMutation.isLoading && <PlayIcon />}
                sx={{
                  py: 1.5,
                  bgcolor: 'secondary.main',
                  '&:hover': { bgcolor: 'secondary.dark' }
                }}
              >
                {analysisMutation.isLoading ? 'Analyzing...' : 'Start Analysis'}
              </Button>

              {/* Loading */}
              {analysisMutation.isLoading && (
                <LungLoader size="medium" message="Analyzing X-ray image..." />
              )}

              {/* Results */}
              {result ? (
                <Fade in timeout={500}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      3. Analysis Results
                    </Typography>
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, rgba(77, 182, 172, 0.1) 0%, rgba(102, 178, 255, 0.1) 100%)',
                        border: 1,
                        borderColor: 'secondary.main'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <XrayIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
                          <Box>
                            <Typography variant="h5" fontWeight={700}>
                              {result.result.label}
                            </Typography>
                            <Chip
                              label={`${result.result.confidence}% Confidence`}
                              color={getConfidenceColor(result.result.confidence)}
                              size="small"
                            />
                          </Box>
                        </Box>

                        {result.detailed_analysis && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <ReactMarkdown className="medical-text">
                              {result.detailed_analysis}
                            </ReactMarkdown>
                          </Box>
                        )}

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                          {result.report_path && (
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              onClick={() => window.open(`/api/download/report/${result.report_path?.split('/').pop()}`, '_blank')}
                              fullWidth
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
                              fullWidth
                            >
                              View Visualization
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>

                    <Box sx={{ mt: 2 }}>
                      <SecondOpinion
                        primaryDiagnosis={result.result.label}
                        confidence={result.result.confidence}
                        analysisType="xray"
                      />
                    </Box>
                  </Box>
                </Fade>
              ) : (
                !analysisMutation.isLoading && (
                  <Alert severity="info">
                    Upload an X-ray image and select a patient to start analysis
                  </Alert>
                )
              )}
            </Stack>
          </Box>
        </Paper>
      </Fade>
    </Container>
  )
}

export default XrayAnalysis
