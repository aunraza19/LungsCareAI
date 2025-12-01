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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  IconButton
} from '@mui/material'
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'

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
              ? `السلام علیکم! میں MedGemma ہوں، آپ کا AI طبی معاون۔ میرے پاس مریض ${patientNumber} کی طبی رپورٹس اور تجزیے تک رسائی ہے۔ میں ان کی پھیپھڑوں کی صحت کے بارے میں سوالوں کا جواب دے سکتا ہوں، تجزیے کے نتائج کی وضاحت کر سکتا ہوں، اور ان کی رپورٹس کی بنیاد پر طبی بصیرت فراہم کر سکتا ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟`
              : `Hello! I'm MedGemma, your AI medical assistant. I have access to the medical reports and analysis for patient ${patientNumber}. I can answer questions about their lung health, explain analysis results, and provide medical insights based on their reports. How can I assist you today?`)
          : (isUrdu 
              ? 'السلام علیکم! میں MedGemma ہوں، آپ کا AI طبی معاون۔ براہ کرم کسی مریض کو منتخب کریں تاکہ ان کی طبی رپورٹس تک رسائی حاصل کر سکیں اور ذاتی بصیرت حاصل کر سکیں، یا پھیپھڑوں کی صحت اور بیماریوں کے بارے میں عمومی سوالات پوچھیں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟'
              : 'Hello! I\'m MedGemma, your AI medical assistant. Please select a patient to access their medical reports and get personalized insights, or ask general questions about lung health and diseases. How can I assist you today?'),
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
        chat_history: messages.slice(-10) // Send last 10 messages for context
      }
      
      if (selectedPatient) {
        payload.patient_number = selectedPatient
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

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
          // Update chat history with language-specific key
          const chatKey = `${selectedPatient || 'general'}_${selectedLanguage}`
          setChatHistory(prevHistory => ({
            ...prevHistory,
            [chatKey]: newMessages
          }))
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

  // Update messages when patient or language selection changes
  useEffect(() => {
    const newMessages = getInitialMessages(selectedPatient, selectedLanguage)
    setMessages(newMessages)
  }, [selectedPatient, selectedLanguage])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentMessage.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => {
      const newMessages = [...prev, userMessage]
      // Update chat history with language-specific key
      const chatKey = `${selectedPatient || 'general'}_${selectedLanguage}`
      setChatHistory(prevHistory => ({
        ...prevHistory,
        [chatKey]: newMessages
      }))
      return newMessages
    })
    
    // Send to API
    chatMutation.mutate(currentMessage.trim())
    
    // Clear input
    setCurrentMessage('')
  }

  const handleClearChat = () => {
    const newMessages = getInitialMessages(selectedPatient, selectedLanguage)
    setMessages(newMessages)
    const chatKey = `${selectedPatient || 'general'}_${selectedLanguage}`
    setChatHistory(prev => ({
      ...prev,
      [chatKey]: newMessages
    }))
  }

  const getSelectedPatientInfo = (): Patient | undefined => {
    return patientsData?.patients?.find((p: Patient) => p.patient_number === selectedPatient)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: '4px 4px 0 0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ChatIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5" fontWeight="600">
                  AI Medical Assistant
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedLanguage === 'urdu' 
                    ? 'مریض کی رپورٹس کے ساتھ AI سے بات چیت کریں'
                    : 'Chat with AI using patient reports context'
                  }
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={handleClearChat} 
                sx={{ color: 'white' }}
                title="Clear Chat"
              >
                <ClearIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* Patient and Language Selection */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white', borderRadius: 1 }}>
              <InputLabel>Select Patient</InputLabel>
              <Select
                value={selectedPatient}
                label="Select Patient"
                onChange={(e) => setSelectedPatient(e.target.value)}
                disabled={patientsLoading}
              >
                <MenuItem value="">
                  <em>General Chat (No Patient)</em>
                </MenuItem>
                {patientsData?.patients?.map((patient: Patient) => (
                  <MenuItem key={patient.patient_number} value={patient.patient_number}>
                    {patient.name} ({patient.patient_number})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140, bgcolor: 'white', borderRadius: 1 }}>
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
            
            {selectedPatient && getSelectedPatientInfo() && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(getSelectedPatientInfo()?.reports?.length || 0) > 0 && (
                  <Chip
                    label={`${getSelectedPatientInfo()?.reports?.length || 0} Reports Available`}
                    size="small"
                    sx={{ bgcolor: 'success.light', color: 'white' }}
                  />
                )}
                <Chip
                  label={`${getSelectedPatientInfo()?.name} - ${getSelectedPatientInfo()?.age}y ${getSelectedPatientInfo()?.gender}`}
                  size="small"
                  sx={{ bgcolor: 'info.light', color: 'white' }}
                />
              </Box>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Messages Area */}
        <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', maxHeight: '55vh' }}>
          {/* Context Alert */}
          {selectedPatient && getSelectedPatientInfo() && (
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
              action={
                <IconButton 
                  size="small" 
                  onClick={() => window.location.reload()}
                  title="Refresh Patient Data"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              }
            >
              <Typography variant="body2">
                <strong>Patient Context Active:</strong> {getSelectedPatientInfo()?.name} ({selectedPatient})
                {(getSelectedPatientInfo()?.reports?.length || 0) > 0 && 
                  ` - ${getSelectedPatientInfo()?.reports?.length} medical reports loaded for AI context`
                }
              </Typography>
            </Alert>
          )}
          
          {messages.map((message) => (
            <Box key={message.id} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Card
                  sx={{
                    maxWidth: '80%',
                    bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                    color: message.type === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: message.type === 'user' ? 'primary.dark' : 'secondary.main'
                        }}
                      >
                        {message.type === 'user' ? <PersonIcon /> : <BotIcon />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {message.type === 'user' ? 'You' : 'MedGemma AI'}
                        </Typography>
                        {message.type === 'bot' ? (
                          <ReactMarkdown className="medical-text">
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          ))}
          
          {chatMutation.isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Card sx={{ bgcolor: 'grey.100' }}>
                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    <BotIcon />
                  </Avatar>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    MedGemma is analyzing {selectedPatient ? 'patient reports and ' : ''}your question...
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input Area */}
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleSendMessage}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder={
                  selectedLanguage === 'urdu'
                    ? (selectedPatient 
                        ? `${getSelectedPatientInfo()?.name} کی رپورٹس، علامات، یا عمومی طبی سوالوں کے بارے میں پوچھیں...`
                        : "پھیپھڑوں کی صحت، بیماریوں، علامات کے بارے میں پوچھیں، یا رپورٹ پر مبنی بصیرت کے لیے کوئی مریض منتخب کریں...")
                    : (selectedPatient 
                        ? `Ask about ${getSelectedPatientInfo()?.name}'s reports, symptoms, or general medical questions...`
                        : "Ask about lung health, diseases, symptoms, or select a patient for report-based insights...")
                }
                value={currentMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentMessage(e.target.value)}
                disabled={chatMutation.isLoading}
                multiline
                maxRows={3}
                sx={{ flexGrow: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!currentMessage.trim() || chatMutation.isLoading}
                sx={{ minWidth: 60 }}
              >
                <SendIcon />
              </Button>
            </Box>
          </form>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {selectedLanguage === 'urdu'
              ? (selectedPatient 
                  ? `🔒 محفوظ مریض کا سیاق فعال۔ طبی رپورٹس ذاتی بصیرت فراہم کرنے کے لیے استعمال ہوتی ہیں۔ طبی مشورے کے لیے ہمیشہ صحت کی دیکھ بھال کے پیشہ ور افراد سے مشورہ کریں۔`
                  : 'عمومی طبی معلومات کا طریقہ۔ ذاتی بصیرت کے لیے اوپر سے کوئی مریض منتخب کریں۔ طبی مشورے کے لیے ہمیشہ صحت کی دیکھ بھال کے پیشہ ور افراد سے مشورہ کریں۔')
              : (selectedPatient 
                  ? `🔒 Secure patient context active. Medical reports are used to provide personalized insights.`
                  : 'General medical information mode. Select a patient above to access their reports for personalized insights.'
              )} {selectedLanguage === 'english' && 'Always consult healthcare professionals for medical advice.'}
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default ChatBot
