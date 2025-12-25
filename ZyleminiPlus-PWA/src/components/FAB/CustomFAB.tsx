// Web-adapted CustomFAB component
import React, { useState } from 'react';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FABIcon } from '../../constants/AllImages';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import useLocation from '../../hooks/useLocation';
import { ShopCheckOutAlertHandler } from '../../screens/Order/Functions/Validations';
import { getCurrentDateTimeT, writeErrorLog } from '../../utility/utils';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import './CustomFAB.css';

interface Option {
  label: string;
  fabIcon: any;
  onPress: () => void;
}

interface CustomFABProps {
  options: Option[];
  isNotFromShop?: boolean;
}

const CustomFAB: React.FC<CustomFABProps> = ({
  options,
  isNotFromShop = true,
}) => {
  const {
    isDarkMode,
    isShopCheckedIn,
    blockedShopName,
    setIsShopCheckIn,
    persistedStartTime,
    setPersistStartTime,
    setBlockedShopDetail,
    meetingEndBlocker,
  } = useGlobleAction();
  const { t } = useTranslation();
  const { latitude, longitude } = useLocation();
  const { userId } = useLoginAction();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionPress = (onPress: () => void) => {
    if (isShopCheckedIn && isNotFromShop) {
      ShopCheckOutAlertHandler(
        blockedShopName?.partyName,
        blockedShopName?.fromShopCheckout,
        async (onPress: boolean) => {
          if (onPress) {
            await CheckOutFunc();
          }
        },
      );
    } else {
      onPress();
      handleToggle();
    }
  };

  const CheckOutFunc = async () => {
    // TODO: Implement full ShopCheckOutFunc and SaveMeetingForEndAndSubmitButton
    // For now, this is a placeholder
    if (blockedShopName?.fromShopCheckout) {
      // Placeholder for ShopCheckOutFunc
      console.log('ShopCheckOutFunc placeholder');
      setPersistStartTime('');
      setBlockedShopDetail({});
      setIsShopCheckIn(!isShopCheckedIn);
      window.alert(t('Alerts.AlertSuccessfullyCheckOutMsg') || 'Successfully Checked Out');
    } else {
      // Placeholder for SaveMeetingForEndAndSubmitButton
      console.log('SaveMeetingForEndAndSubmitButton placeholder');
      setPersistStartTime('');
      setBlockedShopDetail({});
      setIsShopCheckIn(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 30,
        right: 30,
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          backgroundColor: Colors.FABColor,
          borderRadius: isOpen ? '10px' : '50%',
          width: isOpen ? '250px' : '80px',
          height: isOpen ? `${80 + options.length * 55}px` : '80px',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <IconButton
          onClick={handleToggle}
          sx={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            color: 'white',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            alignSelf: 'flex-end',
          }}
        >
          <img
            src={FABIcon.Plus}
            alt="Plus"
            style={{ width: 24, height: 24 }}
          />
        </IconButton>
        {isOpen && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {options.map((option, index) => (
              <Box
                key={index}
                onClick={() => handleOptionPress(option.onPress)}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: '55px',
                  padding: '0 16px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                  }}
                >
                  <img
                    src={option.fabIcon}
                    alt={option.label}
                    style={{ width: 24, height: 24 }}
                  />
                </Box>
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {option.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CustomFAB;

