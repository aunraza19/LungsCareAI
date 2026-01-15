import React, { useState } from 'react'
import {
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Grid,
  Alert
} from '@mui/material'
import {
  DocumentScanner as XrayIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'
import FileDropzone from '../components/upload/FileDropzone'
import ImagePreview from '../components/upload/ImagePreview'
import LungLoader from '../components/common/LungLoader'

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

interface MutationVars {
  file: File
  patientNumber: string
  analysisType: string
}

const XrayAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [patientNumber, setPatientNumber] = useState('')
  const [analysisType, setAnalysisType] = useState('basic')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const { data: patientsData } = useQuery('patients', async () => {
    const res = await fetch('/api/patients')
    return res.json()
  })

  // Explicitly typing useMutation<Data, Error, Variables>
  const analysisMutation = useMutation<AnalysisResult, Error, MutationVars>(
    async (vars) => {
      const formData = new FormData()
      formData.append('file', vars.file)
      formData.append('patient_number', vars.patientNumber)

      let endpoint = '/api/analyze/xray/basic'
      if (vars.analysisType === 'visualization') endpoint = '/api/analyze/xray/visualization'

      const response = await fetch(endpoint, { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Analysis failed')
      return response.json()
    },
    {
      onSuccess: (data) => {
        setResult(data)
        toast.success('Analysis Complete')
      },
      onError: (error) => {
        toast.error(error.message)
      }
    }
  )

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>X-Ray Analysis</Typography>
        <Typography color="text.secondary">Upload chest radiographs for automated detection.</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>1. Image Upload</Typography>
                  {!selectedFile ? (
                    <FileDropzone
                      onFileSelect={(f) => { setSelectedFile(f); setResult(null); }}
                      accept={{ 'image/*': ['.jpg', '.png'] }}
                      selectedFile={selectedFile}
                      icon={<XrayIcon />}
                      title="Upload X-Ray"
                      subtitle="JPG or PNG"
                      color="primary"
                    />
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      <ImagePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>2. Configuration</Typography>
                  <Stack spacing={2}>
                    <TextField
                      select
                      fullWidth
                      label="Patient"
                      size="small"
                      value={patientNumber}
                      onChange={(e) => setPatientNumber(e.target.value)}
                    >
                      {patientsData?.patients?.map((p: any) => (
                        <MenuItem key={p.patient_number} value={p.patient_number}>{p.name}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      label="Model"
                      size="small"
                      value={analysisType}
                      onChange={(e) => setAnalysisType(e.target.value)}
                    >
                      <MenuItem value="basic">Detection Only</MenuItem>
                      <MenuItem value="visualization">With Heatmap</MenuItem>
                    </TextField>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={!selectedFile || !patientNumber || analysisMutation.isLoading}
                  onClick={() => {
                    if (selectedFile) {
                      analysisMutation.mutate({ file: selectedFile, patientNumber, analysisType })
                    }
                  }}
                  startIcon={<PlayIcon />}
                >
                  Run Analysis
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', minHeight: 400 }}>
            <CardContent>
              {analysisMutation.isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                   <LungLoader />
                </Box>
              ) : result ? (
                <Stack spacing={2}>
                   <Alert severity={result.result.label === 'Normal' ? 'success' : 'warning'}>
                     <Typography variant="h6" fontWeight={700}>
                       Result: {result.result.label} ({result.result.confidence}%)
                     </Typography>
                   </Alert>

                   {result.detailed_analysis && (
                     <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                       <ReactMarkdown>{result.detailed_analysis}</ReactMarkdown>
                     </Box>
                   )}

                   <Stack direction="row" spacing={2}>
                      {result.report_path && (
                        <Button variant="outlined" onClick={() => window.open(`/api/download/report/${result.report_path?.split('/').pop()}`, '_blank')}>
                          Download Report
                        </Button>
                      )}
                      {result.visualization_path && (
                         <Button variant="contained" onClick={() => window.open(`/static/outputs/${result.visualization_path?.split('/').pop()}`, '_blank')}>
                           View Heatmap
                         </Button>
                      )}
                   </Stack>
                </Stack>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: 'text.secondary' }}>
                  <Typography>Results will appear here</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default XrayAnalysis