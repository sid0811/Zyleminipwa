// Web-adapted Loader component - preserving exact original styling
// Original: Uses LottieView with globalImg.loaderloading, backgroundColor '#fff', opacity 0.7
// Web: Using img tag for Lottie JSON file (browser may handle animation if supported)
import React from 'react';
import { Box } from '@mui/material';
import { globalImg } from '../../constants/AllImages';

const Loader = ({ visible = false }: { visible?: boolean }) => {
  if (!visible) return null;
  
  return (
    <Box
      sx={{
        backgroundColor: '#fff', // Exact match: original uses '#fff'
        height: '100%',
        opacity: 0.7, // Exact match: original uses opacity 0.7
        position: 'absolute', // Exact match: original uses 'absolute'
        width: '100%',
        zIndex: 1, // Exact match: original uses zIndex 1
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="div"
        sx={{
          height: '140px', // Exact match: original uses height 140, width 140
          width: '140px',
        }}
      >
        {/* Web: Using img tag for Lottie JSON - browser will handle if supported, otherwise shows as image */}
        <img
          src={globalImg.loaderloading}
          alt="Loading"
          style={{
            height: '140px',
            width: '140px',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Box>
  );
};

export default Loader;
