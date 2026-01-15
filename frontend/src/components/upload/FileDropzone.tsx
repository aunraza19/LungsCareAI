import React from 'react'
import { useDropzone, Accept } from 'react-dropzone'
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material'
import { CloudUpload as UploadIcon, CheckCircle as SuccessIcon } from '@mui/icons-material'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  accept: Accept
  maxSize?: number
  selectedFile?: File | null
  icon?: React.ReactNode
  title?: string
  subtitle?: string
  color?: 'primary' | 'secondary'
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB default
  selectedFile,
  icon,
  title = 'Drag and drop file here, or click to select',
  subtitle,
  color = 'primary'
}) => {
  const theme = useTheme()
  const colorValue = color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    accept,
    maxFiles: 1,
    maxSize,
  })

  const getBorderColor = () => {
    if (isDragReject) return theme.palette.error.main
    if (isDragActive) return colorValue
    if (selectedFile) return theme.palette.success.main
    return alpha(colorValue, 0.5)
  }

  const getBackgroundColor = () => {
    if (isDragReject) return alpha(theme.palette.error.main, 0.1)
    if (isDragActive) return alpha(colorValue, 0.15)
    if (selectedFile) return alpha(theme.palette.success.main, 0.1)
    return alpha(colorValue, 0.05)
  }

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: getBorderColor(),
        borderRadius: 3,
        p: 4,
        textAlign: 'center',
        bgcolor: getBackgroundColor(),
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: colorValue,
          bgcolor: alpha(colorValue, 0.1),
          transform: 'scale(1.01)',
        },
      }}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <Box sx={{ mb: 2 }}>
        {selectedFile ? (
          <SuccessIcon sx={{ fontSize: 56, color: 'success.main' }} />
        ) : (
          icon || <UploadIcon sx={{ fontSize: 56, color: colorValue }} />
        )}
      </Box>

      {/* Content */}
      {selectedFile ? (
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {selectedFile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </Typography>
          <Chip
            icon={<SuccessIcon />}
            label="Ready to analyze"
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" fontWeight={500} gutterBottom>
            {isDragActive ? 'Drop the file here...' : title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle || `Max size: ${maxSize / (1024 * 1024)}MB`}
          </Typography>
          {isDragReject && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              File type not accepted
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}

export default FileDropzone

