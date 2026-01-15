import React from 'react'
import { Box, IconButton, useTheme, alpha, Typography } from '@mui/material'
import { Delete, CropFree } from '@mui/icons-material'

interface ImagePreviewProps {
  file: File
  onRemove: () => void
  maxHeight?: number
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove, maxHeight = 300 }) => {
  const theme = useTheme()
  const imageUrl = URL.createObjectURL(file)

  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.primary.main}`, bgcolor: '#000' }}>
      {/* 🖼️ The Image */}
      <Box
        component="img"
        src={imageUrl}
        alt="Preview"
        sx={{
          width: '100%',
          maxHeight: maxHeight,
          objectFit: 'contain',
          display: 'block',
          opacity: 0.8 // Dim slightly for overlay visibility
        }}
      />

      {/* 🕸️ HUD Overlay */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `
          linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px),
          linear-gradient(0deg, ${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        boxShadow: `inset 0 0 50px ${alpha(theme.palette.background.default, 0.8)}`
      }}>
        {/* Corners */}
        <Box sx={{ position: 'absolute', top: 10, left: 10, width: 20, height: 20, borderTop: `2px solid ${theme.palette.primary.main}`, borderLeft: `2px solid ${theme.palette.primary.main}` }} />
        <Box sx={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderTop: `2px solid ${theme.palette.primary.main}`, borderRight: `2px solid ${theme.palette.primary.main}` }} />
        <Box sx={{ position: 'absolute', bottom: 10, left: 10, width: 20, height: 20, borderBottom: `2px solid ${theme.palette.primary.main}`, borderLeft: `2px solid ${theme.palette.primary.main}` }} />
        <Box sx={{ position: 'absolute', bottom: 10, right: 10, width: 20, height: 20, borderBottom: `2px solid ${theme.palette.primary.main}`, borderRight: `2px solid ${theme.palette.primary.main}` }} />

        {/* Center Target */}
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 60, height: 60,
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
          borderRadius: '50%'
        }}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, bgcolor: 'primary.main', transform: 'translate(-50%, -50%)', borderRadius: '50%' }} />
        </Box>

        {/* Scan Line */}
        <Box sx={{
          position: 'absolute', left: 0, right: 0, height: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.5),
          boxShadow: `0 0 15px ${theme.palette.primary.main}`,
          animation: 'scan-vertical 3s linear infinite',
          '@keyframes scan-vertical': {
            '0%': { top: '0%' },
            '100%': { top: '100%' }
          }
        }} />

        {/* Label */}
        <Box sx={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', bgcolor: alpha('#000', 0.6), px: 1, borderRadius: 0.5 }}>
           <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono', color: 'primary.main' }}>
             RAW INPUT | {Math.round(file.size / 1024)} KB
           </Typography>
        </Box>
      </Box>

      {/* ❌ Remove Button */}
      <IconButton
        onClick={onRemove}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: alpha('#000', 0.7),
          color: 'error.main',
          border: '1px solid',
          borderColor: 'error.main',
          '&:hover': { bgcolor: 'error.main', color: '#fff' }
        }}
      >
        <Delete />
      </IconButton>
    </Box>
  )
}

export default ImagePreview