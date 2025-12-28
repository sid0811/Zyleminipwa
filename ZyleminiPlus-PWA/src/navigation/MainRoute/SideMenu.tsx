// Web-adapted SideMenu component for React Router
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SideMenuList from '../../screens/SideMenu/SideMenuList';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { useDashAction } from '../../redux/actionHooks/useDashAction';
import Loader from '../../components/Loader/Loader';
import { Colors } from '../../theme/colors';
import { ScreenName } from '../../constants/screenConstants';
import { globalImg, SideMenuImg } from '../../constants/AllImages';
import { useDrawer } from '../../contexts/DrawerContext';
import { getRoutePath } from '../../constants/routePaths';
import { useNavigationCompat } from '../../hooks/useNavigationCompat';

const SideMenu = () => {
  const navigate = useNavigate();
  const drawer = useDrawer();
  const { t } = useTranslation();
  const { enteredUserName } = useLoginAction();
  const { syncRefresh } = useGlobleAction();
  const { base64 } = useDashAction();

  const closeDrawer = () => {
    drawer.closeDrawer();
  };
  
  // Create navigation compatibility object for SideMenuList
  const navigation = useNavigationCompat();
  
  // Wrap navigation to close drawer after navigation
  const navigationWithDrawerClose = {
    ...navigation,
    navigate: (screenName: ScreenName | string, params?: any) => {
      navigation.navigate(screenName, params);
      drawer.closeDrawer();
    },
  };

  return (
    <>
      <Loader visible={syncRefresh} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'white',
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            backgroundColor: Colors.mainBackground,
            padding: '20px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <IconButton
            onClick={closeDrawer}
            sx={{ color: Colors.white }}
          >
            <img
              src={SideMenuImg.close}
              alt="Close"
              style={{ width: 24, height: 24 }}
            />
          </IconButton>
        </Box>

        {/* Profile Section */}
        <Box
          sx={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Box
            component="img"
            src={
              base64
                ? `data:image/png;base64,${base64}`
                : SideMenuImg.userProfile
            }
            alt="Profile"
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#362828',
              fontFamily: 'Proxima Nova',
            }}
          >
            {enteredUserName}
          </Typography>
        </Box>

        {/* Menu List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <SideMenuList navigation={navigationWithDrawerClose} />
        </Box>

        {/* Footer Section */}
        <Box
          sx={{
            padding: '20px',
            borderTop: '1px solid #DFE9E0',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <img
              src={globalImg.Logo}
              alt="Logo"
              style={{ width: 40, height: 40 }}
            />
            <img
              src={globalImg.companyName}
              alt="Company"
              style={{ width: 120, height: 30 }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <Typography
              onClick={() => navigationWithDrawerClose.navigate(ScreenName.PRIVACYPOLICY)}
              sx={{
                fontSize: '12px',
                color: '#362828',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('SideMenu.SideMenuPrivacyPolicy')}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#DFE9E0' }}>|</Typography>
            <Typography
              onClick={() => navigationWithDrawerClose.navigate(ScreenName.SECURITY)}
              sx={{
                fontSize: '12px',
                color: '#362828',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('SideMenu.SideMenuSecurityNotice')}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#DFE9E0' }}>|</Typography>
            <Typography
              onClick={() => navigationWithDrawerClose.navigate(ScreenName.ABOUT_US)}
              sx={{
                fontSize: '12px',
                color: '#362828',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('SideMenu.SideMenuAbout')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default memo(SideMenu);

