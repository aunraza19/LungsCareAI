import React from 'react'
import { Card, CardContent, Typography, Box, Chip, Fade, alpha } from '@mui/material'
import {
  Psychology as BrainIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material'

interface SecondOpinionProps {
  primaryDiagnosis: string
  confidence: number
  analysisType?: 'audio' | 'xray'
}

// Generate contextual second opinions based on diagnosis
const getSecondOpinionData = (diagnosis: string, confidence: number, type: 'audio' | 'xray') => {
  const isAudio = type === 'audio'

  // Audio-based second opinions
  const audioOpinions: Record<string, { opinion: string; differentials: string[] }> = {
    'Normal': {
      opinion: 'While the primary analysis indicates normal lung sounds, consider periodic monitoring if the patient reports any respiratory symptoms.',
      differentials: ['Early stage changes', 'Compensated breathing patterns', 'Environmental factors']
    },
    'Abnormal': {
      opinion: 'Abnormal lung sounds detected. Consider correlating with chest X-ray and pulmonary function tests for comprehensive evaluation.',
      differentials: ['Bronchitis', 'Pneumonia', 'Asthma exacerbation', 'COPD', 'Pleural effusion']
    }
  }

  // X-ray based second opinions
  const xrayOpinions: Record<string, { opinion: string; differentials: string[] }> = {
    'COVID': {
      opinion: 'Ground-glass opacities pattern detected. Consider RT-PCR confirmation and assess for secondary bacterial infection.',
      differentials: ['Viral pneumonia', 'ARDS', 'Organizing pneumonia', 'Drug-induced lung injury']
    },
    'Pneumonia': {
      opinion: 'Consolidation pattern suggests bacterial pneumonia. Consider sputum culture and inflammatory markers for targeted therapy.',
      differentials: ['Bacterial pneumonia', 'Aspiration pneumonia', 'Lung abscess', 'Tuberculosis']
    },
    'Tuberculosis': {
      opinion: 'Upper lobe infiltrates suggestive of TB. Recommend sputum AFB smear/culture and Mantoux test for confirmation.',
      differentials: ['Primary TB', 'Reactivation TB', 'Non-tuberculous mycobacteria', 'Fungal infection']
    },
    'Normal': {
      opinion: 'No significant radiological abnormalities detected. Clinical correlation recommended if symptoms persist.',
      differentials: ['Early disease not yet visible', 'Functional respiratory issues', 'Extrapulmonary causes']
    },
    'Lung_Opacity': {
      opinion: 'Opacity detected may represent various pathologies. CT scan recommended for further characterization.',
      differentials: ['Atelectasis', 'Pleural effusion', 'Mass lesion', 'Consolidation']
    },
    'Viral Pneumonia': {
      opinion: 'Bilateral interstitial pattern suggests viral etiology. Monitor for progression and secondary infection.',
      differentials: ['Influenza', 'COVID-19', 'RSV', 'Adenovirus', 'Mycoplasma']
    },
    'Bacterial Pneumonia': {
      opinion: 'Lobar consolidation pattern typical of bacterial infection. Initiate empiric antibiotics pending culture results.',
      differentials: ['Streptococcus pneumoniae', 'Klebsiella', 'Staphylococcus', 'Legionella']
    }
  }

  const opinions = isAudio ? audioOpinions : xrayOpinions
  const data = opinions[diagnosis] || {
    opinion: `The AI detected ${diagnosis} with ${confidence}% confidence. Consider clinical correlation and additional testing if needed.`,
    differentials: ['Further evaluation recommended', 'Clinical correlation advised']
  }

  // Adjust confidence-based messaging
  if (confidence < 70) {
    data.opinion = `⚠️ Lower confidence detection (${confidence}%). ` + data.opinion
  }

  return data
}

const SecondOpinion: React.FC<SecondOpinionProps> = ({
  primaryDiagnosis,
  confidence,
  analysisType = 'xray'
}) => {
  const { opinion, differentials } = getSecondOpinionData(primaryDiagnosis, confidence, analysisType)

  return (
    <Fade in timeout={800}>
      <Card
        sx={{
          mt: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255, 167, 38, 0.15) 0%, rgba(255, 193, 7, 0.1) 100%)'
              : alpha('#ff9800', 0.1),
          border: 2,
          borderColor: 'warning.main',
          borderRadius: 3,
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha('#ff9800', 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BrainIcon sx={{ color: 'warning.main', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="warning.dark">
                AI Second Opinion
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Differential diagnosis consideration
              </Typography>
            </Box>
          </Box>

          {/* Primary Result Summary */}
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Primary: <strong>{primaryDiagnosis}</strong> • Confidence: <strong>{confidence}%</strong>
            </Typography>
          </Box>

          {/* Second Opinion Text */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              mb: 2,
              borderLeft: 4,
              borderColor: 'warning.main',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <LightbulbIcon sx={{ color: 'warning.main', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Clinical Consideration
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              {opinion}
            </Typography>
          </Box>

          {/* Differential Diagnoses */}
          {differentials.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                Also Consider:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {differentials.slice(0, 5).map((diagnosis, idx) => (
                  <Chip
                    key={idx}
                    label={diagnosis}
                    size="small"
                    variant="outlined"
                    color="warning"
                    sx={{
                      borderRadius: 2,
                      '& .MuiChip-label': { fontWeight: 500 }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Disclaimer */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 2,
              p: 1,
              bgcolor: alpha('#ff9800', 0.1),
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            ⚠️ This is supplementary AI analysis for clinical decision support.
            Always consult qualified medical professionals for diagnosis and treatment.
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  )
}

export default SecondOpinion

