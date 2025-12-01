import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
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
  CircularProgress,
  Chip,
  Grid,
  MenuItem,
  Divider,
  LinearProgress
} from '@mui/material'
import {
  LocalHospital as XrayIcon,
  CloudUpload as UploadIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'

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

      let endpoint = '/api/analyze/xray/basic'
      if (data.analysisType === 'visualization') {
        endpoint = '/api/analyze/xray/visualization'
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
        toast.success('X-ray analysis completed successfully!')
      },
      onError: (error: Error) => {
        toast.error(`Analysis failed: ${error.message}`)
      },
    }
  )

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    },
    maxFiles: 1
  })

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

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <XrayIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
            Chest X-ray Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload chest X-ray images for AI-powered disease detection
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              1. Upload X-ray Image
            </Typography>
            
            <Box
              {...getRootProps()}
              className={`upload-zone ${isDragActive ? 'active' : ''}`}
              sx={{ mb: 3 }}
            >
              <input {...getInputProps()} />
              <XrayIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              {selectedFile ? (
                <Box>
                  <Typography variant="body1" fontWeight="500">
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </Typography>
                  <Chip 
                    label="Image Ready" 
                    color="success" 
                    size="small" 
                    sx={{ mt: 1 }} 
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Drag and drop X-ray image here, or click to select
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports: JPG, JPEG, PNG, BMP, TIFF
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Patient Selection */}
            <TextField
              fullWidth
              select
              label="Select Patient"
              value={patientNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientNumber(e.target.value)}
              sx={{ mb: 2 }}
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
              sx={{ mb: 3 }}
            >
              <MenuItem value="basic">Basic Analysis</MenuItem>
              <MenuItem value="visualization">Analysis with Visualization</MenuItem>
            </TextField>

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!selectedFile || !patientNumber || analysisMutation.isLoading}
              onClick={handleAnalysis}
              startIcon={
                analysisMutation.isLoading ? <CircularProgress size={20} /> : <PlayIcon />
              }
              sx={{ bgcolor: 'secondary.main' }}
            >
              {analysisMutation.isLoading ? 'Analyzing...' : 'Start X-ray Analysis'}
            </Button>

            {analysisMutation.isLoading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress className="progress-bar" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  Processing X-ray with AI models...
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              2. Analysis Results
            </Typography>

            {result ? (
              <Card sx={{ mb: 3, bgcolor: 'secondary.50', border: 1, borderColor: 'secondary.200' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom color="secondary.main">
                    X-ray Classification Result
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="div">
                      Condition: <strong>{result.result.label}</strong>
                    </Typography>
                    <Typography variant="body1">
                      Confidence: 
                      <Chip 
                        label={`${result.result.confidence}%`}
                        color={getConfidenceColor(result.result.confidence)}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>

                  {result.detailed_analysis && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Medical Information
                      </Typography>
                      <Box sx={{ 
                        bgcolor: 'background.paper', 
                        p: 2, 
                        borderRadius: 1,
                        maxHeight: 300,
                        overflow: 'auto'
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
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => window.open(`/api/download/report/${result.report_path?.split('/').pop()}`, '_blank')}
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
                        View Visualization
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info">
                Upload an X-ray image and select a patient to start analysis
              </Alert>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default XrayAnalysis
