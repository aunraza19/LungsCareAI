import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { darkTheme } from './theme'
import MainLayout from './layout/MainLayout'

// Pages
import Home from './pages/Home'
import PatientRegistration from './pages/PatientRegistration'
import AudioAnalysis from './pages/AudioAnalysis'
import XrayAnalysis from './pages/XrayAnalysis'
import ChatBot from './pages/ChatBot'
import Reports from './pages/Reports'

import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

const App: React.FC = () => {
  // Initialize hooks (Global listeners)
  useKeyboardShortcuts()

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {/* MainLayout now handles the global structure (Sidebar + Content Area).
        The TopBar and Navigation components are replaced by MainLayout.
      */}
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<PatientRegistration />} />
          <Route path="/audio-analysis" element={<AudioAnalysis />} />
          <Route path="/xray-analysis" element={<XrayAnalysis />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </MainLayout>
    </ThemeProvider>
  )
}

export default App