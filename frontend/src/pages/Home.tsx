// frontend/src/pages/Home.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  LinearProgress,
  useTheme,
} from '@mui/material'
import {
  Hearing as AudioIcon,
  DocumentScanner as XrayIcon,
  PersonAdd as RegisterIcon,
  SmartToy as BotIcon,
  ArrowForward as ArrowIcon,
  People,
  ModelTraining,
  CheckCircle,
  BarChart
} from '@mui/icons-material'
import DemoControls from '../components/common/DemoControls'
import LungLoader from '../components/common/LungLoader'

// 📊 Data from User's Python Code
const XRAY_METRICS = {
  modelName: "EfficientNetB5 + Coordinate Attention",
  accuracy: 92.21,
  weightedAvg: 92.40,
  classes: [
    { label: "Tuberculosis", score: 100.00 },
    { label: "Pneumonia", score: 99.17 },
    { label: "Effusion", score: 95.69 },
    { label: "Lung Opacity", score: 95.65 },
    { label: "Covid", score: 95.12 },
    { label: "Fibrosis", score: 94.39 },
    { label: "Nodule", score: 88.89 },
    { label: "Mass", score: 87.70 },
    { label: "Control", score: 85.23 },
    { label: "Pneumothorax", score: 83.08 },
  ]
}

const AUDIO_METRICS = {
  modelName: "AST Transformer (Audio Spectrogram)",
  accuracy: 86.27,
  weightedAvg: 87.91,
  classes: [
    { label: "Abnormal", score: 94.44 },
    { label: "Normal", score: 66.67 },
  ]
}

const StatCard = ({ title, value, subtext, icon, color }: any) => (
  <Card sx={{ height: '100%', border: '1px solid #e0e0e0', boxShadow: 'none' }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="subtitle2" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
            {value}
          </Typography>
          {subtext && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {subtext}
            </Typography>
          )}
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}10`, color: color }}>
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
)

const MetricBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
  <Box sx={{ mb: 1, pr: 1 }}>
    <Stack direction="row" justifyContent="space-between" mb={0.2} alignItems="center">
      <Typography variant="body2" fontWeight={500}>{label}</Typography>
      <Typography variant="caption" fontWeight={700} color="text.secondary">{score.toFixed(2)}%</Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={score}
      sx={{
        height: 8,
        borderRadius: 1,
        bgcolor: `${color}20`,
        '& .MuiLinearProgress-bar': { bgcolor: color }
      }}
    />
  </Box>
)

const Home: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()

  const { data: patientsData, refetch, isLoading } = useQuery('patients', async () => {
    const response = await fetch('/api/patients')
    return response.json()
  })

  const totalPatients = patientsData?.patients?.length || 0

  return (
    <Box>
      <DemoControls onDataLoaded={refetch} />

      {/* Header - Reverted: Added back title and subtitle */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={800} color="primary.main">
            Lab Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Deep Learning Performance Metrics & Diagnostics
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<RegisterIcon />}
          onClick={() => navigate('/register')}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Register Patient
        </Button>
      </Box>

      {isLoading ? (
        <LungLoader />
      ) : (
        <>
          {/* 📊 Top Stats Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Patients"
                value={totalPatients}
                subtext="Active Database Records"
                icon={<People />}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Vision Accuracy"
                value={`${XRAY_METRICS.accuracy}%`}
                subtext="Test Set (1219 Samples)"
                icon={<ModelTraining />}
                color={theme.palette.secondary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Audio Accuracy"
                value={`${AUDIO_METRICS.accuracy}%`}
                subtext="Test Set (51 Samples)"
                icon={<ModelTraining />}
                color={theme.palette.warning.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Classes"
                value={XRAY_METRICS.classes.length + AUDIO_METRICS.classes.length}
                subtext="10 Vision + 2 Audio"
                icon={<BarChart />}
                color={theme.palette.info.main}
              />
            </Grid>
          </Grid>

          {/* 🧠 Model Performance Section */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle fontSize="small" color="primary" /> Model Architectures & Precision
          </Typography>

          <Grid container spacing={3} sx={{ mb: 5 }}>
            {/* X-Ray Model Card */}
            <Grid item xs={12} md={7}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Box sx={{ p: 1, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                      <XrayIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{XRAY_METRICS.modelName}</Typography>
                      <Typography variant="body2" color="text.secondary">10-Class Dataset • GPU P100 Optimized</Typography>
                    </Box>
                  </Stack>

                  {/* Horizontal Overall Metrics */}
                  <Stack direction="row" spacing={4} sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">OVERALL ACCURACY</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">{XRAY_METRICS.accuracy}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">WEIGHTED PRECISION</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">{XRAY_METRICS.weightedAvg}%</Typography>
                    </Box>
                  </Stack>

                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, letterSpacing: 1, color: 'text.secondary' }}>
                    CLASS-WISE PRECISION
                  </Typography>

                  {/* Vertical Class List (Longitude) */}
                  <Grid container spacing={0}>
                    {XRAY_METRICS.classes.map((cls) => (
                      <Grid item xs={12} sm={6} key={cls.label}>
                         <MetricBar label={cls.label} score={cls.score} color={theme.palette.primary.main} />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Audio Model Card */}
            <Grid item xs={12} md={5}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Box sx={{ p: 1, bgcolor: 'secondary.light', color: 'secondary.contrastText', borderRadius: 2 }}>
                      <AudioIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>Audio Spectrogram Transformer</Typography>
                      <Typography variant="body2" color="text.secondary">MIT/ast-finetuned • 30 Epochs</Typography>
                    </Box>
                  </Stack>

                   {/* Horizontal Overall Metrics */}
                   <Stack direction="row" spacing={4} sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">OVERALL ACCURACY</Typography>
                      <Typography variant="h6" fontWeight={700} color="secondary">{AUDIO_METRICS.accuracy}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">WEIGHTED PRECISION</Typography>
                      <Typography variant="h6" fontWeight={700} color="secondary">{AUDIO_METRICS.weightedAvg}%</Typography>
                    </Box>
                  </Stack>

                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, letterSpacing: 1, color: 'text.secondary' }}>
                    CLASS-WISE PRECISION
                  </Typography>

                  {/* Using Grid to match X-Ray style */}
                  <Grid container spacing={0}>
                    {AUDIO_METRICS.classes.map((cls) => (
                      <Grid item xs={12} key={cls.label}>
                        <MetricBar label={cls.label} score={cls.score} color={theme.palette.secondary.main} />
                      </Grid>
                    ))}
                  </Grid>

                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 🛠️ Tools Section */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Launch Diagnostic Modules</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ color: 'primary.main' }}><XrayIcon fontSize="large" /></Box>
                    <Typography variant="h6" fontWeight={700}>X-Ray Diagnostics</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload chest radiograph (JPG/PNG). Model classifies against 10 pulmonary conditions including Tuberculosis and Covid.
                    </Typography>
                    <Button variant="outlined" endIcon={<ArrowIcon />} onClick={() => navigate('/xray-analysis')}>
                      Open Vision Tool
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ color: 'secondary.main' }}><AudioIcon fontSize="large" /></Box>
                    <Typography variant="h6">Audio Diagnostics</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload lung sound recordings (WAV/MP3). AST model detects respiratory anomalies like Wheezing and Crackles.
                    </Typography>
                    <Button variant="outlined" color="secondary" endIcon={<ArrowIcon />} onClick={() => navigate('/audio-analysis')}>
                      Open Audio Tool
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ color: 'info.main' }}><BotIcon fontSize="large" /></Box>
                    <Typography variant="h6">MedGemma Consultant</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Interact with the LLM assistant for report summarization, patient history correlation, and second opinions.
                    </Typography>
                    <Button variant="outlined" color="info" endIcon={<ArrowIcon />} onClick={() => navigate('/chat')}>
                      Start Chat
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default Home