// Web-adapted useHeadlessGeofenceEventRegistration - Simplified placeholder
// Geofencing is optional/limited on web
import { useRef } from 'react';
import { OutletGeofence } from '../types/types';
import { calculateDistance } from '../utility/utils';
import { useGeofenceAction } from '../redux/actionHooks/useGeofenceAction';

const useHeadlessGeofenceEventRegistration = () => {
  const _geofenceActiveOutletEvent = useRef<OutletGeofence[]>([]);
  const {
    setGeofenceEvents,
    geofenceEvents,
    setRemoveExitedGeofenceEvents,
    setGeofenceEventsReducerToEmptyEvent,
  } = useGeofenceAction();

  function checkIfCurrentGeofenceHaveAction(
    geofenceEvents: any,
    geofence: any,
    action: String,
  ): Boolean {
    let data = _geofenceActiveOutletEvent.current.some(
      (enteredShop: OutletGeofence) =>
        enteredShop.id == geofence.identifier && enteredShop.action == action,
    );
    return data;
  }

  async function runAndSplit(
    geofence: any,
    geofenceActiveOutletEvent: React.MutableRefObject<OutletGeofence[]>,
  ) {
    console.log('Web: Geofence event (simplified):', geofence);
    _geofenceActiveOutletEvent.current = geofenceActiveOutletEvent.current;
    
    // Web: Simplified geofence event handling
    // Full implementation would require manual distance calculation
    if (geofenceEvents != null || geofenceEvents != undefined) {
      if (
        geofence.action == 'ENTER' &&
        !checkIfCurrentGeofenceHaveAction(geofenceEvents, geofence, 'ENTER')
      ) {
        _geofenceActiveOutletEvent.current.push({
          id: geofence.identifier,
          action: geofence.action,
        });

        if (
          !geofenceEvents.some(
            (activeOutlet: OutletGeofence) =>
              activeOutlet.action == geofence.action &&
              activeOutlet.id == geofence.identifier,
          )
        ) {
          setGeofenceEvents?.({
            id: geofence.identifier,
            action: geofence.action,
          });
        }
      } else if (
        geofence.action == 'EXIT' &&
        checkIfCurrentGeofenceHaveAction(geofenceEvents, geofence, 'ENTER')
      ) {
        let onlyEntered = _geofenceActiveOutletEvent.current.filter(
          (str: OutletGeofence) =>
            str.id != geofence.identifier && str.action != geofence.action,
        );
        geofenceActiveOutletEvent.current = onlyEntered;
        setRemoveExitedGeofenceEvents?.({
          id: geofence.identifier,
          action: 'ENTER',
        });
      }
    }
  }

  const isPointInCircle = (
    latitude: number,
    longitude: number,
    centerLat: number,
    centerLng: number,
    radius: number,
  ): boolean => {
    const distance = calculateDistance(latitude, longitude, centerLat, centerLng);
    return distance <= radius;
  };

  const checkUpdatedInFenceOutlets = async (
    location: GeolocationPosition | any,
    shopListRouteWise?: any[],
  ) => {
    // Web: Simplified geofence checking using distance calculation
    // This would need shop list data to check against
    console.log('Web: Checking outlets in geofence (simplified)');
    
    if (!location || !location.coords) {
      console.warn('No location data available for geofence check');
      return;
    }

    // TODO: Implement full geofence checking logic if needed
    // For now, this is a placeholder
  };

  return {
    checkUpdatedInFenceOutlets,
    runAndSplit,
  };
};

export default useHeadlessGeofenceEventRegistration;

