import {getCurrentDateTime, writeErrorLog} from '../utility/utils';
import {postLivelocation} from '../api/LiveLocationAPICalls';
import {LocationMaster} from '../types/types';
import {
  insertLiveLocation,
  getLiveLocationToSync,
  deleteLiveLocationPostSyncRecords,
} from '../database/SqlDatabase';
import {useLoginAction} from '../redux/actionHooks/useLoginAction';
import {useNetInfo} from './useNetInfo';
import axios from 'axios';

const userLiveLocationTracking = () => {
  const {userId} = useLoginAction();
  const {isNetConnected} = useNetInfo();
  const isConnected = isNetConnected;
  const isInternetReachable = isNetConnected;

  async function postLivelocationApiCall(location: LocationMaster) {
    try {
      await postLivelocation([
        {
          UserId: location.UserId,
          LocationTakenDateTime: location.LocationTakenDateTime,
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
      ]);
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK') {
        postLivelocationToDb(location);
      }
    }
  }

  async function postDBLiveLocationToServer() {
    try {
      getLiveLocationToSync().then((livelocationCaptured: LocationMaster[]) => {
        if (livelocationCaptured.length > 0) {
          livelocationCaptured.map(
            (item: LocationMaster) => (item.UserId = parseInt(userId)),
          );
          try {
            if (isConnected === true && isInternetReachable === true) {
              postLivelocation(livelocationCaptured).then(
                (success: any) => {
                  if (success) {
                    deleteLiveLocationPostSyncRecords().then((success: any) => {
                      console.log('deleted records livelocation', success);
                    });
                  }
                },
                (failed: any) => {
                  if (axios.isAxiosError(failed)) {
                    // Log any errors during the post request
                    writeErrorLog(
                      'trackLiveLocation Post offline data api call postDBLiveLocationToServer userLiveLocationTracking',
                      JSON.stringify(failed.message),
                    );
                  }
                },
              );
            }
          } catch (error) {
            writeErrorLog(
              'trackLiveLocation Post offline data 2',
              JSON.stringify(error),
            );
          }
        }
      });
    } catch (error) {}
  }

  async function postLivelocationToDb(location: LocationMaster) {
    await insertLiveLocation({
      UserId: location.UserId,
      LocationTakenDateTime: location.LocationTakenDateTime,
      latitude: location?.latitude,
      longitude: location?.longitude,
    });
  }

  async function postLivelocationTracking(location: LocationMaster) {
    if (isConnected === true && isInternetReachable === true) {
      postLivelocationApiCall(location);
    } else {
      postLivelocationToDb(location);
    }
  }
  return {postLivelocationTracking, postDBLiveLocationToServer};
};

export default userLiveLocationTracking;

