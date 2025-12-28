import React from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { screens } from './index';
import { ScreenName } from '../../constants/screenConstants';
import { getRoutePath, getRouteParamName, isDynamicRoute } from '../../constants/routePaths';

/**
 * Wrapper component to pass propsData to screen components
 * This maintains compatibility with the propsData pattern from React Navigation
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

export default function ShopsStackNav() {
  return (
    <Routes>
      {screens.map((item, index) => {
        console.log(
          `[ShopStack Screen #${index}] name=${item.name}, getId=`,
          item.getId,
        );
        
        // Get route path for this screen
        const path = getRoutePath(item.name);
        
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
      {/* Default redirect to shops list */}
      <Route 
        path="/" 
        element={<Navigate to={getRoutePath(ScreenName.SHOPSFRONT)} replace />} 
      />
    </Routes>
  );
}

