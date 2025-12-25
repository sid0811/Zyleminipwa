import { Box, Skeleton, Paper } from '@mui/material';
import { Colors } from '../../theme/colors';

interface LoadingSkeletonProps {
  variant?: 'list' | 'card' | 'form' | 'table' | 'detail';
  count?: number;
}

const LoadingSkeleton = ({ variant = 'list', count = 5 }: LoadingSkeletonProps) => {
  if (variant === 'list') {
    return (
      <Box sx={{ px: 2.5, py: 1 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
              <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2, p: 2.5 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Paper
            key={index}
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
            }}
          >
            <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 1, mb: 2 }} />
            <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton variant="rectangular" width="48%" height={36} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="48%" height={36} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  if (variant === 'form') {
    return (
      <Paper elevation={2} sx={{ p: 3, m: 2.5, borderRadius: 2 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Skeleton variant="rectangular" width="48%" height={48} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="48%" height={48} sx={{ borderRadius: 1 }} />
        </Box>
      </Paper>
    );
  }

  if (variant === 'table') {
    return (
      <Paper elevation={2} sx={{ p: 2, m: 2.5, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, pb: 2, borderBottom: `1px solid ${Colors.border}` }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="text" width="25%" height={24} />
          ))}
        </Box>
        {/* Rows */}
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, pb: 2, borderBottom: `1px solid ${Colors.border}` }}>
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width="25%" height={20} />
            ))}
          </Box>
        ))}
      </Paper>
    );
  }

  if (variant === 'detail') {
    return (
      <Paper elevation={2} sx={{ p: 3, m: 2.5, borderRadius: 2 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Skeleton variant="rectangular" width={120} height={120} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Box key={index}>
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="70%" height={24} />
            </Box>
          ))}
        </Box>
      </Paper>
    );
  }

  return null;
};

export default LoadingSkeleton;

