// Web-adapted CardView component - Preserving exact UI and functionality
import React, { useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Colors } from '../../../../theme/colors';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { ShopImgs, ShopListImgs } from '../../../../constants/AllImages';
import { useShopAction } from '../../../../redux/actionHooks/useShopAction';
import { ScreenName } from '../../../../constants/screenConstants';
import { insertuses_log } from '../../../../database/WebDatabaseHelpers';
import {
  contactSplitLogic,
  getCurrentDateTime,
  getCurrentDateTimeT,
  isLocationEmpty,
  openMap,
  openPhoneDialer,
  writeErrorLog,
} from '../../../../utility/utils';
import {
  ShopCheckOutAlertHandler,
  weeklyOffShopAlertHandler,
} from '../../../Order/Functions/Validations';
import { useLoginAction } from '../../../../redux/actionHooks/useLoginAction';
import Loader from '../../../../components/Loader/Loader';
import {
  SaveMeetingForEndAndSubmitButton,
  ShopCheckOutFunc,
} from '../../ShopsDetails/Functions/ShopDetailCommonFunc';
import { useNavigate } from 'react-router-dom';

interface listViewProps {
  party: string;
  outletInfo: string;
  shopId: string;
  navigation?: any;
  weeklyoff: string;
  isEntered?: boolean;
  latitude?: string | null;
  longitude?: string | null;
  isNewParty?: boolean | null;
}

const CardView = (props: listViewProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    party,
    outletInfo,
    shopId,
    navigation,
    weeklyoff,
    isEntered,
    latitude,
    longitude,
    isNewParty,
  } = props;
  const {
    isDarkMode,
    isShopCheckedIn,
    blockedShopName,
    geofenceGlobalSettingsAction,
    isLogWritingEnabled,
    setIsShopCheckIn,
    persistedStartTime,
    setPersistStartTime,
    setBlockedShopDetail,
    setIsNavigationSourceShopsAction,
  } = useGlobleAction();
  const { setSelectedShopData, setIsNavigatedFromShops } = useShopAction();
  let week = moment().format('dddd');
  let weekDay = week.toUpperCase();
  const { userId } = useLoginAction();
  const [isLoading, setisLoading] = useState(false);
  const { meetingEndBlocker } = useGlobleAction();

  const CheckOutFunc = async () => {
    if (blockedShopName?.fromShopCheckout) {
      const result = await ShopCheckOutFunc(
        blockedShopName?.shopId,
        persistedStartTime || getCurrentDateTimeT(),
        latitude || 0,
        longitude || 0,
        '',
        {
          setPersistStartTime,
          setBlockedShopDetail,
          setIsShopCheckIn,
        },
        isShopCheckedIn,
        t,
      );

      if (!result.success) {
        writeErrorLog('CheckOutFunc CardView', result.error);
        console.log('CardView CheckOut failed', result.error);
      }
    } else {
      try {
        await SaveMeetingForEndAndSubmitButton(
          '',
          meetingEndBlocker.Meeting_Id,
          meetingEndBlocker?.EntityTypeID,
          meetingEndBlocker?.ActivityTitle,
          meetingEndBlocker?.PlannedDate,
          meetingEndBlocker?.IsActivityDone,
          meetingEndBlocker?.EntityType,
          persistedStartTime || getCurrentDateTimeT(),
          latitude || '0',
          longitude || '0',
          userId,
          {
            setPersistStartTime,
            setBlockedShopDetail,
            setIsShopCheckIn,
          },
          t,
        );
      } catch (error) {
        console.log('err -->', error);
      }
    }
  };

  const onCardPress = async (
    shopId: string,
    party: string,
    outletInfo: string,
    isNewParty: boolean | null | undefined,
  ) => {
    setIsNavigationSourceShopsAction(true);
    setSelectedShopData({ shopId, party, outletInfo });
    let datetime = await getCurrentDateTime();
    if (isLogWritingEnabled) {
      await insertuses_log(`Selected Shop Id - ${shopId}`, datetime, 'false');
    }

    if (isShopCheckedIn) {
      if (shopId === blockedShopName?.shopId) {
        navigate(`/${ScreenName.SHOPSDETAIL}`, {
          state: { shopId, party, outletInfo, isNewParty },
        });
      } else {
        ShopCheckOutAlertHandler(
          blockedShopName?.partyName,
          blockedShopName?.fromShopCheckout,
          async (onPress) => {
            if (onPress) {
              await CheckOutFunc();
            }
          },
        );
      }
    } else {
      navigate(`/${ScreenName.SHOPSDETAIL}`, {
        state: { shopId, party, outletInfo, isNewParty },
      });
    }
  };

  function geofenceAvailibiltyIconRender(
    latitude: string | undefined | null,
    isEntered: Boolean | undefined,
    isNewParty: boolean | null | undefined,
  ) {
    if (
      latitude == null ||
      latitude == 'null' ||
      latitude == '' ||
      latitude == '0' ||
      isNewParty
    ) {
      return (
        <Box
          component="img"
          src={ShopListImgs.not_registered_geofenceIcon}
          alt="Not Registered"
          sx={{
            position: 'absolute',
            top: '4%',
            left: '94%',
            width: '18px',
            height: '18px',
          }}
        />
      );
    } else if (isEntered) {
      return (
        <Box
          component="img"
          src={ShopListImgs.in_geofenceIcon}
          alt="In Geofence"
          sx={{
            position: 'absolute',
            top: '4%',
            left: '94%',
            width: '18px',
            height: '18px',
          }}
        />
      );
    } else {
      return (
        <Box
          component="img"
          src={ShopListImgs.not_in_geofenceIcon}
          alt="Out Geofence"
          sx={{
            position: 'absolute',
            top: '4%',
            left: '94%',
            width: '18px',
            height: '18px',
          }}
        />
      );
    }
  }

  function geofenceValidationAndProcessing(
    shopId: string,
    party: string,
    outletInfo: string,
  ) {
    if (
      !geofenceGlobalSettingsAction?.IsLocationRestriction ||
      latitude == null ||
      latitude == 'null' ||
      latitude == '' ||
      latitude == '0' ||
      isEntered ||
      isNewParty
    ) {
      onCardPress(shopId, party, outletInfo, isNewParty);
    } else {
      window.alert(
        (t('CardView.AlertNotInGeofenceTitle') || 'Not in Geofence') +
          '\n' +
          (t('CardView.AlertNotInGeofenceSubTitle') ||
            'You are not within the geofence area'),
      );
    }
  }

  const handleLongPress = async () => {
    if (
      geofenceGlobalSettingsAction?.IsGeoFencingEnabled &&
      geofenceGlobalSettingsAction?.IsLocationRestriction &&
      !isLocationEmpty(latitude) &&
      !isEntered
    ) {
      const confirmed = window.confirm(
        (t('CardView.AlertNotInGeofenceTitleGoAhead') ||
          'Not in Geofence - Go Ahead?') +
          '\n' +
          (t('CardView.AlertNotInGeofenceSubTitleGoAhead') ||
            'Do you want to proceed anyway?'),
      );
      if (confirmed) {
        setisLoading(true);
        try {
          // Web: Use Web Geolocation API
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 5000,
              });
            },
          );
          let datetime = await getCurrentDateTime();
          await insertuses_log(
            `Geofence Force Enter Captured By userID = ${userId}  Shop Id - ${shopId}  at location Lat = ${position.coords.latitude} long = ${position.coords.longitude}`,
            datetime,
            'false',
          );
          setisLoading(false);
          onCardPress(shopId, party, outletInfo, isNewParty);
        } catch (error) {
          console.error('Error getting location:', error);
          setisLoading(false);
        }
      }
    }
  };

  return (
    <Box sx={{ marginTop: '3vh' }}>
      <Loader visible={isLoading} />
      <Box
        onClick={() => {
          if (weekDay == weeklyoff) {
            weeklyOffShopAlertHandler((onPress) => {
              if (onPress) {
                geofenceValidationAndProcessing(shopId, party, outletInfo);
              }
            });
          } else {
            geofenceValidationAndProcessing(shopId, party, outletInfo);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress();
        }}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.7,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: '#FFFFFF',
            borderColor: Colors.border,
            justifyContent: 'center',
            alignSelf: 'center',
            borderRadius: '2vw',
            height: '18vh',
            width: '90vw',
            border: `0.3vh solid ${Colors.border}`,
            margin: '0 4vw',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <Box
              component="img"
              src={
                weekDay == weeklyoff
                  ? ShopImgs.weeklyoff
                  : ShopImgs.ShopImg
              }
              alt="Shop"
              sx={{
                marginLeft: '5vw',
                height: '10vh',
                width: '10vh',
              }}
            />
          </Box>
          <Box
            sx={{
              flex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginTop: '-3vh',
              marginLeft: '15vw',
            }}
          >
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '14px',
                marginTop: '2vh',
              }}
            >
              {party}
            </Typography>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '10px',
                marginTop: '3vw',
              }}
            >
              {outletInfo.split('||')[0]}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              flexDirection: 'row',
              marginLeft: '5vw',
            }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                const result = contactSplitLogic(outletInfo);
                if (result != undefined) {
                  openPhoneDialer(result);
                }
              }}
              sx={{
                justifyContent: 'center',
                backgroundColor: '#e6ebe7',
                borderRadius: '20px',
                width: '28px',
                height: '26px',
                minWidth: '28px',
                padding: 0,
                '&:hover': {
                  backgroundColor: '#d0d5d6',
                },
              }}
            >
              <Typography
                sx={{
                  color: '#3955CB',
                  fontFamily: 'Proxima Nova, sans-serif',
                  fontSize: '12px',
                }}
              >
                {t('Info.InfoCall') || 'Call'}
              </Typography>
            </Button>
          </Box>
          {geofenceGlobalSettingsAction?.IsGeoFencingEnabled &&
            !isLocationEmpty(latitude) && (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  flexDirection: 'row',
                  marginLeft: '1vw',
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    openMap({
                      lat: latitude ? parseFloat(latitude) : 0.0,
                      lng: longitude ? parseFloat(longitude) : 0.0,
                      label: party,
                    });
                  }}
                  sx={{
                    width: '28px',
                    height: '28px',
                    padding: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={ShopImgs.directions}
                    alt="Directions"
                    sx={{
                      height: '28px',
                      width: '28px',
                    }}
                  />
                </IconButton>
              </Box>
            )}
          {geofenceGlobalSettingsAction?.IsGeoFencingEnabled &&
            geofenceGlobalSettingsAction?.IsLocationRestriction &&
            geofenceAvailibiltyIconRender(latitude, isEntered, isNewParty)}
        </Box>
      </Box>
    </Box>
  );
};

export default CardView;

