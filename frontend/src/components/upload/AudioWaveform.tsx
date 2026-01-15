import React, { useEffect, useRef } from 'react'
import { Box, useTheme, alpha } from '@mui/material'

interface AudioWaveformProps {
  file: File
  height?: number
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ file, height = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useTheme()

  useEffect(() => {
    if (!file || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Audio Context Setup
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const reader = new FileReader()

    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        drawWaveform(audioBuffer, ctx, rect.width, height)
      } catch (err) {
        console.error('Error decoding audio data', err)
      }
    }
    reader.readAsArrayBuffer(file)

    return () => {
      audioContext.close()
    }
  }, [file, height, theme])

  const drawWaveform = (audioBuffer: AudioBuffer, ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const rawData = audioBuffer.getChannelData(0) // We only use the first channel
    const samples = 200 // Number of bars
    const step = Math.floor(rawData.length / samples)
    const barWidth = width / samples

    ctx.clearRect(0, 0, width, height)

    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, theme.palette.primary.main)
    gradient.addColorStop(1, theme.palette.secondary.main)

    ctx.fillStyle = gradient

    // Draw Grid Lines (Background)
    ctx.strokeStyle = alpha(theme.palette.text.primary, 0.1)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    // Draw Bars
    for (let i = 0; i < samples; i++) {
      let min = 1.0
      let max = -1.0
      for (let j = 0; j < step; j++) {
        const datum = rawData[i * step + j]
        if (datum < min) min = datum
        if (datum > max) max = datum
      }

      const amplitude = Math.max(0.1, max - min) // Ensure visible line even if silent
      const barHeight = amplitude * height

      // Neon Glow
      ctx.shadowBlur = 10
      ctx.shadowColor = theme.palette.primary.main

      // Rounded Caps Rect
      const x = i * barWidth + (barWidth * 0.2) // Gap
      const y = (height - barHeight) / 2
      const w = barWidth * 0.6
      const h = barHeight

      ctx.fillRect(x, y, w, h)
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        height,
        bgcolor: alpha(theme.palette.background.default, 0.5),
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
      {/* 🔮 Scanning Overlay */}
      <Box sx={{
        position: 'absolute',
        top: 0, bottom: 0, width: 2,
        background: theme.palette.primary.main,
        boxShadow: `0 0 10px ${theme.palette.primary.main}`,
        animation: 'scan 4s linear infinite',
        '@keyframes scan': {
           '0%': { left: '-5%' },
           '100%': { left: '105%' }
        }
      }} />
    </Box>
  )
}

export default AudioWaveform