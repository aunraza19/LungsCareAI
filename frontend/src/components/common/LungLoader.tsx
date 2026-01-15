import React from 'react'
import { Box, Typography } from '@mui/material'
import { Air as LungIcon } from '@mui/icons-material'

interface LungLoaderProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
  showMessage?: boolean
}

const sizeMap = {
  small: { icon: 40, fontSize: '0.875rem' },
  medium: { icon: 64, fontSize: '1rem' },
  large: { icon: 96, fontSize: '1.125rem' },
}

const LungLoader: React.FC<LungLoaderProps> = ({
  size = 'medium',
  message = 'Analyzing lung data...',
  showMessage = true
}) => {
  const { icon: iconSize, fontSize } = sizeMap[size]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer glow ring */}
        <Box
          sx={{
            position: 'absolute',
            width: iconSize * 1.5,
            height: iconSize * 1.5,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(77, 182, 172, 0.3) 0%, transparent 70%)',
            animation: 'pulseGlow 3s ease-in-out infinite',
            '@keyframes pulseGlow': {
              '0%, 100%': {
                transform: 'scale(0.9)',
                opacity: 0.5,
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 1,
              },
            },
          }}
        />

        {/* Main lung icon with breathing animation */}
        <LungIcon
          sx={{
            fontSize: iconSize,
            color: '#4db6ac',
            animation: 'breathe 3s ease-in-out infinite',
            filter: 'drop-shadow(0 0 8px rgba(77, 182, 172, 0.5))',
            '@keyframes breathe': {
              '0%, 100%': {
                transform: 'scale(0.95)',
                opacity: 0.7,
                filter: 'drop-shadow(0 0 8px rgba(77, 182, 172, 0.3))',
              },
              '50%': {
                transform: 'scale(1.05)',
                opacity: 1,
                filter: 'drop-shadow(0 0 15px rgba(77, 182, 172, 0.8))',
              },
            },
          }}
        />
      </Box>

      {showMessage && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize,
            animation: 'fadeInOut 2s ease-in-out infinite',
            '@keyframes fadeInOut': {
              '0%, 100%': { opacity: 0.6 },
              '50%': { opacity: 1 },
            },
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  )
}

export default LungLoader

