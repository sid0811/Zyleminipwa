// Web-adapted Schemes TabScreen - Structured placeholder
// TODO: Complete implementation when schemes functionality is available
import React from 'react';
import CustomSafeView from '../../../../components/GlobalComponent/CustomSafeView';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface OrderProps {
  navigation?: any;
}

const Schemes = (props: OrderProps) => {
  const { t } = useTranslation();

  return (
    <CustomSafeView>
      <Box sx={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#8C7878' }}>
          {t('Schemes.Title') || 'Schemes'}
        </Typography>
        <Typography sx={{ marginTop: '20px', color: '#8C7878' }}>
          {t('Schemes.ComingSoon') || 'Schemes feature coming soon'}
        </Typography>
      </Box>
    </CustomSafeView>
  );
};

export default Schemes;


