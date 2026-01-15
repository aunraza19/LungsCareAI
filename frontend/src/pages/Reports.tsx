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
  alpha
} from '@mui/material'
import {
  Description as ReportIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
  Air as LungIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import LungLoader from '../components/common/LungLoader'
import { PatientCardSkeleton } from '../components/common/LoadingSkeletons'

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
    <Container maxWidth="lg">
      <Fade in timeout={500}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LungIcon
              sx={{
                fontSize: 56,
                color: 'secondary.main',
                mb: 2,
                animation: 'breathe 3s ease-in-out infinite',
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="700">
              Medical Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and download patient analysis reports
            </Typography>
          </Box>

          {isLoading ? (
            <Box>
              <LungLoader size="medium" message="Loading patient reports..." />
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <PatientCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : patientsData?.patients?.length === 0 ? (
            <Alert
              severity="info"
              sx={{ borderRadius: 2 }}
            >
              No patients registered yet. Register patients and perform analyses to see reports here.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {patientsData?.patients?.map((patient: any, index: number) => (
                <Grid item xs={12} md={6} key={`${patient.patient_number}-${index}`}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                          }}>
                            <PersonIcon sx={{ color: 'secondary.main' }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="600">
                              {patient.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {patient.patient_number}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          icon={<TimeIcon />}
                          label={formatDate(patient.registration_date)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                    {patient.reports && patient.reports.length > 0 ? (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Analysis Reports ({patient.reports.length})
                        </Typography>
                        {patient.reports.map((report: any, index: number) => (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: 1.5,
                            bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                            borderRadius: 2,
                            mb: 1,
                            border: 1,
                            borderColor: 'divider',
                          }}>
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {report.type} Analysis
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(report.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Button
                                size="small"
                                startIcon={<ViewIcon />}
                                onClick={() => {
                                  const fileName = report.report_path.split('/').pop()
                                  window.open(`/static/reports/${fileName}`, '_blank')
                                }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => {
                                  const fileName = report.report_path.split('/').pop()
                                  window.open(`/api/download/report/${fileName}`, '_blank')
                                }}
                              >
                                Download
                              </Button>
                              {report.visualization_path && (
                                <Button
                                  size="small"
                                  color="secondary"
                                  startIcon={<ViewIcon />}
                                  onClick={() => {
                                    const fileName = report.visualization_path.split('/').pop()
                                    window.open(`/static/outputs/${fileName}`, '_blank')
                                  }}
                                >
                                  XAI
                                </Button>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                        No analysis reports available for this patient yet.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{
          mt: 4,
          p: 3,
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
          borderRadius: 3,
          border: 1,
          borderColor: (theme) => alpha(theme.palette.info.main, 0.3),
        }}>
          <Typography variant="h6" color="info.main" gutterBottom fontWeight={600}>
            📋 About Medical Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • All reports are generated automatically after analysis completion<br/>
            • Reports include detailed AI analysis and medical recommendations<br/>
            • PDF reports can be downloaded and shared with healthcare providers<br/>
            • Visualizations show AI explainability features when available
          </Typography>
        </Box>
      </Paper>
      </Fade>
    </Container>
  )
}

export default Reports
