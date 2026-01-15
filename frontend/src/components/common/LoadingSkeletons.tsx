import React from 'react'
import { Skeleton, Box, Card, CardContent, Grid } from '@mui/material'

// General page loading skeleton
export const PageSkeleton: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 4 }} />
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
    <Grid container spacing={2}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} md={4} key={i}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  </Box>
)

// Patient card skeleton
export const PatientCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      </Box>
      <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
    </CardContent>
  </Card>
)

// Analysis result skeleton
export const AnalysisResultSkeleton: React.FC = () => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Skeleton variant="text" width="50%" height={36} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
      </Box>
      <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1, mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
)

// Chat message skeleton
export const ChatMessageSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
    <Skeleton variant="circular" width={40} height={40} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
    </Box>
  </Box>
)

// Table row skeleton
export const TableRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, i) => (
      <Box
        key={i}
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Skeleton variant="circular" width={36} height={36} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="70%" height={24} />
          <Skeleton variant="text" width="40%" height={18} />
        </Box>
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
      </Box>
    ))}
  </Box>
)

// Report card skeleton
export const ReportCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Skeleton variant="text" width={150} height={28} />
          <Skeleton variant="text" width={100} height={20} />
        </Box>
        <Skeleton variant="rectangular" width={100} height={28} sx={{ borderRadius: 2 }} />
      </Box>
      {[1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            p: 1.5,
            mb: 1,
            bgcolor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Skeleton variant="text" width={120} height={22} />
              <Skeleton variant="text" width={80} height={18} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={70} height={30} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={70} height={30} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
        </Box>
      ))}
    </CardContent>
  </Card>
)

export default {
  PageSkeleton,
  PatientCardSkeleton,
  AnalysisResultSkeleton,
  ChatMessageSkeleton,
  TableRowSkeleton,
  ReportCardSkeleton,
}

