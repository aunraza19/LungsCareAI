import React, { useState, useEffect, useRef } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  IconButton,
  Fade,
  alpha,
  Grid
} from '@mui/material'
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Air as LungIcon,
  Psychology as AiIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'

// Import components
import VoiceInput from '../components/chat/VoiceInput'
import LungLoader from '../components/common/LungLoader'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface Patient {
  name: string
  age: number
  gender: string
  area: string
  address: string
  patient_number: string
  registration_date: string
  reports: any[]
}

const ChatBot: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english')
  const [currentMessage, setCurrentMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get initial messages based on selected patient and language
  const getInitialMessages = (patientNumber?: string, language?: string): Message[] => {
    const chatKey = `${patientNumber || 'general'}_${language || 'english'}`
    if (chatHistory[chatKey]) {
      return chatHistory[chatKey]
    }

    const isUrdu = language === 'urdu'

    return [
      {
        id: '1',
        type: 'bot',
        content: patientNumber
          ? (isUrdu
              ? `السلام علیکم! میں MedGemma ہوں، آپ کا AI طبی معاون۔ میرے پاس مریض ${patientNumber} کی طبی رپورٹس تک رسائی ہے۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟`
              : `Hello! I'm **MedGemma**, your AI medical assistant. I have access to patient **${patientNumber}**'s medical reports. How can I assist you today?`)
          : (isUrdu
              ? 'السلام علیکم! میں MedGemma ہوں۔ براہ کرم کسی مریض کو منتخب کریں یا پھیپھڑوں کی صحت کے بارے میں سوالات پوچھیں۔'
              : 'Hello! I\'m **MedGemma**, your AI medical assistant. Select a patient to access their reports, or ask general questions about lung health.'),
        timestamp: new Date()
      }
    ]
  }

  const [messages, setMessages] = useState<Message[]>(getInitialMessages('', selectedLanguage))

  // Fetch patients
  const { data: patientsData, isLoading: patientsLoading } = useQuery(
    'patients',
    async () => {
      const response = await fetch('/api/patients')
      if (!response.ok) throw new Error('Failed to fetch patients')
      return response.json()
    }
  )

  const chatMutation = useMutation(
    async (question: string) => {
      const payload: any = {
        question,
        language: selectedLanguage,
        chat_history: messages.slice(-10)
      }

      if (selectedPatient) {
        payload.patient_number = selectedPatient
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to get response')
      return response.json()
    },
    {
      onSuccess: (data) => {
        const botMessage: Message = {
          id: Date.now().toString() + '_bot',
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => {
          const newMessages = [...prev, botMessage]
          const chatKey = `${selectedPatient || 'general'}_${selectedLanguage}`
          setChatHistory(prevHistory => ({ ...prevHistory, [chatKey]: newMessages }))
          return newMessages
        })
      },
      onError: (error: Error) => {
        toast.error(`Chat error: ${error.message}`)
      },
    }
  )

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Update messages when patient or language changes
  useEffect(() => {
    setMessages(getInitialMessages(selectedPatient, selectedLanguage))
  }, [selectedPatient, selectedLanguage])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => {
      const newMessages = [...prev, userMessage]
      const chatKey = `${selectedPatient || 'general'}_${selectedLanguage}`
      setChatHistory(prevHistory => ({ ...prevHistory, [chatKey]: newMessages }))
      return newMessages
    })

    chatMutation.mutate(currentMessage.trim())
    setCurrentMessage('')
  }

  const handleClearChat = () => {
    const newMessages = getInitialMessages(selectedPatient, selectedLanguage)
    setMessages(newMessages)
    const chatKey = `${selectedPatient || 'general'}_${selectedLanguage}`
    setChatHistory(prev => ({ ...prev, [chatKey]: newMessages }))
  }

  const getSelectedPatientInfo = (): Patient | undefined => {
    return patientsData?.patients?.find((p: Patient) => p.patient_number === selectedPatient)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Fade in timeout={500}>
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)', minHeight: 500 }}>

          {/* Sidebar - Patient Selection */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                height: '100%',
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                }}>
                  <AiIcon sx={{ color: 'secondary.main' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    MedGemma
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    AI Medical Assistant
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Patient Selection */}
              <FormControl fullWidth size="small">
                <InputLabel>Select Patient</InputLabel>
                <Select
                  value={selectedPatient}
                  label="Select Patient"
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  disabled={patientsLoading}
                >
                  <MenuItem value="">
                    <em>General Chat</em>
                  </MenuItem>
                  {patientsData?.patients?.map((patient: Patient) => (
                    <MenuItem key={patient.patient_number} value={patient.patient_number}>
                      {patient.name} ({patient.patient_number})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Language Selection */}
              <FormControl fullWidth size="small">
                <InputLabel>Language</InputLabel>
                <Select
                  value={selectedLanguage}
                  label="Language"
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <MenuItem value="english">🇺🇸 English</MenuItem>
                  <MenuItem value="urdu">🇵🇰 اردو</MenuItem>
                </Select>
              </FormControl>

              {/* Patient Info Card */}
              {selectedPatient && getSelectedPatientInfo() && (
                <Box sx={{
                  p: 2,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                  borderRadius: 2,
                  border: 1,
                  borderColor: (theme) => alpha(theme.palette.info.main, 0.3),
                }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    👤 {getSelectedPatientInfo()?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    Age: {getSelectedPatientInfo()?.age} • {getSelectedPatientInfo()?.gender}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    Area: {getSelectedPatientInfo()?.area}
                  </Typography>
                  {(getSelectedPatientInfo()?.reports?.length || 0) > 0 && (
                    <Chip
                      label={`${getSelectedPatientInfo()?.reports?.length} Reports`}
                      size="small"
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              )}

              {/* Quick Actions */}
              <Box sx={{ mt: 'auto' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearChat}
                  size="small"
                >
                  Clear Chat
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Main Chat Area */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              {/* Chat Header */}
              <Box sx={{
                p: 2,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1a3a5c 0%, #132f4c 100%)'
                    : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LungIcon sx={{ fontSize: 28, animation: 'breathe 3s ease-in-out infinite' }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      AI Medical Chat
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {selectedPatient
                        ? `Chatting about ${getSelectedPatientInfo()?.name}'s health`
                        : 'Ask any medical questions'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha('#0a1929', 0.5)
                      : alpha('#f5f7fa', 0.5),
                }}
              >
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                        gap: 1.5,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                          flexShrink: 0,
                        }}
                      >
                        {message.type === 'user' ? <PersonIcon /> : <BotIcon />}
                      </Avatar>

                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: message.type === 'user'
                            ? 'primary.main'
                            : 'background.paper',
                          color: message.type === 'user' ? 'white' : 'text.primary',
                          boxShadow: 1,
                          border: message.type === 'bot' ? 1 : 0,
                          borderColor: 'divider',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            display: 'block',
                            opacity: message.type === 'user' ? 0.9 : 1,
                          }}
                        >
                          {message.type === 'user' ? 'You' : '🤖 MedGemma'}
                        </Typography>

                        {message.type === 'bot' ? (
                          <Box sx={{
                            '& p': { m: 0, mb: 1 },
                            '& ul, & ol': { m: 0, pl: 2 },
                            '& li': { mb: 0.5 },
                            '& strong': { color: 'secondary.main' },
                          }}>
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            {message.content}
                          </Typography>
                        )}

                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.6,
                            mt: 1,
                            display: 'block',
                            textAlign: message.type === 'user' ? 'right' : 'left',
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}

                {/* Loading indicator */}
                {chatMutation.isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 3,
                      boxShadow: 1,
                    }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}>
                        <BotIcon />
                      </Avatar>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LungIcon
                          sx={{
                            color: 'secondary.main',
                            animation: 'breathe 2s ease-in-out infinite',
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          MedGemma is thinking...
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}>
                <form onSubmit={handleSendMessage}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                      fullWidth
                      placeholder={
                        selectedLanguage === 'urdu'
                          ? "اپنا سوال یہاں لکھیں..."
                          : "Type your medical question here..."
                      }
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      disabled={chatMutation.isLoading}
                      multiline
                      maxRows={3}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
                      }}
                    />

                    <VoiceInput
                      onTranscript={(text) => setCurrentMessage(prev => prev ? `${prev} ${text}` : text)}
                      language={selectedLanguage}
                      disabled={chatMutation.isLoading}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!currentMessage.trim() || chatMutation.isLoading}
                      sx={{
                        minWidth: 50,
                        height: 50,
                        borderRadius: 3,
                      }}
                    >
                      <SendIcon />
                    </Button>
                  </Box>
                </form>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  💡 {selectedLanguage === 'urdu'
                    ? 'آواز سے ٹائپ کرنے کے لیے مائیک بٹن دبائیں'
                    : 'Use mic button for voice input • Always consult healthcare professionals'
                  }
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Fade>
    </Container>
  )
}

export default ChatBot

