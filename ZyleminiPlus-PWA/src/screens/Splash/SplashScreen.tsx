// Web-adapted SplashScreen
import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ScreenName } from '../../constants/screenConstants';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { OTPScreenImg, globalImg } from '../../constants/AllImages';
import { DATABASE_VERSION } from '../../utility/utils';
import { executeSql } from '../../database/WebDatabase';
import cacheStorage from '../../localstorage/secureStorage';
import { useTranslation } from 'react-i18next';
import { requestUserPermission } from '../../notifications/notificationsUtils';
import { NotificationKeys } from '../../constants/asyncStorageKeys';
import { initDatabase } from '../../database/WebDatabase';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { doAuth } = useAuthentication();
  const { enteredUserName, userPassword, deviceId, savedClientCode } = useLoginAction();
  const { isLoggedin, setIsSplashShown } = useGlobleAction();

  useEffect(() => {
    console.log('🚀 handleNavigation start');
    const handleNavigation = async () => {
      console.log('🚀 handleNavigation in');
      
      // Initialize database first
      try {
        await initDatabase();
      } catch (error) {
        console.error('Database initialization error:', error);
      }
      
      // Check for notification
      const initialNotification = await cacheStorage.getString(
        NotificationKeys.PENDING_BG_NOTIFICATIONS,
      );
      console.log('🚀 handleNavigation inn', initialNotification);

      var timeDelay = 2200;
      if (initialNotification) {
        try {
          const parsed = JSON.parse(initialNotification);
          if (parsed?.data) {
            console.log('🚀 SPLASH: Notification detected, waiting for deep link...', timeDelay);
            timeDelay = 500;
          }
        } catch (e) {
          // Not valid JSON, ignore
        }
      }
      
      const timer = setTimeout(() => {
        if (isLoggedin) {
          checkAndMigrateDatabase();
          navigate('/dashboard'); // Web: Navigate to dashboard
        } else {
          setIsSplashShown?.(true);
          navigate('/login'); // Web: Navigate to login
        }
      }, timeDelay);
      
      return () => clearTimeout(timer);
    };
    
    handleNavigation();
  }, [isLoggedin, navigate]);

  const checkAndMigrateDatabase = async () => {
    try {
      // Web: Check database version (simplified)
      // TODO: Implement proper migration logic with WebDatabase
      // For now, just proceed with authentication if needed
      doAuthentication();
    } catch (error) {
      console.error('Error checking database version:', error);
      // Continue anyway
      if (isLoggedin) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  };

  const doAuthentication = async () => {
    const FcmToken = await requestUserPermission();
    doAuth({
      user: enteredUserName,
      password: userPassword,
      SCode: savedClientCode,
      deviceID: deviceId,
      FcmToken: FcmToken,
      t,
    });
  };

  console.log('I am Splash');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundImage: `url(${OTPScreenImg.backgrndImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: '12vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={globalImg.Logo}
          alt="Zylemini Logo"
          style={{
            width: '29vw',
            height: '23vh',
            objectFit: 'contain',
          }}
        />
        <Typography
          sx={{
            color: 'black',
            marginTop: '10px',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Salesforce Automation App
        </Typography>
      </Box>
    </Box>
  );
};

export default SplashScreen;
