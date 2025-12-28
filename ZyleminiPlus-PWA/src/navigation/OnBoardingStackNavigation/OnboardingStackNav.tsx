import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { screens } from './index';
import { ScreenName } from '../../constants/screenConstants';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { getRoutePath } from '../../constants/routePaths';

export default function OnboardingStackNav() {
  const { isSplashShown } = useGlobleAction();
  console.log('isSplashShown -->', isSplashShown);

  // Determine initial route
  const initialRoute = isSplashShown ? ScreenName.SPLASH : ScreenName.LOGIN;

  return (
    <Routes>
      {screens.map((item, index) => {
        const path = getRoutePath(item.name);
        return (
          <Route
            key={index.toString()}
            path={path}
            element={<item.component />}
          />
        );
      })}
      {/* Default redirect to initial route */}
      <Route 
        path="/" 
        element={<Navigate to={getRoutePath(initialRoute)} replace />} 
      />
      {/* Catch-all redirect */}
      <Route 
        path="*" 
        element={<Navigate to={getRoutePath(initialRoute)} replace />} 
      />
    </Routes>
  );
}

