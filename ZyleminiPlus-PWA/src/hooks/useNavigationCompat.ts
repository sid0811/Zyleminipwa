/**
 * Navigation Compatibility Hook
 * Provides React Navigation-compatible API for components that still use useNavigation
 * This allows gradual migration without breaking existing code
 */

import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useDrawer } from '../contexts/DrawerContext';
import { ScreenName } from '../constants/screenConstants';
import { getRoutePath } from '../constants/routePaths';

export interface NavigationCompat {
  navigate: (screenName: ScreenName | string, params?: any) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  reset: (state: any) => void;
  setParams: (params: any) => void;
  setOptions: (options: any) => void;
  dispatch: (action: any) => void;
  isFocused: () => boolean;
  addListener: (type: string, callback: () => void) => () => void;
}

/**
 * React Navigation-compatible hook
 * Provides navigation methods that match React Navigation API
 */
export const useNavigationCompat = (): NavigationCompat => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const drawer = useDrawer();

  return {
    /**
     * Navigate to a screen
     * @param screenName - ScreenName constant or string
     * @param params - Navigation parameters (will be passed as propsData or URL params)
     */
    navigate: (screenName: ScreenName | string, navParams?: any) => {
      try {
        const path = getRoutePath(screenName as ScreenName);
        
        // Handle params - if propsData exists, pass via search params
        if (navParams?.propsData) {
          const newSearchParams = new URLSearchParams();
          
          // Add existing search params
          searchParams.forEach((value, key) => {
            newSearchParams.set(key, value);
          });
          
          // Add propsData as JSON in search params
          Object.keys(navParams.propsData).forEach((key) => {
            const value = navParams.propsData[key];
            if (value !== null && value !== undefined) {
              if (typeof value === 'object') {
                newSearchParams.set(key, JSON.stringify(value));
              } else {
                newSearchParams.set(key, String(value));
              }
            }
          });
          
          // If screen has dynamic params (like shopId), add them to path
          if (navParams.propsData?.shopId) {
            const pathWithParams = path.replace(':shopId?', String(navParams.propsData.shopId))
                                      .replace(':shopId', String(navParams.propsData.shopId));
            navigate(`${pathWithParams}?${newSearchParams.toString()}`);
          } else {
            navigate(`${path}?${newSearchParams.toString()}`);
          }
        } else if (navParams) {
          // Simple params - add to search params
          const newSearchParams = new URLSearchParams();
          searchParams.forEach((value, key) => {
            newSearchParams.set(key, value);
          });
          Object.keys(navParams).forEach((key) => {
            const value = navParams[key];
            if (value !== null && value !== undefined) {
              if (typeof value === 'object') {
                newSearchParams.set(key, JSON.stringify(value));
              } else {
                newSearchParams.set(key, String(value));
              }
            }
          });
          navigate(`${path}?${newSearchParams.toString()}`);
        } else {
          navigate(path);
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback: try to navigate to screen name as path
        navigate(`/${String(screenName).toLowerCase()}`);
      }
    },

    /**
     * Go back in navigation history
     */
    goBack: () => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // If no history, navigate to dashboard
        navigate(getRoutePath(ScreenName.DASHBOARD));
      }
    },

    /**
     * Check if can go back
     */
    canGoBack: () => {
      return window.history.length > 1;
    },

    /**
     * Toggle drawer
     */
    toggleDrawer: () => {
      drawer.toggleDrawer();
    },

    /**
     * Open drawer
     */
    openDrawer: () => {
      drawer.openDrawer();
    },

    /**
     * Close drawer
     */
    closeDrawer: () => {
      drawer.closeDrawer();
    },

    /**
     * Reset navigation state (navigate and clear history)
     */
    reset: (state: any) => {
      // React Router doesn't have exact reset, but we can navigate to initial route
      if (state?.routes && state.routes.length > 0) {
        const initialRoute = state.routes[state.index || 0];
        if (initialRoute?.name) {
          navigate(getRoutePath(initialRoute.name), { replace: true });
        }
      }
    },

    /**
     * Set params for current route
     */
    setParams: (newParams: any) => {
      const newSearchParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        newSearchParams.set(key, value);
      });
      
      Object.keys(newParams).forEach((key) => {
        const value = newParams[key];
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            newSearchParams.set(key, JSON.stringify(value));
          } else {
            newSearchParams.set(key, String(value));
          }
        }
      });
      
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    },

    /**
     * Set options for current route (stub - React Router doesn't have this)
     */
    setOptions: (options: any) => {
      // React Router doesn't have route options like React Navigation
      // This is a no-op but provided for compatibility
      console.log('setOptions called (not implemented in React Router):', options);
    },

    /**
     * Dispatch navigation action (stub)
     */
    dispatch: (action: any) => {
      // React Router doesn't use actions like React Navigation
      // This is a no-op but provided for compatibility
      console.log('dispatch called (not implemented in React Router):', action);
    },

    /**
     * Check if screen is focused
     */
    isFocused: () => {
      // In React Router, we consider the current route as focused
      return true;
    },

    /**
     * Add navigation listener
     */
    addListener: (type: string, callback: () => void) => {
      // React Router doesn't have the same listener system
      // Return unsubscribe function
      return () => {
        // No-op unsubscribe
      };
    },
  };
};

/**
 * Route compatibility hook
 * Provides route.params similar to React Navigation
 */
export const useRouteCompat = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Build route params from URL params and search params
  const routeParams: Record<string, any> = {};
  
  // Add URL params
  Object.keys(params).forEach((key) => {
    routeParams[key] = params[key];
  });
  
  // Add search params (decode JSON if needed)
  searchParams.forEach((value, key) => {
    try {
      // Try to parse as JSON
      routeParams[key] = JSON.parse(value);
    } catch {
      // If not JSON, use as string
      routeParams[key] = value;
    }
  });

  // Build propsData from search params (React Navigation pattern)
  const propsData: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    try {
      propsData[key] = JSON.parse(value);
    } catch {
      propsData[key] = value;
    }
  });

  return {
    params: routeParams,
    propsData,
    name: location.pathname,
    key: location.key || location.pathname,
  };
};

