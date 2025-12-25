// Web-adapted Meeting TabScreen - Structured placeholder
// TODO: Complete implementation with DateSelectionActivity component
import React from 'react';
import CustomSafeView from '../../../../components/GlobalComponent/CustomSafeView';
import { Box, Typography } from '@mui/material';
import { useShopAction } from '../../../../redux/actionHooks/useShopAction';
import { useOrderAction } from '../../../../redux/actionHooks/useOrderAction';
// TODO: Import DateSelectionActivity component when available
// import DateSelectionActivity from '../../../ActivityModule/DateSelectionActivity';

interface MeetingProps {
  navigation?: any;
}

const MeetingShop = (props: MeetingProps) => {
  const { navigation } = props;
  const { selectedShopData } = useShopAction();
  const { propsData } = useOrderAction();

  console.log('MeetingShop Propsdata', propsData);

  return (
    <CustomSafeView>
      {/* TODO: <DateSelectionActivity
        navigation={navigation}
        selectedShopId={selectedShopData?.shopId}
        isFromShops={true}
        shopData={selectedShopData}
      /> */}
      <Box sx={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#8C7878' }}>
          Meeting Activity
        </Typography>
        <Typography sx={{ marginTop: '20px', color: '#8C7878' }}>
          TODO: Implement DateSelectionActivity component
        </Typography>
        <Typography sx={{ marginTop: '10px', color: '#8C7878', fontSize: '12px' }}>
          Shop ID: {selectedShopData?.shopId || 'N/A'}
        </Typography>
      </Box>
    </CustomSafeView>
  );
};

export default MeetingShop;


