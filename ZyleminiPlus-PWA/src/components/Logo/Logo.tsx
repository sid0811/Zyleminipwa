// Web-adapted Logo component - preserving exact original styling
import React from 'react';
import { Box } from '@mui/material';
import { globalImg } from '../../constants/AllImages';

const Logo = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '8vh', // Equivalent to hp('8') - approximately 8% of viewport height
      }}
    >
      <img
        src={globalImg.Logo}
        alt="Zylemini Logo"
        style={{
          width: '30vw', // Equivalent to wp(30) - 30% of viewport width
          height: '21vh', // Equivalent to hp(21) - 21% of viewport height
          objectFit: 'contain',
        }}
        onError={(e) => {
          // Fallback if image doesn't exist
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </Box>
  );
};

export default Logo;

