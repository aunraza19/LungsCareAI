import React, { useState, useEffect, useRef } from 'react'
import {
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Stack,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { Send as SendIcon, Person as PersonIcon } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation, useQuery } from 'react-query'
import ReactMarkdown from 'react-markdown'
import VoiceInput from '../components/chat/VoiceInput'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

// ❤️ Typing Indicator Component
const TypingIndicator = () => (
  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ p: 1 }}>
    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'primary.main', animation: 'heartbeat 1s infinite 0s' }} />
    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'primary.main', animation: 'heartbeat 1s infinite 0.2s' }} />
    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'primary.main', animation: 'heartbeat 1s infinite 0.4s' }} />
  </Stack>
)

const ChatBot: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [currentMessage, setCurrentMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: patientsData } = useQuery('patients', async () => {
    const res = await fetch('/api/patients')
    return res.json()
  })

  useEffect(() => {
    setMessages([{
      id: 'init', type: 'bot', content: 'Hello. I am MedGemma. How can I assist you with the patient data?', timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messages.length])

  // Mutation with Explicit Types and Correct Callback Return
  const chatMutation = useMutation<any, Error, string>(
    async (question) => {
      const payload: any = {
        question,
        language: 'english',
        chat_history: messages.slice(-10)
      }
      if (selectedPatient) payload.patient_number = selectedPatient

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error('Error connecting to AI service')
      return response.json()
    },
    {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { id: Date.now() + '_bot', type: 'bot', content: data.response, timestamp: new Date() }])
      },
      onError: (err) => {
        // Explicitly returning void by using a block
        toast.error(err.message)
      }
    }
  )

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!currentMessage.trim()) return
    const msg = currentMessage.trim()
    setMessages(prev => [...prev, { id: Date.now() + '_user', type: 'user', content: msg, timestamp: new Date() }])
    chatMutation.mutate(msg)
    setCurrentMessage('')
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} alignItems="center">
           <img src="/assets/lungs-care-ai-logo.png" alt="Bot" style={{ width: 40, height: 40 }} />
           <Typography variant="h5" fontWeight={700}>MedGemma Assistant</Typography>
        </Stack>

        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Context: Patient</InputLabel>
          <Select value={selectedPatient} label="Context: Patient" onChange={(e) => setSelectedPatient(e.target.value)}>
            <MenuItem value="">None</MenuItem>
            {patientsData?.patients?.map((p: any) => (
              <MenuItem key={p.patient_number} value={p.patient_number}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#f8f9fa' }}>
          {messages.map((msg) => (
            <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
              <Stack direction={msg.type === 'user' ? 'row-reverse' : 'row'} spacing={1.5} sx={{ maxWidth: '85%' }} alignItems="flex-end">

                {/* 🤖 Avatar - Bigger (45px) */}
                <Avatar sx={{ width: 45, height: 45, bgcolor: 'transparent', border: '1px solid #e0e0e0', p: 0.5 }}>
                  {msg.type === 'user' ? (
                    <PersonIcon />
                  ) : (
                    <img src="/assets/lungs-care-ai-logo.png" alt="Bot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </Avatar>

                {/* 💬 Message Bubble (Compact) */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5, // Standard padding, but visual size reduced by font and tight layout
                    borderRadius: 2,
                    borderBottomLeftRadius: msg.type === 'bot' ? 0 : 8,
                    borderBottomRightRadius: msg.type === 'user' ? 0 : 8,
                    bgcolor: msg.type === 'user' ? 'primary.main' : 'white',
                    color: msg.type === 'user' ? 'white' : 'text.primary',
                    border: msg.type === 'bot' ? '1px solid #e0e0e0' : 'none',
                    fontSize: '0.875rem', // Clean, readable size
                    lineHeight: 1.5,
                  }}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7, textAlign: 'right', fontSize: '0.7rem' }}>
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          ))}

          {/* ❤️ Heartbeat Typing Indicator */}
          {chatMutation.isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-end">
                <Avatar sx={{ width: 45, height: 45, bgcolor: 'transparent', border: '1px solid #e0e0e0', p: 0.5 }}>
                   <img src="/assets/lungs-care-ai-logo.png" alt="Bot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Avatar>
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid #e0e0e0', borderBottomLeftRadius: 0 }}>
                  <TypingIndicator />
                </Paper>
              </Stack>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
          <form onSubmit={handleSend}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                placeholder="Ask about diagnosis..."
                size="small"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
              />
              <VoiceInput onTranscript={(text) => setCurrentMessage(prev => prev + ' ' + text)} />
              <Button type="submit" variant="contained" disabled={!currentMessage.trim()} sx={{ borderRadius: 4, minWidth: 48, px: 0 }}>
                <SendIcon fontSize="small" />
              </Button>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Box>
  )
}

export default ChatBot