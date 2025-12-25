import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ScreenName } from '../constants/screenConstants';

// Screens (will be created/adapted)
import Login from '../screens/Login/Login';
import Dashboard from '../screens/Dashboard/Dashboard';
import Splash from '../screens/Splash/SplashScreen';

const Routes = () => {
  const isLoggedin = useSelector((state: RootState) => 
    state.globalReducer?.isLoggedin || false
  );

  // Show splash while checking auth state
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    // Check auth state from persisted store
    // This will be set by Redux Persist
    setTimeout(() => {
      setIsCheckingAuth(false);
    }, 1000);
  }, []);

  if (isCheckingAuth) {
    return <Splash />;
  }

  return (
    <RouterRoutes>
      {!isLoggedin ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Add more routes as screens are migrated */}
        </>
      )}
    </RouterRoutes>
  );
};

export default Routes;

