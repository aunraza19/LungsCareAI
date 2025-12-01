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
  Alert
} from '@mui/material'
import {
  Description as ReportIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material'
import { useQuery } from 'react-query'

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
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <ReportIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
            Medical Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and download patient analysis reports
          </Typography>
        </Box>

        {isLoading ? (
          <Alert severity="info">Loading patient reports...</Alert>
        ) : patientsData?.patients?.length === 0 ? (
          <Alert severity="info">
            No patients registered yet. Register patients and perform analyses to see reports here.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {patientsData?.patients?.map((patient: any, index: number) => (
              <Grid item xs={12} md={6} key={`${patient.patient_number}-${index}`}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
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
                            p: 1,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            mb: 1
                          }}>
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {report.type} Analysis
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(report.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Button
                                size="small"
                                startIcon={<ViewIcon />}
                                onClick={() => {
                                  // Convert backend report path to static URL
                                  const fileName = report.report_path.split('/').pop()
                                  window.open(`/static/reports/${fileName}`, '_blank')
                                }}
                              >
                                View Report
                              </Button>
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => {
                                  // Extract filename from report path for download API
                                  const fileName = report.report_path.split('/').pop()
                                  window.open(`/api/download/report/${fileName}`, '_blank')
                                }}
                              >
                                Download
                              </Button>
                              {report.visualization_path && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<ViewIcon />}
                                  onClick={() => {
                                    // Convert backend visualization path to static URL
                                    const fileName = report.visualization_path.split('/').pop()
                                    window.open(`/static/outputs/${fileName}`, '_blank')
                                  }}
                                >
                                  View XAI
                                </Button>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        No analysis reports available for this patient yet.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 4, p: 3, bgcolor: 'info.50', borderRadius: 2 }}>
          <Typography variant="h6" color="info.main" gutterBottom>
            About Medical Reports
          </Typography>
          <Typography variant="body2" color="info.dark">
            • All reports are generated automatically after analysis completion<br/>
            • Reports include detailed AI analysis and medical recommendations<br/>
            • PDF reports can be downloaded and shared with healthcare providers<br/>
            • Visualizations show AI explainability features when available
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default Reports
