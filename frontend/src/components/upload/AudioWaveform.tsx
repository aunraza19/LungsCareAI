import React, { useEffect, useRef, useState } from 'react'
import { Box, IconButton, Typography, Slider, alpha, useTheme } from '@mui/material'
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Replay10,
  Forward10
} from '@mui/icons-material'

interface AudioWaveformProps {
  file: File
  height?: number
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ file, height = 100 }) => {
  const theme = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [waveformData, setWaveformData] = useState<number[]>([])

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setAudioUrl(url)

    // Generate waveform data from audio file
    generateWaveform(file)

    return () => {
      URL.revokeObjectURL(url)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [file])

  const generateWaveform = async (audioFile: File) => {
    try {
      const arrayBuffer = await audioFile.arrayBuffer()
      const audioContext = new AudioContext()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      const rawData = audioBuffer.getChannelData(0)
      const samples = 100 // Number of bars in waveform
      const blockSize = Math.floor(rawData.length / samples)
      const filteredData: number[] = []

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i
        let sum = 0
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j])
        }
        filteredData.push(sum / blockSize)
      }

      // Normalize
      const maxVal = Math.max(...filteredData)
      const normalizedData = filteredData.map(n => n / maxVal)
      setWaveformData(normalizedData)

      audioContext.close()
    } catch (error) {
      console.error('Error generating waveform:', error)
      // Fallback: generate random waveform for demo
      const fallbackData = Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2)
      setWaveformData(fallbackData)
    }
  }

  useEffect(() => {
    if (waveformData.length > 0 && canvasRef.current) {
      drawWaveform()
    }
  }, [waveformData, currentTime, duration, theme.palette.mode])

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const barWidth = width / waveformData.length
    const progressPercent = duration > 0 ? currentTime / duration : 0

    ctx.clearRect(0, 0, width, height)

    waveformData.forEach((value, index) => {
      const x = index * barWidth
      const barHeight = value * height * 0.8
      const y = (height - barHeight) / 2

      // Color based on progress
      const isPlayed = index / waveformData.length < progressPercent

      ctx.fillStyle = isPlayed
        ? '#4db6ac' // Medical teal for played portion
        : alpha('#4db6ac', 0.3) // Dimmed for unplayed

      ctx.beginPath()
      ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2)
      ctx.fill()
    })
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleSeek = (_: Event, value: number | number[]) => {
    if (audioRef.current && typeof value === 'number') {
      audioRef.current.currentTime = value
      setCurrentTime(value)
    }
  }

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    const newTime = percent * duration

    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
    <Box sx={{
      p: 2,
      bgcolor: alpha('#4db6ac', 0.1),
      borderRadius: 2,
      border: 1,
      borderColor: alpha('#4db6ac', 0.3),
    }}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Waveform Canvas */}
      <Box
        sx={{
          mb: 2,
          cursor: 'pointer',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            width: '100%',
            height: `${height}px`,
            display: 'block',
          }}
        />
      </Box>

      {/* Progress Slider */}
      <Slider
        value={currentTime}
        max={duration || 100}
        onChange={handleSeek}
        sx={{
          color: '#4db6ac',
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(77, 182, 172, 0.16)',
            },
          },
          '& .MuiSlider-rail': {
            opacity: 0.3,
          },
        }}
      />

      {/* Controls */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton onClick={() => skip(-10)} size="small" color="inherit">
            <Replay10 />
          </IconButton>

          <IconButton
            onClick={togglePlayPause}
            color="primary"
            sx={{
              bgcolor: alpha('#4db6ac', 0.2),
              '&:hover': {
                bgcolor: alpha('#4db6ac', 0.3),
              }
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          <IconButton onClick={() => skip(10)} size="small" color="inherit">
            <Forward10 />
          </IconButton>

          <IconButton onClick={toggleMute} size="small" color="inherit">
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Box>
    </Box>
  )
}

export default AudioWaveform

