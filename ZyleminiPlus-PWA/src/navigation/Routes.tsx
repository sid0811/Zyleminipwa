import React, { useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import languageInitialize from '../i18n/i18n';
import { useGlobleAction } from '../redux/actionHooks/useGlobalAction';
import MainRouteStackNav from './MainRoute/MainRouteStack';
import OnboardingStackNav from './OnBoardingStackNavigation/OnboardingStackNav';

const Routes = () => {
  // CRITICAL: Hooks must be called unconditionally at the top level
  // Cannot wrap hooks in try-catch - React will fail silently
  const globalAction = useGlobleAction();
  const isLoggedin = globalAction?.isLoggedin || false;
  
  const [isBootReady, setIsBootReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useLayoutEffect(() => {
    console.log('🔄 Routes component: Starting initialization...');
    initializeAsyncValue();
  }, []);

  const initializeAsyncValue = async () => {
    try {
      console.log('🔄 Routes: Initializing language...');
      const bootInitalize = async () => {
        await languageInitialize.languageInitialize();
      };
      await bootInitalize();
      console.log('✅ Routes: Language initialized, setting boot ready');
      setIsBootReady(true);
    } catch (error: any) {
      console.error('❌ Routes: Failed to initialize app:', error);
      setInitError(error?.message || 'Failed to initialize application');
      // Still set boot ready to show error UI
      setIsBootReady(true);
    }
  };

  console.log('🔄 Routes: Rendering, isBootReady:', isBootReady, 'isLoggedin:', isLoggedin);

  if (!isBootReady) {
    console.log('⏳ Routes: Showing loading state...');
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}>
        <CircularProgress />
        <Typography variant="body1">Loading...</Typography>
      </Box>
    );
  }

  if (initError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3,
        }}>
        <Typography variant="h6" color="error">
          Initialization Error
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {initError}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Please refresh the page to try again.
        </Typography>
      </Box>
    );
  }

  console.log('✅ Routes: Boot ready, rendering BrowserRouter');
  console.log('📍 Routes: isLoggedin =', isLoggedin, '-> Rendering:', isLoggedin ? 'MainRouteStackNav' : 'OnboardingStackNav');

  return (
    <BrowserRouter>
      <RouterRoutes>
        {/* Conditional routing based on login status */}
        {isLoggedin ? (
          <Route path="/*" element={<MainRouteStackNav />} />
        ) : (
          <Route path="/*" element={<OnboardingStackNav />} />
        )}
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isLoggedin ? '/dashboard' : '/login'} replace />} />
      </RouterRoutes>
    </BrowserRouter>
  );
};

export default Routes;
