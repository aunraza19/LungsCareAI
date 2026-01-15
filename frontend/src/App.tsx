import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Container, AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material'
import { DarkMode, LightMode, Keyboard as KeyboardIcon } from '@mui/icons-material'

import Home from './pages/Home'
import PatientRegistration from './pages/PatientRegistration'
import AudioAnalysis from './pages/AudioAnalysis'
import XrayAnalysis from './pages/XrayAnalysis'
import ChatBot from './pages/ChatBot'
import Reports from './pages/Reports'
import Navigation from './components/Navigation'
import { useThemeContext } from './theme/ThemeProvider'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

const App: React.FC = () => {
  const { darkMode, toggleDarkMode } = useThemeContext()
  const { showShortcutsHelp } = useKeyboardShortcuts()

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box className="logo-container" sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/assets/lungs-care-ai-logo.png" 
              alt="LungsCare AI Logo" 
              style={{ 
                height: '40px', 
                width: 'auto', 
                marginRight: '12px',
                filter: darkMode ? 'brightness(1.1)' : 'none'
              }}
            />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 'bold',
                background: darkMode
                  ? 'linear-gradient(135deg, #66b2ff 0%, #4db6ac 100%)'
                  : 'inherit',
                backgroundClip: darkMode ? 'text' : 'inherit',
                WebkitBackgroundClip: darkMode ? 'text' : 'inherit',
                WebkitTextFillColor: darkMode ? 'transparent' : 'inherit',
              }}
            >
              LUNGSCAREAI
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ ml: 2, opacity: 0.8, flex: 1 }}>
            AI-Powered Lung Analysis System
          </Typography>

          {/* Keyboard Shortcuts Help */}
          <Tooltip title="Keyboard Shortcuts (Ctrl+/)">
            <IconButton
              onClick={showShortcutsHelp}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <KeyboardIcon />
            </IconButton>
          </Tooltip>

          {/* Theme Toggle Button */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={toggleDarkMode}
              color="inherit"
              sx={{
                ml: 1,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(180deg)',
                }
              }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
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
