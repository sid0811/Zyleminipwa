import React from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { screens } from './index';
import { ScreenName } from '../../constants/screenConstants';
import { getRoutePath, getRouteParamName, isDynamicRoute } from '../../constants/routePaths';
import MainRoute from './MainRoute';
import Dashboard from '../../screens/Dashboard/Dashboard';

/**
 * Wrapper component to pass propsData to screen components
 * This maintains compatibility with the propsData pattern from React Navigation
 * Extracts URL parameters and search params to construct propsData
 */
const ScreenWrapper: React.FC<{
  Component: React.ComponentType<any>;
  screenName: string;
  defaultPropsData?: Record<string, any>;
}> = ({ Component, screenName, defaultPropsData }) => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  
  // Build propsData from URL params and search params
  const propsData: Record<string, any> = { ...(defaultPropsData || {}) };
  
  // Extract dynamic route parameters
  if (isDynamicRoute(screenName)) {
    const paramName = getRouteParamName(screenName);
    if (paramName && params[paramName]) {
      propsData[paramName] = params[paramName];
    }
  }
  
  // Extract search params (query string)
  searchParams.forEach((value, key) => {
    propsData[key] = value;
  });
  
  // Pass propsData as props to maintain compatibility
  return <Component {...propsData} />;
};

export default function MainRouteStackNav() {
  return (
    <Routes>
      {/* MainRoute Layout - wraps Dashboard and other screens with Drawer */}
      <Route 
        path={getRoutePath(ScreenName.MAINSCREEN)}
        element={<MainRoute />}
      >
        {/* Dashboard as nested route inside MainRoute */}
        <Route 
          index
          element={<Dashboard />} 
        />
        <Route 
          path={getRoutePath(ScreenName.DASHBOARD).replace('/main', '') || 'dashboard'}
          element={<Dashboard />} 
        />
      </Route>
      
      {/* All other screens */}
      {screens?.length > 0 &&
        screens
          .filter(item => item.name !== ScreenName.MAINSCREEN && item.name !== ScreenName.DASHBOARD)
          .map((item, index) => {
            console.log(
              `[MainRouteStack Screen #${index}] name=${item.name}, getId=`,
              item.getId,
            );
            
            // Get route path for this screen
            const path = getRoutePath(item.name);
            
            // Handle getId pattern - for screens with getId, we need dynamic routes
            // The getId function creates unique instances based on params
            // In React Router, we handle this via URL parameters
            return (
              <Route
                key={index.toString()}
                path={path}
                element={
                  <ScreenWrapper
                    Component={item.component}
                    screenName={item.name}
                    defaultPropsData={item.params?.propsData}
                  />
                }
              />
            );
          })}
      
      {/* Dashboard as standalone route (also accessible directly) */}
      <Route 
        path={getRoutePath(ScreenName.DASHBOARD)}
        element={<Dashboard />} 
      />
      
      {/* Default redirect to dashboard */}
      <Route 
        path="/" 
        element={<Navigate to={getRoutePath(ScreenName.DASHBOARD)} replace />} 
      />
    </Routes>
  );
}

