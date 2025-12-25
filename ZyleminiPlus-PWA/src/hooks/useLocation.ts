// Web-adapted useLocation hook - using Web Geolocation API
import { useState, useEffect } from 'react';
import { useGlobleAction } from '../redux/actionHooks/useGlobalAction';
import { writeErrorLog } from '../utility/utils';
import { useLocationAction } from '../redux/actionHooks/useLocationAction';

const useLocation = () => {
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [error, setError] = useState('');
  const { geofenceGlobalSettingsAction } = useGlobleAction();
  const { setIsLocationGranted, isBGLocationGranted } = useLocationAction();

  useEffect(() => {
    const getCurrentLocation = async () => {
      if (
        isBGLocationGranted ||
        !geofenceGlobalSettingsAction?.IsGeoFencingEnabled
      ) {
        try {
          // Check if geolocation is supported
          if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            setIsLocationGranted(false);
            return;
          }

          // Request permission and get location
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('----------getCurrentPosition -->', position.coords);
              setLatitude(position.coords.latitude);
              setLongitude(position.coords.longitude);
              setIsLocationGranted(true);
            },
            (error) => {
              console.error('Geolocation error:', error);
              
              // Handle different error codes
              if (error.code === error.PERMISSION_DENIED) {
                setError('Location permission denied');
                setIsLocationGranted(false);
              } else if (error.code === error.POSITION_UNAVAILABLE) {
                setError('Location information unavailable');
                setIsLocationGranted(false);
              } else if (error.code === error.TIMEOUT) {
                setError('Location request timeout');
                setIsLocationGranted(false);
              } else {
                setError('An error occurred while fetching location');
                setIsLocationGranted(false);
              }
              
              writeErrorLog('getCurrentLocation', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
            }
          );
        } catch (error) {
          writeErrorLog('getCurrentLocation', error);
          setError('An error occurred while fetching location');
          setIsLocationGranted(false);
        }
      }
    };
    
    getCurrentLocation();
  }, [isBGLocationGranted, geofenceGlobalSettingsAction?.IsGeoFencingEnabled]);

  return { latitude, longitude, error };
};

export default useLocation;


