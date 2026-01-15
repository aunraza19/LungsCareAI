import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Collapse,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material'
import {
  Terminal,
  Refresh,
  BugReport,
  Close,
  KeyboardArrowUp,
  KeyboardArrowDown
} from '@mui/icons-material'
import { toast } from 'react-toastify'

interface DemoControlsProps {
  onDataLoaded?: () => void
}

const DemoControls: React.FC<DemoControlsProps> = ({ onDataLoaded }) => {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  const handleSeedData = async () => {
    setIsSeeding(true)
    try {
      const response = await fetch('/api/seed-db', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to seed database')

      const data = await response.json()
      toast.success(`System injected: ${data.message}`)
      if (onDataLoaded) onDataLoaded()
    } catch (error) {
      toast.error('Injection failed')
      console.error(error)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <Collapse in={isOpen} orientation="vertical">
        <Paper
          sx={{
            mb: 2,
            p: 2,
            width: 300,
            bgcolor: alpha('#000', 0.9),
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 2
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Terminal color="primary" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontFamily: 'JetBrains Mono', color: 'primary.main' }}>
                DEV_CONSOLE
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'text.secondary' }}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>

          <Typography variant="caption" color="text.secondary" paragraph>
            Use these controls to simulate data states for demonstration purposes.
          </Typography>

          <Stack spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BugReport />}
              onClick={handleSeedData}
              disabled={isSeeding}
              sx={{
                fontFamily: 'JetBrains Mono',
                justifyContent: 'flex-start',
                borderColor: alpha(theme.palette.primary.main, 0.3)
              }}
            >
              {isSeeding ? 'INJECTING...' : 'SEED MOCK DATA'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              color="secondary"
              sx={{
                fontFamily: 'JetBrains Mono',
                justifyContent: 'flex-start',
                borderColor: alpha(theme.palette.secondary.main, 0.3)
              }}
            >
              SYSTEM REBOOT
            </Button>
          </Stack>
        </Paper>
      </Collapse>

      {!isOpen && (
        <Tooltip title="Developer Controls" placement="left">
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <Terminal />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}

export default DemoControls