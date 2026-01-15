import React from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Fade,
  Stack
} from '@mui/material'
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
  Air as LungIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import LungLoader from '../components/common/LungLoader'

const Reports: React.FC = () => {
  const { data: patientsData, isLoading } = useQuery('patients', async () => {
    const response = await fetch('/api/patients')
    return response.json()
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
              Medical Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and download patient analysis reports
            </Typography>
          </Box>

          {/* Loading State */}
          {isLoading ? (
            <LungLoader size="medium" message="Loading reports..." />
          ) : patientsData?.patients?.length === 0 ? (
            <Alert severity="info">
              No patients registered yet. Register patients and perform analyses to see reports here.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {patientsData?.patients?.map((patient: any, index: number) => (
                <Grid item xs={12} md={6} key={`${patient.patient_number}-${index}`}>
                  <Card
                    elevation={1}
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent>
                      {/* Patient Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {patient.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {patient.patient_number}
                          </Typography>
                        </Box>
                        <Chip
                          icon={<TimeIcon />}
                          label={formatDate(patient.registration_date)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {/* Reports List */}
                      {patient.reports && patient.reports.length > 0 ? (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Reports ({patient.reports.length})
                          </Typography>
                          <Stack spacing={1}>
                            {patient.reports.map((report: any, idx: number) => (
                              <Box
                                key={idx}
                                sx={{
                                  p: 1.5,
                                  bgcolor: 'action.hover',
                                  borderRadius: 1,
                                  border: 1,
                                  borderColor: 'divider',
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {report.type}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDate(report.date)}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={report.result}
                                    size="small"
                                    color={report.result === 'Normal' ? 'success' : 'warning'}
                                  />
                                </Box>
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<ViewIcon />}
                                    onClick={() => {
                                      const fileName = report.report_path.split('/').pop()
                                      window.open(`/static/reports/${fileName}`, '_blank')
                                    }}
                                    fullWidth
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => {
                                      const fileName = report.report_path.split('/').pop()
                                      window.open(`/api/download/report/${fileName}`, '_blank')
                                    }}
                                    fullWidth
                                  >
                                    Download
                                  </Button>
                                </Stack>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      ) : (
                        <Alert severity="info">
                          No reports available for this patient yet.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Info Section */}
          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body2">
              <strong>About Reports:</strong> All reports are automatically generated after analysis.
              PDF reports include detailed AI analysis and can be shared with healthcare providers.
            </Typography>
          </Alert>
        </Paper>
      </Fade>
    </Container>
  )
}

export default Reports
