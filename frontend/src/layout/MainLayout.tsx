// frontend/src/layout/MainLayout.tsx
import React, { useState, ReactNode } from 'react'
import { Box, useMediaQuery, useTheme, IconButton, AppBar, Toolbar, Typography, Container } from '@mui/material'
import Sidebar from '../components/Sidebar'
import { Menu as MenuIcon } from '@mui/icons-material'

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [isSidebarOpen, setSidebarOpen] = useState(isDesktop)

  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* Mobile Header */}
      {!isDesktop && (
        <AppBar position="fixed" color="inherit" elevation={1}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleToggleSidebar} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            {/* Mobile Title - Centered */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
               <Typography variant="h6" color="primary" fontWeight={800}>LungsCare AI</Typography>
            </Box>
            {/* Placeholder to balance the menu icon for perfect centering */}
            <Box sx={{ width: 48 }} />
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar (Flex Item) */}
      <Box component="nav" sx={{ width: { md: isSidebarOpen ? 260 : 0 }, flexShrink: 0, transition: 'width 0.3s' }}>
        <Sidebar
          isOpen={isDesktop ? isSidebarOpen : isSidebarOpen}
          onToggle={() => setSidebarOpen(false)}
          isMobile={!isDesktop}
        />
      </Box>

      {/* Main Content (Flex Grow) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: 8, md: 0 }, // Padding for mobile header
          overflowX: 'hidden'
        }}
      >
        {/* Desktop Top Title Bar - Centered */}
        {isDesktop && (
          <Box sx={{
            py: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            bgcolor: 'white'
          }}>
            <Typography variant="h5" color="primary" fontWeight={800} letterSpacing={0.5}>
              LungsCare AI
            </Typography>
          </Box>
        )}

        <Container
          maxWidth="xl"
          sx={{
            py: 4,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start' // Ensure content starts at top
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  )
}

export default MainLayout