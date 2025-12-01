import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material'
import { PersonAdd as PersonAddIcon } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation } from 'react-query'

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
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PersonAddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
            Patient Registration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Register a new patient to start medical analysis
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Patient Full Name"
                variant="outlined"
                value={patientName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientName(e.target.value)}
                placeholder="Enter patient's full name"
                required
                disabled={registerPatientMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                variant="outlined"
                value={age}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(e.target.value)}
                placeholder="Enter age"
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Area/City"
                variant="outlined"
                value={area}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArea(e.target.value)}
                placeholder="Enter area or city"
                required
                disabled={registerPatientMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Address"
                variant="outlined"
                multiline
                rows={3}
                value={address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                placeholder="Enter complete address"
                required
                disabled={registerPatientMutation.isLoading}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, mb: 3 }}>
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
              startIcon={
                registerPatientMutation.isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <PersonAddIcon />
                )
              }
            >
              {registerPatientMutation.isLoading ? 'Registering...' : 'Register Patient'}
            </Button>
          </Box>
        </form>

        {registerPatientMutation.data && (
          <Card sx={{ bgcolor: 'success.50', border: 1, borderColor: 'success.200' }}>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                Registration Successful!
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Patient Name:</strong> {registerPatientMutation.data.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Age:</strong> {registerPatientMutation.data.age}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Gender:</strong> {registerPatientMutation.data.gender}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Area:</strong> {registerPatientMutation.data.area}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Patient Number:</strong> {registerPatientMutation.data.patient_number}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Registration Date:</strong> {registerPatientMutation.data.registration_date}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Address:</strong> {registerPatientMutation.data.address}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {registerPatientMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Registration failed. Please try again.
          </Alert>
        )}

        <Box sx={{ mt: 4, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
          <Typography variant="body2" color="info.main">
            <strong>Note:</strong> Each patient will receive a unique patient number (PN###) 
            that will be used for all medical analyses and reports.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default PatientRegistration
