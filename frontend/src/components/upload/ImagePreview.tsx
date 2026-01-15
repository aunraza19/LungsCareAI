import React, { useState, useEffect } from 'react'
import { Box, IconButton, Zoom } from '@mui/material'
import { Close as CloseIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material'

interface ImagePreviewProps {
  file: File
  onRemove?: () => void
  maxHeight?: number
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  onRemove,
  maxHeight = 300
}) => {
  const [preview, setPreview] = useState<string>('')
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <>
      {/* Main Preview */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <img
          src={preview}
          alt="X-ray Preview"
          style={{
            width: '100%',
            maxHeight: maxHeight,
            objectFit: 'contain',
            display: 'block',
          }}
        />

        {/* Action Buttons */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setIsZoomed(true)}
            sx={{
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>

          {onRemove && (
            <IconButton
              size="small"
              onClick={onRemove}
              sx={{
                bgcolor: 'rgba(244, 67, 54, 0.8)',
                color: 'white',
                '&:hover': { bgcolor: 'error.main' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <Box
          onClick={() => setIsZoomed(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <Zoom in={isZoomed}>
            <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img
                src={preview}
                alt="X-ray Zoomed"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: 8,
                }}
              />
              <IconButton
                onClick={() => setIsZoomed(false)}
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <ZoomOutIcon />
              </IconButton>
            </Box>
          </Zoom>
        </Box>
      )}
    </>
  )
}

export default ImagePreview

