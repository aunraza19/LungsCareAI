import React from 'react'
import { Box, Typography, Zoom, Fade, keyframes } from '@mui/material'
import { CheckCircle, Celebration } from '@mui/icons-material'

// Keyframe animations
const bounceIn = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
`

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`

interface SuccessAnimationProps {
  show: boolean
  message?: string
  subMessage?: string
  size?: 'small' | 'medium' | 'large'
  onComplete?: () => void
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  show,
  message = "Success!",
  subMessage,
  size = 'medium',
  onComplete
}) => {
  const iconSize = {
    small: 48,
    medium: 80,
    large: 120
  }

  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <Zoom in={show} timeout={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        {/* Confetti particles */}
        <Box sx={{ position: 'relative' }}>
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: ['#4db6ac', '#66b2ff', '#81c784', '#ffb74d', '#f48fb1'][i % 5],
                animation: `${confetti} 1.5s ease-out ${i * 0.1}s`,
                left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 60}%`,
                top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 60}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Main success icon */}
          <CheckCircle
            sx={{
              fontSize: iconSize[size],
              color: 'success.main',
              animation: `${bounceIn} 0.6s ease-out, ${pulse} 2s ease-in-out 0.6s infinite`,
              filter: 'drop-shadow(0 0 20px rgba(76, 175, 80, 0.5))',
            }}
          />
        </Box>

        <Fade in timeout={800}>
          <Typography
            variant={size === 'large' ? 'h4' : size === 'medium' ? 'h5' : 'h6'}
            sx={{
              mt: 2,
              fontWeight: 700,
              color: 'success.main',
              textAlign: 'center',
            }}
          >
            {message}
          </Typography>
        </Fade>

        {subMessage && (
          <Fade in timeout={1000}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, textAlign: 'center' }}
            >
              {subMessage}
            </Typography>
          </Fade>
        )}
      </Box>
    </Zoom>
  )
}

// Analysis Complete Animation
interface AnalysisCompleteProps {
  show: boolean
  diagnosis: string
  confidence: number
}

export const AnalysisCompleteAnimation: React.FC<AnalysisCompleteProps> = ({
  show,
  diagnosis,
  confidence
}) => {
  return (
    <SuccessAnimation
      show={show}
      message="Analysis Complete!"
      subMessage={`Detected: ${diagnosis} (${confidence}% confidence)`}
      size="medium"
    />
  )
}

// Registration Success Animation
export const RegistrationSuccessAnimation: React.FC<{ show: boolean; patientName: string; patientNumber: string }> = ({
  show,
  patientName,
  patientNumber
}) => {
  return (
    <SuccessAnimation
      show={show}
      message="Patient Registered!"
      subMessage={`${patientName} - ${patientNumber}`}
      size="medium"
    />
  )
}

// Report Generated Animation
export const ReportGeneratedAnimation: React.FC<{ show: boolean }> = ({ show }) => {
  return (
    <SuccessAnimation
      show={show}
      message="Report Generated!"
      subMessage="Your medical report is ready for download"
      size="small"
    />
  )
}

export default SuccessAnimation

