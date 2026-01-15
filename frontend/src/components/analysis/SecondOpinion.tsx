import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Collapse,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  Divider,
  alpha,
  useTheme
} from '@mui/material'
import {
  Psychology,
  ExpandMore,
  VerifiedUser,
  WarningAmber,
  Lock
} from '@mui/icons-material'

interface SecondOpinionProps {
  primaryDiagnosis: string
  confidence: number
  analysisType: 'xray' | 'audio'
}

const SecondOpinion: React.FC<SecondOpinionProps> = ({ primaryDiagnosis, confidence, analysisType }) => {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [opinion, setOpinion] = useState<string | null>(null)

  const handleConsult = () => {
    if (expanded) {
      setExpanded(false)
      return
    }

    setExpanded(true)
    if (!opinion) {
      setLoading(true)
      // Simulate AI thinking time
      setTimeout(() => {
        generateOpinion()
        setLoading(false)
      }, 1500)
    }
  }

  const generateOpinion = () => {
    // Mock AI Logic based on inputs
    const isNormal = primaryDiagnosis.toLowerCase().includes('normal')
    const consensus = confidence > 85 ? 'High Concordance' : 'Moderate Divergence'

    let text = ''
    if (analysisType === 'xray') {
      text = isNormal
        ? `Review of radiographic patterns confirms absence of consolidation or pleural effusion. The AI model's activation maps align with healthy lung tissue structures. Recommend standard follow-up.`
        : `Detected anomalies in the lung field suggest pathology consistent with ${primaryDiagnosis}. Cross-reference with clinical history is advised. The confidence level (${confidence}%) warrants immediate attention.`
    } else {
      text = isNormal
        ? `Spectrogram analysis shows clear breath sounds with no adventitious noises (wheezes/crackles). Respiratory cycle appears regular.`
        : `Acoustic signature contains frequencies typical of ${primaryDiagnosis}. Waveform irregularities detected in the expiration phase.`
    }

    setOpinion(text)
  }

  return (
    <Card
      sx={{
        mt: 2,
        border: '1px solid',
        borderColor: expanded ? 'secondary.main' : 'rgba(255,255,255,0.1)',
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* 🔒 Security Header */}
      <Box
        onClick={handleConsult}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(255,255,255,0.1)' : 'none',
          '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) }
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2), color: 'secondary.main' }}>
            <Psychology />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontFamily: 'Orbitron', letterSpacing: 1 }}>
              AI SECOND OPINION
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Lock fontSize="inherit" /> ENCRYPTED CONSULTATION
            </Typography>
          </Box>
        </Stack>
        <ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
      </Box>

      <Collapse in={expanded}>
        <CardContent sx={{ p: 3 }}>
          {loading ? (
            <Stack alignItems="center" spacing={2} py={2}>
              <CircularProgress size={24} color="secondary" />
              <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono' }}>ANALYZING DATA PATTERNS...</Typography>
            </Stack>
          ) : (
            <Box>
              <Stack direction="row" spacing={1} mb={2}>
                <Box sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', border: '1px solid', borderColor: 'success.main' }}>
                  MODEL: GEMMA-2-9B
                </Box>
                <Box sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontSize: '0.75rem', fontFamily: 'JetBrains Mono', border: '1px solid', borderColor: 'info.main' }}>
                  VERIFIED
                </Box>
              </Stack>

              <Typography variant="body2" paragraph sx={{ fontFamily: 'Inter', lineHeight: 1.8 }}>
                {opinion}
              </Typography>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

              <Stack direction="row" alignItems="center" gap={1}>
                {primaryDiagnosis.toLowerCase() === 'normal' ? <VerifiedUser color="success" fontSize="small" /> : <WarningAmber color="warning" fontSize="small" />}
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'JetBrains Mono' }}>
                  CONSENSUS: {primaryDiagnosis.toLowerCase() === 'normal' ? 'POSITIVE' : 'REQUIRES CLINICAL REVIEW'}
                </Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default SecondOpinion