// Web-adapted TeamPerformanceReport component - Simplified placeholder
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TeamPerformanceReport: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ padding: '20px' }}>
      <Paper elevation={2} sx={{ padding: '20px' }}>
        <Typography variant="h5" gutterBottom>
          {t('Dashboard.TeamPerformance') || 'Team Performance Report'}
        </Typography>
        <Typography variant="body1" sx={{ marginTop: '20px' }}>
          Team performance report will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TeamPerformanceReport;


