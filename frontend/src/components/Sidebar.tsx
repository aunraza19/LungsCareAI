// frontend/src/components/Sidebar.tsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Drawer
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  PersonAdd as RegisterIcon,
  GraphicEq as AudioIcon,
  DocumentScanner as XrayIcon,
  SmartToy as BotIcon,
  Description as ReportIcon
} from '@mui/icons-material'

const NAV_WIDTH = 260

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile }) => {
  const location = useLocation()

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'New Patient', icon: <RegisterIcon />, path: '/register' },
    { text: 'Audio Analysis', icon: <AudioIcon />, path: '/audio-analysis' },
    { text: 'X-Ray Scan', icon: <XrayIcon />, path: '/xray-analysis' },
    { text: 'AI Assistant', icon: <BotIcon />, path: '/chat' },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
  ]

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Only - Centered and Big */}
      <Box sx={{ 
        p: 0,
        m: 0,
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'hidden',
        lineHeight: 0
      }}>
        <img 
          src="/assets/lungs-care-ai-logo.png"
          alt="Logo" 
          style={{ width: '120%', height: 'auto', objectFit: 'contain', display: 'block', margin: 0, padding: 0 }}
        />
      </Box>

      {/* Note: Title text removed from sidebar as requested */}

      <Divider />

      <List sx={{ px: 2, pt: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? onToggle : undefined}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'inherit' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: NAV_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: NAV_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: NAV_WIDTH, boxSizing: 'border-box', borderRight: '1px solid #e2e8f0' },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar