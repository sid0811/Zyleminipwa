import axios from 'axios';
import {postLivelocation} from '../api/LiveLocationAPICalls';
import {
  deleteLiveLocationPostSyncRecords,
  getLiveLocationToSync,
} from '../database/SqlDatabase';
import geofenceCache from '../localstorage/geofenceCache';
import {LocationMaster} from '../types/types';
import {writeErrorLog} from './utils';

// Function to post live location data to the server
export const postDBLiveLocationToServer = async (): Promise<void> => {
  try {
    const livelocationCaptured: LocationMaster[] =
      await getLiveLocationToSync();
    //  console.log('postDBLiveLocationToServer ', livelocationCaptured);
    if (livelocationCaptured.length > 0) {
      try {
        const success = await postLivelocation(livelocationCaptured);
        if (success) {
          const deleteSuccess = await deleteLiveLocationPostSyncRecords();
          console.log('Deleted live location records', deleteSuccess);
          let geofenceCacheLocalData =
            await geofenceCache.getGeofenceSettingsCache();
          geofenceCacheLocalData &&
            (await geofenceCache.storeGeofenceSettingsCache({
              ...geofenceCacheLocalData,
              LastSyncLiveLocationApiTimeStamp: new Date().getTime(),
            }));
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Log any errors during the post request
          writeErrorLog(
            'trackLiveLocation Post offline data api call postDBLiveLocationToServer',
            JSON.stringify(error.message),
          );
        }
      }
    }
  } catch (error) {
    // Handle errors during fetching the live location to sync
    writeErrorLog(
      'trackLiveLocation Post offline data 1',
      JSON.stringify(error),
    );
  }
};

