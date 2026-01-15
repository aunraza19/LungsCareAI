import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  Fade,
  Stack
} from '@mui/material'
import {
  Hearing as AudioIcon,
  LocalHospital as XrayIcon,
  PersonAdd as RegisterIcon,
  Chat as ChatIcon,
  ArrowForward as ArrowIcon,
  Air as LungIcon
} from '@mui/icons-material'
import DemoControls from '../components/common/DemoControls'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: patientsData, refetch } = useQuery('patients', async () => {
    const response = await fetch('/api/patients')
    return response.json()
  })

  const hasPatients = patientsData?.patients && patientsData.patients.length > 0

  const handleDataChange = () => {
    refetch()
    queryClient.invalidateQueries('patients')
  }

  const analysisTools = [
    {
      title: 'Audio Analysis',
      description: 'Analyze lung sounds with AI-powered classification',
      icon: <AudioIcon sx={{ fontSize: 48 }} />,
      path: '/audio-analysis',
      color: '#1976d2'
    },
    {
      title: 'X-ray Analysis',
      description: 'Detect lung conditions from chest X-ray images',
      icon: <XrayIcon sx={{ fontSize: 48 }} />,
      path: '/xray-analysis',
      color: '#4db6ac'
    },
    {
      title: 'AI Assistant',
      description: 'Chat with medical AI for health information',
      icon: <ChatIcon sx={{ fontSize: 48 }} />,
      path: '/chat',
      color: '#66b2ff'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <DemoControls onDataLoaded={handleDataChange} />

      <Fade in timeout={500}>
        <Box>
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <LungIcon
              sx={{
                fontSize: 80,
                color: 'secondary.main',
                mb: 2,
                animation: 'breathe 3s ease-in-out infinite',
              }}
            />
            <Typography variant="h3" component="h1" gutterBottom fontWeight="700">
              LungsCare AI
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              AI-Powered Lung Analysis System for Healthcare Professionals
            </Typography>
          </Box>

          {/* Status Alert */}
          {hasPatients ? (
            <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                {patientsData.patients.length} patient(s) registered. You can start analysis.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
              <Typography variant="body1" fontWeight={600}>
                Get started by registering your first patient
              </Typography>
            </Alert>
          )}

          {/* Quick Actions */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<RegisterIcon />}
              onClick={() => navigate('/register')}
              sx={{ py: 2 }}
            >
              Register New Patient
            </Button>
            {hasPatients && (
              <Button
                variant="outlined"
                size="large"
                fullWidth
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/reports')}
                sx={{ py: 2 }}
              >
                View Reports
              </Button>
            )}
          </Stack>

          {/* Analysis Tools */}
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            Analysis Tools
          </Typography>

          <Grid container spacing={3}>
            {analysisTools.map((tool, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                    <Box sx={{ color: tool.color, mb: 2 }}>
                      {tool.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {tool.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {tool.description}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(tool.path)}
                      disabled={!hasPatients}
                      sx={{
                        bgcolor: tool.color,
                        '&:hover': { bgcolor: tool.color, opacity: 0.9 }
                      }}
                    >
                      {!hasPatients ? 'Register Patient First' : 'Open Tool'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>
    </Container>
  )
}

export default Home
