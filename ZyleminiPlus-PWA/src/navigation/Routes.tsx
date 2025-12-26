import React, { useEffect, useLayoutEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBrowserHistory } from '@react-navigation/web';
import languageInitialize from '../i18n/i18n';
import { useGlobleAction } from '../redux/actionHooks/useGlobalAction';
import MainRouteStackNav from './MainRoute/MainRouteStack';
import OnboardingStackNav from './OnBoardingStackNavigation/OnboardingStackNav';

// Create browser history for web navigation
const history = createBrowserHistory();

const Routes = () => {
  const { isLoggedin } = useGlobleAction();
  const [isBootReady, setIsBootReady] = useState(false);

  useLayoutEffect(() => {
    initializeAsyncValue();
  }, []);

  const initializeAsyncValue = async () => {
    const bootInitalize = async () => {
      await languageInitialize.languageInitialize();
    };
    bootInitalize().then(() => {
      setIsBootReady(true);
    });
  };

  if (!isBootReady) {
    return null;
  }

  return (
    <NavigationContainer
      history={history}
      onReady={() => {
        // Navigation is ready
        console.log('Navigation Container Ready');
      }}
    >
      {isLoggedin ? <MainRouteStackNav /> : <OnboardingStackNav />}
    </NavigationContainer>
  );
};

export default Routes;
