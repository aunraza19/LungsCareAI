import React from 'react'
import { Box, Stack } from '@mui/material'

interface LungLoaderProps {
  size?: 'small' | 'medium' | 'large'
  // message prop is intentionally ignored now
  message?: string
}

const LungLoader: React.FC<LungLoaderProps> = ({ size = 'medium' }) => {
  // Dimensions - Increased for visibility
  // Small: 80px, Medium: 220px, Large: 320px
  const dimension = size === 'small' ? 80 : size === 'medium' ? 220 : 320

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        width: '100%',
        height: '100%', // Ensure it centers vertically in parent container
        minHeight: dimension + 40 // Minimum height to avoid collapse
      }}
    >
      {/* 🌀 Revolving Logo Centered */}
      <Box sx={{
        width: dimension,
        height: dimension,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1000px'
      }}>
        <img
          src="/assets/lungs-care-ai-logo.png"
          alt="Processing..."
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            // 3D Flip Animation
            animation: 'logo-revolve 2.5s linear infinite'
          }}
        />
      </Box>
    </Stack>
  )
}

export default LungLoader