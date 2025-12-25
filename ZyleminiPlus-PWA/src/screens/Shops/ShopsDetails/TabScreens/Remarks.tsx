// Web-adapted Remarks TabScreen - Structured placeholder
// TODO: Complete implementation with database functions
import React, { useCallback, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../../theme/colors';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { useShopAction } from '../../../../redux/actionHooks/useShopAction';
import { useLoginAction } from '../../../../redux/actionHooks/useLoginAction';
import CustomSafeView from '../../../../components/GlobalComponent/CustomSafeView';
import { writeErrorLog } from '../../../../utility/utils';
// TODO: Import database functions when available
// import { GetRemarkDetails } from '../../../../database/WebDatabaseHelpers';
// import { getRemarkDetails } from '../../../../types/types';

interface OrderProps {
  navigation?: any;
}

const Remarks = (props: OrderProps) => {
  const { navigation } = props;
  const { isDarkMode } = useGlobleAction();
  const { selectedShopData } = useShopAction();
  const { userId } = useLoginAction();
  const { t } = useTranslation();

  const [totalRemarks, setTotalRemarks] = useState<any[]>([]);

  useEffect(() => {
    takeDataFromDB();
  }, []);

  const takeDataFromDB = async () => {
    try {
      // TODO: Implement database call
      // GetRemarkDetails(selectedShopData?.shopId).then(data => setTotalRemarks(data));
      console.log('Remarks: takeDataFromDB - TODO: Implement database call');
    } catch (error) {
      writeErrorLog('takeDataFromDB', error);
    }
  };

  const renderItems = (item: any, index: number) => {
    return (
      <Box key={index} sx={{ marginTop: '3vh' }}>
        <Box
          sx={{
            backgroundColor: '#d3d3d3',
            height: '8vh',
            width: '90vw',
            borderTopLeftRadius: '2vw',
            borderTopRightRadius: '2vw',
            marginTop: '-1vh',
            alignSelf: 'center',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <Box
            sx={{
              flex: 2.5,
              alignItems: 'flex-start',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '14px',
                marginLeft: '4vw',
              }}
            >
              {t('Activity.ActivityVisitDate')} {item.ExpectedDeliveryDate || 'N/A'}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            borderColor: '#E6DFDF',
            alignSelf: 'center',
            borderBottomLeftRadius: '2vw',
            borderBottomRightRadius: '2vw',
            height: 'auto',
            width: '90vw',
            borderWidth: '0.2vh',
            borderTopWidth: '0',
            marginTop: '2vh',
            marginBottom: '3vh',
            padding: '2vh 4vw',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: '1vh' }}>
            <Typography
              sx={{
                color: 'grey',
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '13px',
              }}
            >
              {t('Activity.Activity')} {t('Activity.MeetingEndActivityStartTime')}
            </Typography>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '14px',
                marginLeft: '1vw',
              }}
            >
              {item.ActivityStart?.substr(8) || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: '1vh' }}>
            <Typography
              sx={{
                color: 'grey',
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '13px',
              }}
            >
              {t('Activity.Activity')} {t('Activity.MeetingEndActivityEndTime')}
            </Typography>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '14px',
                marginLeft: '1vw',
              }}
            >
              {item.ActivityEnd?.substr(8) || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography
              sx={{
                color: 'grey',
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '13px',
              }}
            >
              {t('Activity.ActivityVisitRemark')}
            </Typography>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '14px',
                marginLeft: '1vw',
              }}
            >
              {item.remark || 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <CustomSafeView>
      {totalRemarks?.map((item, index) => renderItems(item, index))}
      <Box sx={{ paddingBottom: '100px' }} />
    </CustomSafeView>
  );
};

export default Remarks;


