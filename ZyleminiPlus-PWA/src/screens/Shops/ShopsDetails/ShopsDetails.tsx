// Web-adapted ShopsDetails screen - preserving exact UI and logic
import React, { memo, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';

import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import { Colors } from '../../../theme/colors';
import Loader from '../../../components/Loader/Loader';
import { globalImg } from '../../../constants/AllImages';
import ShopDetailHeader from './Component/ShopDetailHeader';
import { useShopAction } from '../../../redux/actionHooks/useShopAction';
import { useNetInfo } from '../../../hooks/useNetInfo';
import {
  getLatLongInPCustomer,
  getNewSingleOutletToGeofence,
  insertuses_log,
  updateLatLongInPCustomer,
} from '../../../database/WebDatabaseHelpers';
import {
  getCurrentDateTime,
  isValidvalue,
  writeErrorLog,
} from '../../../utility/utils';
import useLocation from '../../../hooks/useLocation';
import AlertMessage from '../../../components/Alert/AlertMessage';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { postShopGeolocation } from '../../../api/ShopsAPICalls';
import { ShopsGelocationBody } from '../../../types/types';
import { useGeofenceAction } from '../../../redux/actionHooks/useGeofenceAction';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';

function ShopDetail() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { selectedShopData } = useShopAction();
  const { userId } = useLoginAction();
  const { isNetConnected } = useNetInfo();
  let { latitude, longitude } = useLocation();
  const { setOneTimeGeofenceCaptureCtaClickedEvents } = useGeofenceAction();
  const [isOnetimeCaptureLocationClicked, setIsOnetimeCaptureLocationClicked] =
    useState<Boolean>(false);
  const { geofenceGlobalSettingsAction } = useGlobleAction();
  const [isLocationRequired, setIsLocationRequired] = useState(false);
  const [isLocationEmptyAlert, setIsLocationEmptyAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptureCtaClicked, setIsCapturedCtaClicked] = useState(false);
  const { isLogWritingEnabled } = useGlobleAction();
  const [isNavTrue, setIsNavTrue] = useState(true);
  const [isLocationProcessingMsg, setLocationProcessingMsg] = useState(false);

  // Get shop data from route state
  const shopData = routerLocation.state || selectedShopData;

  useEffect(() => {
    takeDataFromDB();
  }, []);

  useEffect(() => {
    if (isCaptureCtaClicked == true && latitude != 0 && longitude != 0) {
      captureGelocation();
      setIsLocationEmptyAlert(false);
      setIsCapturedCtaClicked(false);
    }
  }, [longitude]);

  const takeDataFromDB = async () => {
    try {
      if (geofenceGlobalSettingsAction?.IsFetchOneTimeLatLogEnabled) {
        getLatLongInPCustomer(shopData?.shopId).then((LatLong) => {
          if (
            LatLong?.length > 0 &&
            (LatLong[0]?.Latitude === 'null' ||
              LatLong[0]?.Latitude === undefined ||
              LatLong[0]?.Latitude === '' ||
              LatLong[0]?.Latitude === '0')
          ) {
            setIsLocationRequired(true);
          }
        });
      }
    } catch (error) {
      writeErrorLog('takeDataFromDB', error);
      console.log('error getting lat long validations -->', error);
    }
  };

  const captureGelocation = async () => {
    setIsLoading(true);
    let datetime = await getCurrentDateTime();
    // If internet is available send data to the server on Capture button press
    if (isNetConnected) {
      console.log('in net conection');
      if (latitude) {
        await postShopGeolocation([
          {
            ShopId: shopData?.shopId,
            Latitude: latitude,
            Longitude: longitude,
          },
        ]);
      }
    }
    // Updates the Lat, Long, & flag in Pcustomer columns
    updateLatLongInPCustomer(
      latitude,
      longitude,
      'N',
      shopData?.shopId,
    ).then(async (insetedData) => {
      // Web: Geofencing is simplified - just log the action
      // Full geofence registration would require a different approach on web
      if (geofenceGlobalSettingsAction?.IsGeoFencingEnabled) {
        getNewSingleOutletToGeofence(shopData.shopId).then(
          (data: ShopsGelocationBody[]) => {
            if (data.length > 0) {
              console.log('Web: Geofence data retrieved (simplified):', data);
              // Web: Geofence registration is simplified
              // In a full implementation, this would use Web Geolocation API
              setOneTimeGeofenceCaptureCtaClickedEvents(true);
            }
          },
        );
      }
    });

    isLogWritingEnabled &&
      insertuses_log(
        `Captured By userID = ${userId} on ShopID = ${shopData?.shopId} sets Lat = ${latitude} long = ${longitude}`,
        datetime,
        'false',
      );

    setIsLoading(false);
    setIsLocationRequired(false);
  };

  console.log('isLocationRequired -->', isLocationRequired);

  return (
    <>
      <AlertMessage
        visible={isLocationRequired}
        message={
          isLocationProcessingMsg
            ? 'Please wait we are fetching your current location...'
            : 'The Location for this Shop is not Available. Please Capture to continue...'
        }
        submitMsg="Capture"
        cancelMsg="Cancel"
        onCancel={() => {
          setIsLocationRequired(false);
          navigate(-1);
        }}
        onClose={() => {
          setLocationProcessingMsg(true);
          if (latitude != 0 && longitude != 0) {
            captureGelocation();
          } else {
            setIsCapturedCtaClicked(true);
            setIsLocationRequired(false);
            setIsLocationEmptyAlert(true);
          }
        }}
        isCtaDisable={isLocationProcessingMsg}
      />
      <AlertMessage
        visible={isLocationEmptyAlert}
        message="Please wait we are fetching your current location"
        submitMsg="Cancel"
        cancelMsg=""
        onCancel={() => {}}
        onClose={() => {
          setIsLocationEmptyAlert(false);
          navigate(-1);
        }}
      />
      <Loader visible={isLoading} />
      <>
        <Box
          sx={{
            backgroundColor: Colors.mainBackground,
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <Box
            component="div"
            sx={{
              backgroundImage: `url(${globalImg.backgrnd})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <ShopDetailHeader
              onPress={() => {}}
              selectedShopDetail={shopData}
            />

            <Box sx={styles().shopNameBG}>
              <Typography sx={styles().shopNameTextStyle}>
                {shopData?.party}
              </Typography>
              <Typography sx={styles().shopAddressTextStyle}>
                {shopData?.outletInfo?.split('||')[0]}
              </Typography>
            </Box>
          </Box>
        </Box>
      </>
    </>
  );
}

const styles = (isDarkMode?: boolean | undefined) => ({
  headerMainContainer: {
    height: 'auto',
    backgroundColor: Colors.mainBackground,
    paddingBottom: '25px',
  },
  shopNameBG: {
    backgroundColor: Colors.mainBackground,
  },
  shopNameTextStyle: {
    color: '#F8F4F4',
    fontSize: '14px',
    fontFamily: 'Proxima Nova, sans-serif',
    fontWeight: 'bold',
    marginLeft: '6vw',
    marginTop: '2vh',
  },
  shopAddressTextStyle: {
    color: '#FFFFFF',
    fontSize: '12px',
    fontFamily: 'Proxima Nova, sans-serif',
    fontWeight: 'bold',
    marginLeft: '6vw',
    marginTop: '1vh',
    marginBottom: '1vh',
  },
});

export default memo(ShopDetail);

