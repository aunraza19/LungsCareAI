import React from 'react'
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Stack
} from '@mui/material'
import { Download as DownloadIcon, Visibility as ViewIcon } from '@mui/icons-material'
import { useQuery } from 'react-query'
import LungLoader from '../components/common/LungLoader'

const Reports: React.FC = () => {
  const { data: patientsData, isLoading } = useQuery('patients', async () => (await fetch('/api/patients')).json())

  const allReports = patientsData?.patients?.flatMap((patient: any) =>
    patient.reports?.map((report: any) => ({ ...report, patientName: patient.name, patientId: patient.patient_number })) || []
  ) || []

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Report Archive</Typography>
      </Box>

      {isLoading ? (
        <LungLoader />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Result</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allReports.map((report: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{report.patientName}</Typography>
                    <Typography variant="caption">{report.patientId}</Typography>
                  </TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.result}
                      color={report.result === 'Normal' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" startIcon={<ViewIcon />} onClick={() => window.open(`/static/reports/${report.report_path.split('/').pop()}`, '_blank')}>View</Button>
                      <Button size="small" startIcon={<DownloadIcon />} onClick={() => window.open(`/api/download/report/${report.report_path.split('/').pop()}`, '_blank')}>PDF</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {allReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No reports found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default Reports