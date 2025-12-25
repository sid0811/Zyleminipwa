// Web-adapted useRegisterGeofenceRouteWise - Simplified placeholder
// Geofencing is optional/limited on web, so this is a simplified version
import { useCallback, useEffect, useRef, useState } from 'react';
import { OutletGeofence, ShopsGelocationBody } from '../types/types';
import { getLocationOfOutlets } from '../database/WebDatabaseHelpers';
import { useGlobleAction } from '../redux/actionHooks/useGlobalAction';

const useRegisterGeofenceRouteWise = () => {
  const [getSelectedRouteId, setSelectedRouteId] = useState<string>('');
  const [shopListRouteWise, setShopListRouteWise] = useState<ShopsGelocationBody[]>([]);
  const geofenceActiveOutletEvent = useRef<OutletGeofence[]>([]);
  const { geofenceGlobalSettingsAction } = useGlobleAction();

  const getRouteId = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  const getCurrentLocation = async (): Promise<GeolocationPosition> => {
    // Web: Use Web Geolocation API
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 5000,
        }
      );
    });
  };

  useEffect(() => {
    if (getSelectedRouteId && getSelectedRouteId !== 'NAN') {
      setGeofenceRouteWise();
    }
  }, [getSelectedRouteId]);

  const setGeofenceRouteWise = async () => {
    if (getSelectedRouteId) {
      try {
        const data: ShopsGelocationBody[] = await getLocationOfOutlets(getSelectedRouteId);
        if (data.length > 0) {
          // Web: Geofencing is simplified - just store the shop list
          // Full geofence registration would require a different approach on web
          setShopListRouteWise(data);
        } else {
          resetShopListRouteWiseEvent();
        }
      } catch (error) {
        console.error('Error setting geofence route wise:', error);
        resetShopListRouteWiseEvent();
      }
    } else {
      resetShopListRouteWiseEvent();
    }
  };

  function resetShopListRouteWiseEvent() {
    setShopListRouteWise([]);
  }

  return {
    getRouteId,
    shopListRouteWise,
    geofenceActiveOutletEvent,
    getCurrentLocation,
  };
};

export default useRegisterGeofenceRouteWise;


