import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { 
  Tabs, 
  Tab, 
  Box, 
  Paper,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material'
import {
  Home as HomeIcon,
  PersonAdd as PersonAddIcon,
  Hearing as HearingIcon,
  LocalHospital as XrayIcon,
  Chat as ChatIcon,
  Description as ReportsIcon,
  Air as LungIcon
} from '@mui/icons-material'

const Navigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isDark = theme.palette.mode === 'dark'

  const tabs = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/register', label: 'Register', icon: <PersonAddIcon /> },
    { path: '/audio-analysis', label: 'Audio', icon: <HearingIcon /> },
    { path: '/xray-analysis', label: 'X-ray', icon: <XrayIcon /> },
    { path: '/chat', label: 'AI Chat', icon: <ChatIcon /> },
    { path: '/reports', label: 'Reports', icon: <ReportsIcon /> },
  ]

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue)
  }

  return (
    <Paper 
      elevation={0}
      sx={{
        borderRadius: 0,
        bgcolor: isDark ? alpha('#0a1929', 0.9) : 'background.paper',
        backdropFilter: 'blur(10px)',
        borderBottom: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'divider',
      }}
    >
      <Box sx={{ px: 2 }}>
        <Tabs
          value={location.pathname}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          allowScrollButtonsMobile
          centered={!isMobile}
          sx={{
            minHeight: 56,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(90deg, #4db6ac 0%, #66b2ff 100%)',
            },
            '& .MuiTabs-flexContainer': {
              gap: 1,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.path}
              label={isMobile ? undefined : tab.label}
              icon={tab.icon}
              iconPosition="start"
              value={tab.path}
              component={Link}
              to={tab.path}
              sx={{
                minHeight: 56,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                color: 'text.secondary',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(77, 182, 172, 0.1)' : 'action.hover',
                  color: 'primary.main',
                },
                '&.Mui-selected': {
                  color: '#4db6ac',
                  fontWeight: 600,
                },
                '& .MuiTab-iconWrapper': {
                  marginRight: isMobile ? 0 : 1,
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
