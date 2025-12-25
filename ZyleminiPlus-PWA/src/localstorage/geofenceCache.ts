// Web-adapted geofenceCache.ts - Removed React Native dependencies
import cacheStorage from './secureStorage';
import {GeofenceSettings} from '../types/types';
import {writeErrorLog} from '../utility/utils';

const storeGeofenceSettingsCache = async (value: GeofenceSettings) => {
  console.log('storeGeofenceSettingsCache 00-->', value);
  try {
    await cacheStorage.remove('GeofenceSettings');
    cacheStorage.set('GeofenceSettings', JSON.stringify(value));
  } catch (error) {
    writeErrorLog('storeGeofenceSettingsCache', JSON.stringify(value));
  }
};

async function getGeofenceSettingsCache() {
  try {
    const data = await cacheStorage.getString('GeofenceSettings');
    if (data) {
      const geofenceSettings: GeofenceSettings = JSON.parse(data);
      return geofenceSettings;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Error getting geofence settings cache:', error);
    return undefined;
  }
}

async function resetGeofenceSettingsCache() {
  console.log('resetGeofenceSettingsCache 00-->');
  try {
    await cacheStorage.remove('GeofenceSettings');
  } catch (error) {
    writeErrorLog('resetGeofenceSettingsCache', error);
  }
}

export default {
  storeGeofenceSettingsCache,
  getGeofenceSettingsCache,
  resetGeofenceSettingsCache,
};


