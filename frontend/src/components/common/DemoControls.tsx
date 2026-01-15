import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Collapse,
  Alert,
  Divider,
  Chip,
  alpha
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  DataObject as DataIcon,
  Delete as DeleteIcon,
  ExpandMore,
  ExpandLess,
  Science as DemoIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'

interface DemoControlsProps {
  onDataLoaded?: () => void
}

const DemoControls: React.FC<DemoControlsProps> = ({ onDataLoaded }) => {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadSampleData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/demo/load-sample-data', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        toast.success('🎉 Sample data loaded! Refresh to see patients.')
        onDataLoaded?.()
      } else {
        toast.error('Failed to load sample data')
      }
    } catch (error) {
      toast.error('Error loading sample data')
    } finally {
      setLoading(false)
    }
  }

  const clearData = async () => {
    if (!confirm('Are you sure you want to clear all patient data?')) return

    setLoading(true)
    try {
      const response = await fetch('/api/demo/clear-data', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        toast.success('Data cleared successfully')
        onDataLoaded?.()
      } else {
        toast.error('Failed to clear data')
      }
    } catch (error) {
      toast.error('Error clearing data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        overflow: 'hidden',
        border: 1,
        borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DemoIcon sx={{ color: 'warning.main' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Demo Controls
          </Typography>
          <Chip
            label="DEV"
            size="small"
            color="warning"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
            These controls are for demo/testing purposes. Use them to quickly populate or reset the database.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DataIcon />}
              onClick={loadSampleData}
              disabled={loading}
              size="small"
            >
              Load Sample Patients
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={clearData}
              disabled={loading}
              size="small"
            >
              Clear All Data
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              size="small"
            >
              Refresh Page
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Sample data includes 5 patients with various analysis reports (Pneumonia, COVID, TB, Normal cases).
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default DemoControls

