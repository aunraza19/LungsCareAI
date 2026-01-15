import React, { useState, useRef } from 'react'
import { IconButton, Tooltip, CircularProgress, Box, Typography, Zoom } from '@mui/material'
import { Mic, MicOff, FiberManualRecord } from '@mui/icons-material'
import { toast } from 'react-toastify'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  language?: string
  disabled?: boolean
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  language = 'english',
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const startListening = () => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error('🎤 Speech recognition not supported in this browser. Try Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    // Configure recognition
    recognition.lang = language === 'urdu' ? 'ur-PK' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      toast.info('🎤 Listening... Speak now', { autoClose: 2000 })
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      const confidence = event.results[0][0].confidence

      onTranscript(transcript)
      setIsListening(false)

      if (confidence > 0.8) {
        toast.success('✅ Voice captured successfully!')
      } else {
        toast.info('🎤 Voice captured (speak clearly for better results)')
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)

      const errorMessages: Record<string, string> = {
        'no-speech': '🔇 No speech detected. Please try again.',
        'audio-capture': '🎤 No microphone found. Check your device.',
        'not-allowed': '🔒 Microphone permission denied. Allow access to use voice input.',
        'network': '🌐 Network error. Check your connection.',
      }

      toast.error(errorMessages[event.error] || `Voice input error: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Tooltip
        title={
          isListening
            ? 'Click to stop listening'
            : language === 'urdu'
              ? 'آواز سے ٹائپ کریں'
              : 'Voice input (click to speak)'
        }
      >
        <span>
          <IconButton
            onClick={isListening ? stopListening : startListening}
            disabled={disabled}
            color={isListening ? 'error' : 'primary'}
            size="large"
            sx={{
              position: 'relative',
              transition: 'all 0.3s ease',
              ...(isListening && {
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)'
                  },
                  '50%': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)'
                  },
                },
              }),
            }}
          >
            {isListening ? (
              <Box sx={{ position: 'relative' }}>
                <MicOff />
                <FiberManualRecord
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    fontSize: 12,
                    color: 'error.main',
                    animation: 'blink 1s linear infinite',
                    '@keyframes blink': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0 },
                    },
                  }}
                />
              </Box>
            ) : (
              <Mic />
            )}
          </IconButton>
        </span>
      </Tooltip>

      {/* Recording indicator */}
      <Zoom in={isListening}>
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'error.main',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          >
            ● Recording...
          </Typography>
        </Box>
      </Zoom>
    </Box>
  )
}

export default VoiceInput

