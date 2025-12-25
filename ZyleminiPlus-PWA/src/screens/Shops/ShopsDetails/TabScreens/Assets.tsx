// Web-adapted Assets TabScreen - Structured placeholder
// TODO: Complete implementation with database functions and component integration
import React, { useCallback, useState, useEffect } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../../theme/colors';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { useShopAction } from '../../../../redux/actionHooks/useShopAction';
import { useLoginAction } from '../../../../redux/actionHooks/useLoginAction';
import CustomSafeView from '../../../../components/GlobalComponent/CustomSafeView';
import { ShopImgs } from '../../../../constants/AllImages';
import { writeErrorLog } from '../../../../utility/utils';
// TODO: Import database functions when available
// import { getAseetListInfo, getOrderIdForAssetList } from '../../../../database/WebDatabaseHelpers';

interface OrderProps {
  navigation?: any;
}

const Assets = (props: OrderProps) => {
  const { navigation } = props;
  const { isDarkMode } = useGlobleAction();
  const { selectedShopData } = useShopAction();
  const { userId } = useLoginAction();
  const { t } = useTranslation();

  const [totalAssets, setTotalAssets] = useState<any[]>([]);

  useEffect(() => {
    takeDataFromDB();
  }, []);

  const takeDataFromDB = async () => {
    try {
      // TODO: Implement database calls
      // await getOrderIdForAssetList('5', selectedShopData?.shopId).then(async (data: any) => {
      //   let TotalAssset: any = [];
      //   for (let i = 0; i < data.length; i++) {
      //     await getAseetListInfo(data[i].id).then((data1: any) => {
      //       for (let j = 0; j < data1.length; j++) {
      //         TotalAssset.push(data1[0]);
      //       }
      //       setTotalAssets(TotalAssset);
      //     });
      //   }
      // });
      console.log('Assets: takeDataFromDB - TODO: Implement database calls');
    } catch (error) {
      writeErrorLog('takeDataFromDB', error);
    }
  };

  const renderItems = (item: any, index: number) => {
    return (
      <Box key={index} sx={{ marginTop: '3vh' }}>
        <Box
          sx={{
            backgroundColor: Colors.DarkBrown,
            height: '8vh',
            width: '90vw',
            borderTopLeftRadius: '2vw',
            borderTopRightRadius: '2vw',
            marginTop: '-1vh',
            alignSelf: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontFamily: 'Proxima Nova, sans-serif',
              fontSize: '14px',
              marginLeft: '4vw',
            }}
          >
            {t('Asset.AssetId')} {item.AssetID || 'N/A'}
          </Typography>
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
            padding: '3vh 4vw',
          }}
        >
          <Box
            sx={{
              marginTop: '3vh',
              backgroundColor: '#F8F4F4',
              alignSelf: 'center',
              height: '25vh',
              width: '81vw',
              borderRadius: '1vw',
              justifyContent: 'center',
            }}
          >
            <img
              src={ShopImgs.ShopImg}
              alt="Asset"
              style={{ alignSelf: 'center', height: '20vh' }}
            />
          </Box>
          <Box sx={{ marginTop: '2vh', display: 'flex', flexDirection: 'row', marginLeft: '4vw' }}>
            <Box sx={{ flex: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography
                sx={{
                  color: '#362828',
                  fontWeight: 'bold',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                }}
              >
                {t('Asset.AssetInstallationDate')}
              </Typography>
              <Typography
                sx={{
                  color: '#362828',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                  marginTop: '1.5vh',
                }}
              >
                20 Dec 2016
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography
                sx={{
                  color: '#362828',
                  fontWeight: 'bold',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                }}
              >
                {t('Asset.AssetLastAudit')}
              </Typography>
              <Typography
                sx={{
                  color: '#362828',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                  marginTop: '1.5vh',
                }}
              >
                {item.AuditDate || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography
                sx={{
                  color: '#362828',
                  fontWeight: 'bold',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                  alignSelf: 'flex-start',
                }}
              >
                {t('Asset.AssetCondition')}
              </Typography>
              <Typography
                sx={{
                  color: '#362828',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                  marginTop: '1.5vh',
                }}
              >
                {item.Condition || 'N/A'}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ marginTop: '2vh', marginBottom: '2vh' }} />
          <Box sx={{ display: 'flex', flexDirection: 'row', marginLeft: '4vw' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography
                sx={{
                  color: '#362828',
                  fontWeight: 'bold',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                }}
              >
                {t('Asset.AssetAssetType')}
              </Typography>
              <Typography
                sx={{
                  color: '#362828',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                  marginTop: '1vh',
                }}
              >
                {item.AssetInformation?.split('||')[1]?.split(':')[1] || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography
                sx={{
                  color: '#362828',
                  fontWeight: 'bold',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                }}
              >
                {t('Asset.AssetBrand')}
              </Typography>
              <Typography
                sx={{
                  color: '#362828',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                  marginTop: '1vh',
                }}
              >
                {item.AssetInformation?.split('||')[2]?.split(':')[1] || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography
                sx={{
                  color: '#362828',
                  fontWeight: 'bold',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                }}
              >
                {t('Asset.AssetModelNo')}
              </Typography>
              <Typography
                sx={{
                  color: '#362828',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                  marginTop: '1vh',
                }}
              >
                {item.AssetQRcode || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: '2vh',
        }}
      >
        <Box
          sx={{
            flex: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              color: Colors.mainBackground,
              fontSize: '18px',
              fontWeight: 'bold',
              alignSelf: 'center',
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {totalAssets.length}
          </Typography>
          <Typography
            sx={{
              color: '#8C7878',
              fontSize: '12px',
              fontWeight: 'bold',
              marginTop: '0.5vh',
              alignSelf: 'center',
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {t('Asset.AssetTotalNo') || 'Total Assets'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ marginTop: '10px', backgroundColor: Colors.border }} />

      {totalAssets?.map((item, index) => renderItems(item, index))}
      <Box sx={{ paddingBottom: '100px' }} />
    </>
  );
};

export default Assets;

