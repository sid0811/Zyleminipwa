import {writeErrorLog} from '../utility/utils';

// Web equivalent of GeoPosition from react-native-geolocation-service
export interface GeoPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export const fetchCurrentLocation = async (): Promise<GeoPosition | null> => {
  try {
    console.log('[fetchCurrentLocation] Start');

    // Check if geolocation is available in browser
    if (!('geolocation' in navigator)) {
      console.log('[fetchCurrentLocation] Geolocation not supported.');
      return Promise.reject(new Error('Geolocation not supported by this browser'));
    }

    // Request permission for web - browser will prompt user automatically
    console.log('[fetchCurrentLocation] Requesting browser geolocation permission...');

    // Get location using browser Geolocation API
    console.log('[fetchCurrentLocation] Calling navigator.geolocation.getCurrentPosition...');
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log('[fetchCurrentLocation] SUCCESS:', position);
          
          // Convert browser GeolocationPosition to our GeoPosition format
          const geoPosition: GeoPosition = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            },
            timestamp: position.timestamp,
          };
          
          resolve(geoPosition);
        },
        error => {
          console.log('[fetchCurrentLocation] ERROR:', error);

          switch (error.code) {
            case error.POSITION_UNAVAILABLE: {
              console.log('[fetchCurrentLocation] POSITION_UNAVAILABLE');
              window.alert(
                'Location services are currently disabled. Please enable them in your browser settings.'
              );
              reject(error);
              break;
            }
            case error.PERMISSION_DENIED: {
              console.log('[fetchCurrentLocation] PERMISSION_DENIED');
              window.alert(
                'Location permission denied. Please allow location access in your browser settings.'
              );
              reject(error);
              break;
            }
            case error.TIMEOUT: {
              console.log('[fetchCurrentLocation] TIMEOUT');
              reject(error);
              break;
            }
            default: {
              console.log('[fetchCurrentLocation] Unknown error:', error);
              reject(error);
              break;
            }
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // 15sec
          maximumAge: 10000, // 10 sec cache
        },
      );
    });
  } catch (err) {
    console.log('[fetchCurrentLocation] Exception caught:', err);
    writeErrorLog('fetchCurrentLocation', err);
    return Promise.reject(err);
  }
};

