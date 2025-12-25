// Web-adapted TopCard component for Shops - Preserving exact UI
import React from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import { Colors } from '../../../../theme/colors';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { useTranslation } from 'react-i18next';
import { ShopListImgs } from '../../../../constants/AllImages';

interface topCardProps {
  totalShops: string | number;
  visitShops: number;
  navigation?: any;
  routeID?: string;
  onPressItem?: (calledFrom: number, datageofence?: any) => void;
}

const TopCard = (props: topCardProps) => {
  const { totalShops, visitShops, navigation, routeID, onPressItem } = props;
  const { isDarkMode, geofenceGlobalSettingsAction } = useGlobleAction();
  const { t } = useTranslation();

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
            flex: 0.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              color: Colors.mainBackground,
              fontSize: '18px',
              fontWeight: 'bold',
              marginLeft: '9vw',
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {totalShops}
          </Typography>
          <Typography
            sx={{
              color: '#8C7878',
              fontSize: '12px',
              fontWeight: 'bold',
              marginTop: '0.5vh',
              marginLeft: '6vw',
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {t('Shops.TotalShops') || 'Total Shops'}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 0.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Typography
            sx={{
              color: Colors.mainBackground,
              fontSize: '18px',
              fontWeight: 'bold',
              marginLeft: '6vw', // Original uses wp('6'), not wp('9')
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {visitShops}
          </Typography>
          <Typography
            sx={{
              color: '#8C7878',
              fontSize: '12px',
              fontWeight: 'bold',
              marginTop: '0.5vh',
              marginLeft: '6vw',
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {t('Shops.ShopVisitedToday') || 'Shop Visited Today'}
          </Typography>
        </Box>

        {geofenceGlobalSettingsAction?.IsGeoFencingEnabled && (
          <Box
            sx={{
              flex: 0.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingEnd: '15vw',
            }}
          >
            <IconButton
              onClick={() => {
                onPressItem?.(1, 'data');
              }}
              sx={{ color: Colors.white }}
            >
              <img
                src={ShopListImgs.geofenceIcon}
                alt="Geofence"
                style={{ height: '4.2vh', width: '7.5vw' }}
              />
            </IconButton>
          </Box>
        )}
      </Box>

      {geofenceGlobalSettingsAction?.IsGeoFencingEnabled &&
        geofenceGlobalSettingsAction?.IsLocationRestriction && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: '1vh',
              gap: '2vw',
            }}
          >
            <img
              src={ShopListImgs.in_geofenceIcon}
              alt="In Geofence"
              style={{ height: '2vh', width: '2vw' }}
            />
            <Typography
              sx={{
                color: '#8C7878',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
              }}
            >
              {t('Shops.InGeofence') || 'In Geofence'}
            </Typography>
            <img
              src={ShopListImgs.not_in_geofenceIcon}
              alt="Out Geofence"
              style={{ height: '2vh', width: '2vw' }}
            />
            <Typography
              sx={{
                color: '#8C7878',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
              }}
            >
              {t('Shops.OutGeofence') || 'Out Geofence'}
            </Typography>
            <img
              src={ShopListImgs.not_registered_geofenceIcon}
              alt="Not Registered"
              style={{ height: '2vh', width: '2vw' }}
            />
            <Typography
              sx={{
                color: '#8C7878',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
              }}
            >
              {t('Shops.GeoFenceNotRegistered') || 'GeoFence Not Registered'}
            </Typography>
          </Box>
        )}
      <Divider sx={{ marginTop: '1vh', backgroundColor: Colors.border }} />
    </>
  );
};

export default TopCard;

