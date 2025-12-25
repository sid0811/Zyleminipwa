// Web-adapted SyncProgressOverlay component
import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import { Colors } from '../../theme/colors';

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

  const percentage = (progress.current / progress.total) * 100;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...(isSideMenu && {
          bottom: '50vh',
        }),
      }}
    >
      <Paper
        elevation={8}
        sx={{
          backgroundColor: Colors.white,
          borderRadius: '12px',
          padding: '24px',
          minWidth: '80vw',
          maxWidth: '400px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                flex: 1,
                fontSize: '16px',
                color: Colors.black,
                fontWeight: 500,
                mr: 2,
              }}
            >
              {progress.message}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '16px',
                color: Colors.mainBackground,
                fontWeight: 'bold',
              }}
            >
              {Math.round(percentage)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: '8px',
              borderRadius: '4px',
              backgroundColor: '#E0E0E0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: Colors.mainBackground,
                borderRadius: '4px',
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default SyncProgressOverlay;


