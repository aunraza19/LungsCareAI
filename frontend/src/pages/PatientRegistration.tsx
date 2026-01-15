import React, { useState } from 'react'
import {
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
  Stack,
  Card,
  CardContent
} from '@mui/material'
import { PersonAdd as PersonAddIcon } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useMutation } from 'react-query'

interface PatientVars {
  name: string
  age: number
  gender: string
  area: string
  address: string
}

const PatientRegistration: React.FC = () => {
  const [patientName, setPatientName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')

  // Explicit typing: <ResponseData, Error, Variables>
  const registerPatientMutation = useMutation<any, Error, PatientVars>(
    async (patientData) => {
      const response = await fetch('/api/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      })
      if (!response.ok) throw new Error('Failed to register patient')
      return response.json()
    },
    {
      onSuccess: (data) => {
        toast.success(`Patient ${data.name} registered`)
        setPatientName(''); setAge(''); setGender(''); setArea(''); setAddress('');
      },
      onError: (error) => {
        toast.error(error.message)
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerPatientMutation.mutate({
      name: patientName.trim(),
      age: parseInt(age),
      gender,
      area: area.trim(),
      address: address.trim()
    })
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>New Patient Registration</Typography>
        <Typography color="text.secondary">Enter patient details to generate a unique ID for analysis.</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    label="Full Name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    fullWidth
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={gender}
                          label="Gender"
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <TextField
                    label="Area/City"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                    fullWidth
                  />

                  <TextField
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    multiline
                    rows={3}
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={registerPatientMutation.isLoading}
                    startIcon={<PersonAddIcon />}
                  >
                    {registerPatientMutation.isLoading ? 'Registering...' : 'Register Patient'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {registerPatientMutation.data && (
          <Grid item xs={12}>
            <Alert severity="success" variant="filled">
              <Typography variant="subtitle1" fontWeight={600}>Registration Complete</Typography>
              <Typography variant="body2">
                Patient ID: <strong>{registerPatientMutation.data.patient_number}</strong>
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default PatientRegistration