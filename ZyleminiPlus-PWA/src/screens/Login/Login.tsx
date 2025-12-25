// Web-adapted Login screen
import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert as MuiAlert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import AppTextInput from '../../components/TextInput/TextInput';
import AppButton from '../../components/Buttons/Button';
import { globalImg } from '../../constants/AllImages';
import Logo from '../../components/Logo/Logo';
import { Colors } from '../../theme/colors';
import { VERSION_DETAIL } from '../../constants/screenConstants';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import { LOGIN_BOX, writeActivityLog } from '../../utility/utils';
import { getDeviceID } from '../../utility/deviceManager';
import { useAuthentication } from '../../hooks/useAuthentication';
import { createTables } from '../../database/WebDatabaseHelpers';
import Loader from '../../components/Loader/Loader';
import { useNetInfo } from '../../hooks/useNetInfo';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { checkAndRequestTrackingPermission } from '../../utility/TrackingUtils';
import useNotificationActivity from '../../hooks/useNotificationActivity';
import { requestUserPermission } from '../../notifications/notificationsUtils';

function Login() {
  const { t } = useTranslation();
  const { enteredUserName, userPassword, savedClientCode } = useLoginAction();
  const { setIsSplashShown } = useGlobleAction();
  const { doAuth } = useAuthentication();
  const { isNetConnected } = useNetInfo();
  const [user, setUser] = useState(enteredUserName);
  const [password, setPassword] = useState(userPassword);
  const [SCode, setScode] = useState(savedClientCode);
  const [loading, setLoading] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const { isNotificationPermissionEnabled } = useNotificationActivity();
  const [alertMessage, setAlertMessage] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    setIsSplashShown?.(true);
    checkPermission();
  }, []);

  const checkPermission = async () => {
    console.log('Checking of permission', isNotificationPermissionEnabled);
    const status = await checkAndRequestTrackingPermission();
    console.log('Tracking permission status:', status);
    setTrackingStatus(status);
  };

  const verifyLogin = async () => {
    if (isNetConnected) {
      writeActivityLog(`Logged In`);
      // HARDCODED FOR TESTING
      const deviceID = '111';
      const FcmToken = 'nadasdasnkajiau';
      // const deviceID = await getDeviceID();
      // const FcmToken = await requestUserPermission();
      await createTables();
      doAuth({
        user,
        password,
        SCode,
        deviceID,
        FcmToken,
        loaderState: (val: boolean) => {
          setLoading(val);
        },
        isLoginScreen: true,
        t,
      });
    } else {
      setAlertMessage({
        title: t('Alerts.AlertNoInternetTitle') || 'No Internet',
        message: t('Alerts.AlertNoInternetMsg') || 'Please check your internet connection',
      });
    }
  };

  return (
    <>
      <Loader visible={loading} />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: `url(${globalImg.backgrnd})`,
          backgroundColor: Colors.loginBackgrnd,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <CustomSafeView isScrollView={true}>
          {alertMessage && (
            <MuiAlert
              severity="error"
              onClose={() => setAlertMessage(null)}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">{alertMessage.title}</Typography>
              <Typography>{alertMessage.message}</Typography>
            </MuiAlert>
          )}
          
          <Logo />
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '7vh',
            }}
          >
            <AppTextInput
              height={LOGIN_BOX.Height}
              width={LOGIN_BOX.Width}
              marginVertical="1.5vh"
              placeholder={t('PlaceHolders.User') || 'User'}
              value={user}
              onChangeText={(txt: string) => setUser(txt)}
            />
            
            <AppTextInput
              height={LOGIN_BOX.Height}
              width={LOGIN_BOX.Width}
              marginVertical="1.5vh"
              placeholder={t('PlaceHolders.Password') || 'Password'}
              value={password}
              isPassword={true}
              onChangeText={(txt: string) => setPassword(txt)}
            />
            
            <AppTextInput
              height={LOGIN_BOX.Height}
              width={LOGIN_BOX.Width}
              marginVertical="1.5vh"
              placeholder={t('PlaceHolders.SecurityCode') || 'Security Code'}
              value={SCode}
              onChangeText={(txt: string) => setScode(txt)}
            />

            <Box sx={{ marginTop: LOGIN_BOX.Height, width: LOGIN_BOX.Width }}>
              <AppButton
                title={t('PlaceHolders.Login') || 'Login'}
                onPress={() => {
                  verifyLogin();
                }}
                height={LOGIN_BOX.Height}
                width="100%"
              />
            </Box>

            <Typography
              sx={{
                color: Colors.buttonPrimary,
                fontSize: '10px',
                fontWeight: 'bold',
                marginTop: '3vh',
                fontFamily: 'Proxima Nova, sans-serif',
              }}
            >
              {t('Login.LoginForgotUserIdPassword') || 'Forgot User ID / Password?'}
            </Typography>
            
            <Box
              sx={{
                alignSelf: 'flex-end',
                marginRight: '6vw',
                marginTop: '3vh',
              }}
            >
              <Typography
                sx={{
                  color: Colors.buttonPrimary,
                  fontSize: '10px',
                  fontWeight: 'bold',
                  fontFamily: 'Proxima Nova, sans-serif',
                }}
              >
                {VERSION_DETAIL}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ paddingBottom: '12vh' }} />
        </CustomSafeView>
      </Box>
    </>
  );
}

export default Login;
