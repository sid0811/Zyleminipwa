import {useEffect, useState} from 'react';
import {useGlobleAction} from '../redux/actionHooks/useGlobalAction';

const useNotification = () => {
  const [error, setError] = useState('');
  const [isNotificationPermissionEnabled, setIsNotificationPermissionEnabled] =
    useState(false);
  const {geofenceGlobalSettingsAction} = useGlobleAction();

  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (
        geofenceGlobalSettingsAction?.IsGeoFencingEnabled &&
        geofenceGlobalSettingsAction?.IsLocationRestriction
      ) {
        try {
          // Check if browser supports Notification API
          if (!('Notification' in window)) {
            setError('This browser does not support notifications');
            setIsNotificationPermissionEnabled(false);
            return;
          }

          // Request notification permission
          const permission = await Notification.requestPermission();
          
          if (permission === 'denied') {
            console.log('User denied permissions request');
            setError('Notification Permission Denied');
            setIsNotificationPermissionEnabled(false);
          } else if (permission === 'granted') {
            console.log('User granted permissions request');
            setIsNotificationPermissionEnabled(true);
          } else if (permission === 'default') {
            console.log('User closed permission prompt without decision');
            setIsNotificationPermissionEnabled(false);
          }
        } catch (error) {
          setError(
            'An error occurred while requesting notification permission',
          );
        }
      }
    };

    requestNotificationPermission();
  }, [geofenceGlobalSettingsAction]);

  return {isNotificationPermissionEnabled, error};
};

export default useNotification;

