import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Typography, alpha, useTheme } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  accept: Record<string, string[]>
  selectedFile: File | null
  icon: React.ReactNode
  title: string
  subtitle: string
  color: 'primary' | 'secondary'
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept,
  title,
  subtitle,
  color
}) => {
  const theme = useTheme()
  const themeColor = color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) onFileSelect(acceptedFiles[0])
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false
  })

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? themeColor : '#e0e0e0',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? alpha(themeColor, 0.05) : '#f8f9fa',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: themeColor,
          bgcolor: alpha(themeColor, 0.05),
        }
      }}
    >
      <input {...getInputProps()} />
      <Box sx={{ color: themeColor, mb: 1 }}>
        <CloudUpload fontSize="large" />
      </Box>
      <Typography variant="subtitle1" fontWeight={600}>
        {isDragActive ? 'Drop file now' : title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  )
}

export default FileDropzone