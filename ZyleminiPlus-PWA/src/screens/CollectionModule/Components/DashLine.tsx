// Web-adapted DashLine component
import React from 'react';
import { Box } from '@mui/material';
import { Colors } from '../../../theme/colors';

export default function DashLine() {
  return (
    <Box
      component="hr"
      sx={{
        width: '100%',
        border: 'none',
        borderTop: `1px solid ${Colors.border || '#707070'}`,
        margin: 0,
        padding: 0,
      }}
    />
  );
}

