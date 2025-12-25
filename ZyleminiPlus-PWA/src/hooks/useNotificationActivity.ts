// Web-adapted useNotificationActivity hook - using Web Push API
import { useEffect, useState } from 'react';

const useNotificationActivity = () => {
  const [error, setError] = useState('');
  const [isNotificationPermissionEnabled, setIsNotificationPermissionEnabled] = useState(false);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
          setError('This browser does not support notifications');
          setIsNotificationPermissionEnabled(false);
          return;
        }

        // Check current permission status
        if (Notification.permission === 'granted') {
          setIsNotificationPermissionEnabled(true);
          return;
        }

        if (Notification.permission === 'denied') {
          setError('Notification Permission Denied');
          setIsNotificationPermissionEnabled(false);
          return;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          setIsNotificationPermissionEnabled(true);
        } else {
          setError('Notification Permission Denied');
          setIsNotificationPermissionEnabled(false);
        }
      } catch (error) {
        setError('An error occurred while requesting notification permission');
        console.error('Notification permission error:', error);
      }
    };

    requestNotificationPermission();
  }, []);

  return { isNotificationPermissionEnabled, error };
};

export default useNotificationActivity;


