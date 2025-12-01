import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
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
  Avatar
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
  Favorite as HeartIcon
} from '@mui/icons-material'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  // Fetch patients to check if any are registered
  const { data: patientsData } = useQuery('patients', async () => {
    const response = await fetch('/api/patients')
    return response.json()
  })

  const hasPatients = patientsData?.patients && patientsData.patients.length > 0

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
      icon: <XrayIcon sx={{ fontSize: 50, color: '#dc004e' }} />,
      path: '/xray-analysis',
      color: '#dc004e',
      features: ['Multi-class detection', 'Visual heatmaps', 'Confidence scoring']
    },
    {
      title: 'AI Medical Assistant',
      description: 'Intelligent chat assistant for medical consultations',
      icon: <ChatIcon sx={{ fontSize: 50, color: '#ed6c02' }} />,
      path: '/chat',
      color: '#ed6c02',
      features: ['RAG-powered responses', '24/7 availability', 'Medical knowledge base']
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper 
        elevation={6}
        sx={{ 
          p: 6, 
          mb: 6, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: 3
        }}
      >
          <Box 
            sx={{ 
              width: 120, 
              height: 120, 
              mx: 'auto',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'white',
              borderRadius: '50%',
              p: 2
            }}
          >
            <img 
              src="/assets/lungs-care-ai-logo.png" 
              alt="LungsCare AI Logo" 
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'contain'
              }} 
            />
          </Box>
          
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            LUNGS CAREAI
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Advanced AI-Powered Lung Analysis for Healthcare Excellence
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Chip 
              icon={<AiIcon />}
              label="AI-Powered Analysis" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1rem', py: 2 }} 
            />
            <Chip 
              icon={<SpeedIcon />}
              label="Real-time Results" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1rem', py: 2 }} 
            />
            <Chip 
              icon={<SecurityIcon />}
              label="Medical Grade Security" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1rem', py: 2 }} 
            />
          </Box>
        </Paper>

      {/* Getting Started Workflow */}
      <Paper elevation={3} sx={{ p: 4, mb: 6, borderRadius: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" fontWeight="600">
            {hasPatients ? 'Welcome Back!' : 'Get Started in 3 Simple Steps'}
          </Typography>
          
          {hasPatients ? (
            <Box textAlign="center" sx={{ py: 3 }}>
              <Alert severity="success" sx={{ mb: 3, fontSize: '1.1rem' }}>
                <Typography variant="h6">
                  You have {patientsData.patients.length} patient(s) registered. Ready to perform AI analysis!
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
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="600">
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
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' },
              py: 1.5,
              px: 4,
              fontSize: '1.1rem'
            }}
          >
            Register Your First Patient
          </Button>
        </Paper>
      )}
    </Container>
  )
}

export default Home
