/**
 * SyncProgressOverlay Component - PWA Version
 * Displays sync progress with progress bar
 */
import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';

interface SyncProgressOverlayProps {
  visible: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
  };
  isSideMenu?: boolean;
}

const SyncProgressOverlay: React.FC<SyncProgressOverlayProps> = ({
  visible,
  progress,
  isSideMenu = false,
}) => {
  if (!visible) return null;

  const progressPercentage = (progress.current / progress.total) * 100;

  return (
    <Box
      sx={{
        height: isSideMenu ? '40%' : '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: isSideMenu ? '50%' : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          mx: 2,
          p: 3,
          minWidth: { xs: '90%', sm: '500px' },
          maxWidth: '600px',
          borderRadius: 2,
        }}
      >
        {/* Progress Text */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              flex: 1,
              fontWeight: 500,
              mr: 1,
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            {progress.message}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            {progress.current}%
          </Typography>
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 10,
            borderRadius: 1,
            backgroundColor: '#E0E0E0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default SyncProgressOverlay;
