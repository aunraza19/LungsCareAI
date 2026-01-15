import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Avatar,
  Fade
} from '@mui/material'
import {
  Hearing as AudioIcon,
  LocalHospital as XrayIcon,
  PersonAdd as RegisterIcon,
  Chat as ChatIcon,
  Dashboard as DashboardIcon,
  Psychology as AiIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  VerifiedUser as VerifiedIcon,
  ArrowForward as ArrowIcon,
  Favorite as HeartIcon,
  Air as LungIcon
} from '@mui/icons-material'
import DemoControls from '../components/common/DemoControls'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0)
  // Fetch patients to check if any are registered
  const { data: patientsData, refetch } = useQuery('patients', async () => {
    const response = await fetch('/api/patients')
    return response.json()
  })

  const hasPatients = patientsData?.patients && patientsData.patients.length > 0

  const handleDataChange = () => {
    refetch()
    queryClient.invalidateQueries('patients')
  }

  const steps = [
    {
      title: 'Register Your First Patient',
      description: 'Start by registering a patient to begin using the AI analysis features',
      action: 'Register Patient',
      path: '/register',
      icon: <RegisterIcon sx={{ fontSize: 60, color: '#2e7d32' }} />,
      completed: hasPatients
    },
    {
      title: 'Access AI Analysis Tools',
      description: 'Use our advanced AI to analyze lung sounds and chest X-rays',
      action: 'View Dashboard',
      path: '/audio-analysis',
      icon: <AiIcon sx={{ fontSize: 60, color: '#1976d2' }} />,
      completed: false
    },
    {
      title: 'Generate Medical Reports',
      description: 'AI generates comprehensive medical reports and recommendations',
      action: 'View Reports',
      path: '/reports',
      icon: <VerifiedIcon sx={{ fontSize: 60, color: '#ed6c02' }} />,
      completed: false
    }
  ]

  const analysisTools = [
    {
      title: 'Audio Lung Analysis',
      description: 'AI-powered analysis of lung sounds with explainable AI features',
      icon: <AudioIcon sx={{ fontSize: 50, color: '#1976d2' }} />,
      path: '/audio-analysis',
      color: '#1976d2',
      features: ['Real-time classification', 'Gradient XAI', 'Attention visualization']
    },
    {
      title: 'Chest X-ray Analysis',
      description: 'Deep learning classification for multiple lung conditions',
      icon: <XrayIcon sx={{ fontSize: 50, color: '#4db6ac' }} />,
      path: '/xray-analysis',
      color: '#4db6ac',
      features: ['Multi-class detection', 'Visual heatmaps', 'Confidence scoring']
    },
    {
      title: 'AI Medical Assistant',
      description: 'Intelligent chat assistant for medical consultations',
      icon: <ChatIcon sx={{ fontSize: 50, color: '#66b2ff' }} />,
      path: '/chat',
      color: '#66b2ff',
      features: ['RAG-powered responses', 'Voice input', 'Medical knowledge base']
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Demo Controls - for testing/demo purposes */}
      <DemoControls onDataLoaded={handleDataChange} />

      <Fade in timeout={800}>
        <div>
      {/* Hero Section */}
      <Paper 
        elevation={6}
        sx={{ 
          p: 6, 
          mb: 6, 
          background: 'linear-gradient(135deg, #0a1929 0%, #132f4c 50%, #1a3a5c 100%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid rgba(77, 182, 172, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(77, 182, 172, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
          {/* Breathing Lung Icon */}
          <Box 
            sx={{ 
              width: 140, 
              height: 140, 
              mx: 'auto',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(77, 182, 172, 0.15)',
              borderRadius: '50%',
              border: '2px solid rgba(77, 182, 172, 0.3)',
              position: 'relative',
            }}
          >
            <LungIcon 
              sx={{ 
                fontSize: 80, 
                color: '#4db6ac',
                animation: 'breathe 3s ease-in-out infinite',
                filter: 'drop-shadow(0 0 15px rgba(77, 182, 172, 0.5))',
              }} 
            />
          </Box>
          
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #4db6ac 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LUNGSCAREAI
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
            Advanced AI-Powered Lung Analysis for Healthcare Excellence
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Chip 
              icon={<AiIcon sx={{ color: '#4db6ac !important' }} />}
              label="AI-Powered Analysis" 
              sx={{ 
                bgcolor: 'rgba(77, 182, 172, 0.2)', 
                color: 'white', 
                fontSize: '1rem', 
                py: 2,
                border: '1px solid rgba(77, 182, 172, 0.4)',
              }} 
            />
            <Chip 
              icon={<SpeedIcon sx={{ color: '#66b2ff !important' }} />}
              label="Real-time Results" 
              sx={{ 
                bgcolor: 'rgba(102, 178, 255, 0.2)', 
                color: 'white', 
                fontSize: '1rem', 
                py: 2,
                border: '1px solid rgba(102, 178, 255, 0.4)',
              }} 
            />
            <Chip 
              icon={<SecurityIcon sx={{ color: '#81c784 !important' }} />}
              label="Medical Grade Security" 
              sx={{ 
                bgcolor: 'rgba(129, 199, 132, 0.2)', 
                color: 'white', 
                fontSize: '1rem', 
                py: 2,
                border: '1px solid rgba(129, 199, 132, 0.4)',
              }} 
            />
          </Box>
        </Paper>

      {/* Getting Started Workflow */}
      <Paper elevation={3} sx={{ p: 4, mb: 6, borderRadius: 3 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" fontWeight="700">
            {hasPatients ? '👋 Welcome Back!' : '🚀 Get Started in 3 Simple Steps'}
          </Typography>
          
          {hasPatients ? (
            <Box textAlign="center" sx={{ py: 3 }}>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  fontSize: '1.1rem',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6">
                  ✅ You have {patientsData.patients.length} patient(s) registered. Ready to perform AI analysis!
                </Typography>
              </Alert>
              
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate('/audio-analysis')}
                    sx={{ 
                      py: 2, 
                      fontSize: '1.1rem',
                      bgcolor: '#1976d2',
                      '&:hover': { bgcolor: '#1565c0' }
                    }}
                  >
                    Open Dashboard
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<RegisterIcon />}
                    onClick={() => navigate('/register')}
                    sx={{ py: 2, fontSize: '1.1rem' }}
                  >
                    Add New Patient
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Stepper orientation="vertical" activeStep={currentStep}>
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {step.title}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        {step.icon}
                        <Typography variant="body1" sx={{ my: 2, color: 'text.secondary' }}>
                          {step.description}
                        </Typography>
                        <Button
                          variant={index === 0 ? 'contained' : 'outlined'}
                          size="large"
                          endIcon={<ArrowIcon />}
                          onClick={() => navigate(step.path)}
                          sx={{ 
                            mt: 2,
                            ...(index === 0 && {
                              bgcolor: '#2e7d32',
                              '&:hover': { bgcolor: '#1b5e20' }
                            })
                          }}
                        >
                          {step.action}
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </Paper>

      {/* AI Analysis Tools */}
      <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4, fontWeight: 600 }}>
        AI-Powered Medical Analysis Tools
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {analysisTools.map((tool, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              elevation={4}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderTop: `4px solid ${tool.color}`,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 8px 25px ${tool.color}40`
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  {tool.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="600">
                  {tool.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {tool.description}
                </Typography>
                <Box sx={{ textAlign: 'left' }}>
                  {tool.features.map((feature, idx) => (
                    <Chip
                      key={idx}
                      label={feature}
                      size="small"
                      sx={{ 
                        mb: 1, 
                        mr: 1, 
                        bgcolor: `${tool.color}15`,
                        color: tool.color,
                        fontSize: '0.75rem'
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', p: 3 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  fullWidth
                  onClick={() => navigate(tool.path)}
                  disabled={!hasPatients && tool.path !== '/register'}
                  sx={{ 
                    bgcolor: tool.color,
                    '&:hover': { bgcolor: `${tool.color}dd` },
                    py: 1.5,
                    fontSize: '1rem'
                  }}
                >
                  {!hasPatients && tool.path !== '/register' ? 'Register Patient First' : 'Access Tool'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action */}
      {!hasPatients && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(77, 182, 172, 0.1) 0%, rgba(102, 178, 255, 0.1) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(77, 182, 172, 0.2)',
          }}
        >
          <LungIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="700">
            Ready to Start Your AI-Powered Medical Analysis?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Register your first patient to unlock all the powerful AI analysis features
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<RegisterIcon />}
            onClick={() => navigate('/register')}
            sx={{ 
              bgcolor: 'secondary.main',
              '&:hover': { bgcolor: 'secondary.dark' },
              py: 1.5,
              px: 4,
              fontSize: '1.1rem'
            }}
          >
            Register Your First Patient
          </Button>
        </Paper>
      )}
      </div>
      </Fade>
    </Container>
  )
}

export default Home
