import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { 
  Tabs, 
  Tab, 
  Box, 
  Paper,
  useTheme,
  useMediaQuery 
} from '@mui/material'
import {
  Home as HomeIcon,
  PersonAdd as PersonAddIcon,
  Hearing as HearingIcon,
  LocalHospital as XrayIcon,
  Chat as ChatIcon,
  Description as ReportsIcon
} from '@mui/icons-material'

const Navigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const tabs = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/register', label: 'Register', icon: <PersonAddIcon /> },
    { path: '/audio-analysis', label: 'Audio Analysis', icon: <HearingIcon /> },
    { path: '/xray-analysis', label: 'X-ray Analysis', icon: <XrayIcon /> },
    { path: '/chat', label: 'AI Chat', icon: <ChatIcon /> },
    { path: '/reports', label: 'Reports', icon: <ReportsIcon /> },
  ]

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue)
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        borderRadius: 0,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Box sx={{ px: 2 }}>
        <Tabs
          value={location.pathname}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.path}
              label={isMobile ? undefined : tab.label}
              icon={tab.icon}
              iconPosition={isMobile ? "top" : "start"}
              value={tab.path}
              component={Link}
              to={tab.path}
              sx={{
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Paper>
  )
}

export default Navigation
