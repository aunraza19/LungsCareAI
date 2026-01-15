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
import { GraphicEq as AudioIcon, PlayArrow as PlayIcon } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'
import FileDropzone from '../components/upload/FileDropzone'
import AudioWaveform from '../components/upload/AudioWaveform'
import LungLoader from '../components/common/LungLoader'

// Define the shape of the response
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

// Define the shape of the variables passed to mutate
interface MutationVars {
  file: File
  patientNumber: string
  analysisType: string
}

const AudioAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [patientNumber, setPatientNumber] = useState('')
  const [analysisType, setAnalysisType] = useState('basic')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const { data: patientsData } = useQuery('patients', async () => {
    const res = await fetch('/api/patients')
    return res.json()
  })

  // Explicit generics: <Data, Error, Variables>
  const analysisMutation = useMutation<AnalysisResult, Error, MutationVars>(
    async (vars) => {
      const formData = new FormData()
      formData.append('file', vars.file)
      formData.append('patient_number', vars.patientNumber)

      let endpoint = '/api/analyze/audio/basic'
      if (vars.analysisType === 'gradient') endpoint = '/api/analyze/audio/gradient'

      const response = await fetch(endpoint, { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Analysis failed')
      return response.json()
    },
    {
      onSuccess: (data) => {
        setResult(data)
        toast.success('Analysis Complete')
      },
      onError: (err) => {
        toast.error(err.message)
      }
    }
  )

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Audio Analysis</Typography>
        <Typography color="text.secondary">Analyze lung sounds (wheezing, crackles).</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>1. Audio Upload</Typography>
                  {!selectedFile ? (
                    <FileDropzone
                      onFileSelect={(f) => { setSelectedFile(f); setResult(null); }}
                      accept={{ 'audio/*': ['.wav', '.mp3'] }}
                      selectedFile={selectedFile}
                      icon={<AudioIcon />}
                      title="Upload Audio"
                      subtitle="WAV or MP3"
                      color="secondary"
                    />
                  ) : (
                    <Box>
                      <AudioWaveform file={selectedFile} height={80} />
                      <Button size="small" onClick={() => setSelectedFile(null)} sx={{ mt: 1 }}>Remove</Button>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>2. Settings</Typography>
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
                      label="Method"
                      size="small"
                      value={analysisType}
                      onChange={(e) => setAnalysisType(e.target.value)}
                    >
                      <MenuItem value="basic">Standard</MenuItem>
                      <MenuItem value="gradient">Gradient XAI</MenuItem>
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
                  Analyze
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
                </Stack>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: 'text.secondary' }}>
                  <Typography>Results area</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AudioAnalysis