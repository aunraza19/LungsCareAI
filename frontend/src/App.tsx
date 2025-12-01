import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material'
import { LocalHospital } from '@mui/icons-material'

import Home from './pages/Home'
import PatientRegistration from './pages/PatientRegistration'
import AudioAnalysis from './pages/AudioAnalysis'
import XrayAnalysis from './pages/XrayAnalysis'
import ChatBot from './pages/ChatBot'
import Reports from './pages/Reports'
import Navigation from './components/Navigation'

const App: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Box className="logo-container" sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/assets/lungs-care-ai-logo.png" 
              alt="LungsCare AI Logo" 
              style={{ 
                height: '40px', 
                width: 'auto', 
                marginRight: '12px' 
              }} 
            />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              LUNGSCAREAI
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ ml: 2, opacity: 0.8 }}>
            AI-Powered Lung Analysis System
          </Typography>
        </Toolbar>
      </AppBar>

      <Navigation />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<PatientRegistration />} />
          <Route path="/audio-analysis" element={<AudioAnalysis />} />
          <Route path="/xray-analysis" element={<XrayAnalysis />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Container>
    </Box>
  )
}

export default App
