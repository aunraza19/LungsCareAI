import React from 'react'
import { Alert, AlertTitle, Box, Collapse, IconButton, Typography, Fade, keyframes } from '@mui/material'
import { Close, Error, Warning, Info, CheckCircle, Refresh } from '@mui/icons-material'

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`

const slideIn = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

interface EnhancedErrorProps {
  show: boolean
  type?: 'error' | 'warning' | 'info' | 'success'
  title?: string
  message: string
  details?: string
  onClose?: () => void
  onRetry?: () => void
  autoHide?: boolean
  autoHideDelay?: number
}

const EnhancedError: React.FC<EnhancedErrorProps> = ({
  show,
  type = 'error',
  title,
  message,
  details,
  onClose,
  onRetry,
  autoHide = false,
  autoHideDelay = 5000
}) => {
  const [visible, setVisible] = React.useState(show)

  React.useEffect(() => {
    setVisible(show)
    if (show && autoHide) {
      const timer = setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [show, autoHide, autoHideDelay, onClose])

  const getIcon = () => {
    switch (type) {
      case 'error': return <Error />
      case 'warning': return <Warning />
      case 'info': return <Info />
      case 'success': return <CheckCircle />
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'error': return 'Error Occurred'
      case 'warning': return 'Warning'
      case 'info': return 'Information'
      case 'success': return 'Success'
    }
  }

  return (
    <Collapse in={visible}>
      <Alert
        severity={type}
        icon={getIcon()}
        sx={{
          mb: 2,
          borderRadius: 2,
          animation: type === 'error' ? `${shakeAnimation} 0.5s ease-in-out, ${slideIn} 0.3s ease-out` : `${slideIn} 0.3s ease-out`,
          '& .MuiAlert-icon': {
            fontSize: 28,
          },
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
        action={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onRetry && (
              <IconButton
                size="small"
                color="inherit"
                onClick={onRetry}
                title="Retry"
              >
                <Refresh fontSize="small" />
              </IconButton>
            )}
            {onClose && (
              <IconButton
                size="small"
                color="inherit"
                onClick={() => {
                  setVisible(false)
                  onClose()
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          {title || getDefaultTitle()}
        </AlertTitle>
        <Typography variant="body2">
          {message}
        </Typography>
        {details && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              p: 1,
              bgcolor: 'rgba(0,0,0,0.1)',
              borderRadius: 1,
              fontFamily: 'monospace',
            }}
          >
            {details}
          </Typography>
        )}
      </Alert>
    </Collapse>
  )
}

// Predefined error types for common scenarios
export const NetworkError: React.FC<{ show: boolean; onRetry?: () => void; onClose?: () => void }> = (props) => (
  <EnhancedError
    {...props}
    type="error"
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
  />
)

export const AnalysisError: React.FC<{ show: boolean; details?: string; onRetry?: () => void; onClose?: () => void }> = (props) => (
  <EnhancedError
    {...props}
    type="error"
    title="Analysis Failed"
    message="The AI analysis could not be completed. Please try again or upload a different file."
  />
)

export const FileUploadError: React.FC<{ show: boolean; fileName?: string; onClose?: () => void }> = ({ fileName, ...props }) => (
  <EnhancedError
    {...props}
    type="error"
    title="Upload Failed"
    message={`Failed to upload ${fileName || 'the file'}. Please ensure the file format is correct and try again.`}
  />
)

export const ValidationError: React.FC<{ show: boolean; fields: string[]; onClose?: () => void }> = ({ fields, ...props }) => (
  <EnhancedError
    {...props}
    type="warning"
    title="Validation Error"
    message={`Please correct the following fields: ${fields.join(', ')}`}
  />
)

export const SuccessMessage: React.FC<{ show: boolean; message: string; onClose?: () => void }> = ({ message, ...props }) => (
  <EnhancedError
    {...props}
    type="success"
    title="Success"
    message={message}
    autoHide
    autoHideDelay={3000}
  />
)

export default EnhancedError

