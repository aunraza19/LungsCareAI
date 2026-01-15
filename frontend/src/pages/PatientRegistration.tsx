import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Fade,
  Stack
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Air as LungIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation } from 'react-query'
import LungLoader from '../components/common/LungLoader'

interface PatientData {
  name: string
  age: number
  gender: string
  area: string
  address: string
  patient_number: string
  registration_date: string
}

const PatientRegistration: React.FC = () => {
  const [patientName, setPatientName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')

  const registerPatientMutation = useMutation(
    async (patientData: { name: string; age: number; gender: string; area: string; address: string }) => {
      const response = await fetch('/api/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      })

      if (!response.ok) {
        throw new Error('Failed to register patient')
      }

      return response.json()
    },
    {
      onSuccess: (data: PatientData) => {
        toast.success(`Patient ${data.name} registered successfully!`)
        setPatientName('')
        setAge('')
        setGender('')
        setArea('')
        setAddress('')
      },
      onError: (error: Error) => {
        toast.error(`Registration failed: ${error.message}`)
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (patientName.trim() && age && gender && area.trim() && address.trim()) {
      registerPatientMutation.mutate({
        name: patientName.trim(),
        age: parseInt(age),
        gender,
        area: area.trim(),
        address: address.trim()
      })
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Paper elevation={2} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LungIcon
              sx={{
                fontSize: 64,
                color: 'secondary.main',
                mb: 2,
                animation: 'breathe 3s ease-in-out infinite',
              }}
            />
            <Typography variant="h4" gutterBottom fontWeight="700">
              Patient Registration
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Register a new patient to start AI-powered medical analysis
            </Typography>
          </Box>

          {/* Loading State */}
          {registerPatientMutation.isLoading && (
            <Box sx={{ mb: 3 }}>
              <LungLoader size="small" message="Registering patient..." />
            </Box>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Patient Full Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                disabled={registerPatientMutation.isLoading}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    disabled={registerPatientMutation.isLoading}
                    inputProps={{ min: 0, max: 150 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={gender}
                      label="Gender"
                      onChange={(e) => setGender(e.target.value)}
                      disabled={registerPatientMutation.isLoading}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Area/City"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                disabled={registerPatientMutation.isLoading}
              />

              <TextField
                fullWidth
                label="Full Address"
                multiline
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={registerPatientMutation.isLoading}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={
                  !patientName.trim() ||
                  !age ||
                  !gender ||
                  !area.trim() ||
                  !address.trim() ||
                  registerPatientMutation.isLoading
                }
                startIcon={!registerPatientMutation.isLoading && <PersonAddIcon />}
                sx={{ py: 1.5, mt: 2 }}
              >
                {registerPatientMutation.isLoading ? 'Registering...' : 'Register Patient'}
              </Button>
            </Stack>
          </form>

          {/* Success Message */}
          {registerPatientMutation.data && (
            <Fade in timeout={500}>
              <Alert
                severity="success"
                icon={<SuccessIcon />}
                sx={{ mt: 3 }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Registration Successful!
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {registerPatientMutation.data.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Age:</strong> {registerPatientMutation.data.age}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Gender:</strong> {registerPatientMutation.data.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Patient Number:</strong>{' '}
                      <span style={{ color: '#4db6ac', fontWeight: 600 }}>
                        {registerPatientMutation.data.patient_number}
                      </span>
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {registerPatientMutation.data.registration_date}
                    </Typography>
                  </Grid>
                </Grid>
              </Alert>
            </Fade>
          )}

          {/* Error Message */}
          {registerPatientMutation.isError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              Registration failed. Please try again.
            </Alert>
          )}

          {/* Info Note */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Each patient will receive a unique patient number (PN###)
              for all medical analyses and reports.
            </Typography>
          </Alert>
        </Paper>
      </Fade>
    </Container>
  )
}

export default PatientRegistration
