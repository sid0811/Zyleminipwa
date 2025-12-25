// Web-adapted ListCardView component
import React from 'react';
import { Box, Typography, Card, CardContent, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../../theme/colors';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { ShopImgs } from '../../../../constants/AllImages';
import { useShopAction } from '../../../../redux/actionHooks/useShopAction';
import { ScreenName } from '../../../../constants/screenConstants';
import { getCurrentDateTime } from '../../../../utility/utils';
import { insertuses_log } from '../../../../database/WebDatabaseHelpers';
import { useNavigate } from 'react-router-dom';
import { openMap, openPhoneDialer } from '../../../../utility/utils';

interface listViewProps {
  party: string;
  outletInfo: string;
  shopId: string;
  navigation?: any;
  weeklyoff: string;
  isEntered?: boolean;
  latitude?: string | null;
  longitude?: string | null;
}

const ListCardView = (props: listViewProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    party,
    outletInfo,
    shopId,
    weeklyoff,
    isEntered,
    latitude,
    longitude,
  } = props;
  const {
    isDarkMode,
    isShopCheckedIn,
    blockedShopName,
    isLogWritingEnabled,
  } = useGlobleAction();

  const { setSelectedShopData } = useShopAction();

  const onCardPress = async (
    shopId: string,
    party: string,
    outletInfo: string,
  ) => {
    setSelectedShopData({ shopId, party, outletInfo });
    let datetime = await getCurrentDateTime();
    if (isLogWritingEnabled) {
      insertuses_log(`Selected Shop Id - ${shopId}`, datetime, 'false');
    }

    if (isShopCheckedIn) {
      if (shopId === blockedShopName?.shopId) {
        navigate(`/${ScreenName.SHOPSDETAIL}`, {
          state: { shopId, party, outletInfo },
        });
      } else {
        window.alert(blockedShopName?.partyName || '');
      }
    } else {
      navigate(`/${ScreenName.SHOPSDETAIL}`, {
        state: { shopId, party, outletInfo },
      });
    }
  };

  const handleNavigate = () => {
    if (latitude && longitude) {
      openMap({ 
        lat: parseFloat(latitude), 
        lng: parseFloat(longitude), 
        label: party || outletInfo || 'Location' 
      });
    }
  };

  const handleCall = () => {
    // Extract phone number from outletInfo if available
    const phoneMatch = outletInfo.match(/\d{10,}/);
    if (phoneMatch) {
      openPhoneDialer(phoneMatch[0]);
    }
  };

  const handleMessage = () => {
    // Extract phone number from outletInfo if available
    const phoneMatch = outletInfo.match(/\d{10,}/);
    if (phoneMatch) {
      window.open(`sms:${phoneMatch[0]}`);
    }
  };

  return (
    <Box
      sx={{
        marginTop: '24px',
      }}
    >
      <Card
        onClick={() => {
          if (latitude == null || latitude == '' || isEntered) {
            onCardPress(shopId, party, outletInfo);
          }
        }}
        sx={{
          backgroundColor: '#FFFFFF',
          borderColor: Colors.border,
          borderRadius: '8px',
          minHeight: '336px',
          width: '90%',
          borderWidth: '1px',
          borderStyle: 'solid',
          margin: '0 auto',
          cursor: latitude == null || latitude == '' || isEntered ? 'pointer' : 'not-allowed',
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginLeft: '24px',
            }}
          >
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '14px',
                marginTop: '16px',
              }}
            >
              {party}
            </Typography>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontFamily: 'Proxima Nova, sans-serif',
                fontSize: '10px',
                marginTop: '12px',
              }}
            >
              {outletInfo.split('||')[0]}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: '#F8F4F4',
              borderRadius: '8px',
              minHeight: '144px',
              width: '80%',
              marginTop: '24px',
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={ShopImgs.ShopImg}
              alt="Shop"
              style={{
                height: '136px',
                width: '88px',
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: '16px',
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
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
                sx={{
                  padding: 0,
                }}
              >
                <Typography
                  sx={{
                    color: '#3955CB',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginLeft: '24px',
                    fontFamily: 'Proxima Nova, sans-serif',
                    textTransform: 'none',
                  }}
                >
                  {t('Info.InfoNavigate')}
                </Typography>
              </IconButton>
            </Box>
            <Box
              sx={{
                flex: 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleCall();
                }}
                sx={{
                  padding: 0,
                }}
              >
                <Typography
                  sx={{
                    color: '#3955CB',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: 'Proxima Nova, sans-serif',
                    textTransform: 'none',
                  }}
                >
                  {t('Info.InfoCall')}
                </Typography>
              </IconButton>
            </Box>
            <Box
              sx={{
                flex: 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleMessage();
                }}
                sx={{
                  padding: 0,
                }}
              >
                <Typography
                  sx={{
                    color: '#3955CB',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginRight: '24px',
                    fontFamily: 'Proxima Nova, sans-serif',
                    textTransform: 'none',
                  }}
                >
                  {t('Info.InfoMessage')}
                </Typography>
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ListCardView;

