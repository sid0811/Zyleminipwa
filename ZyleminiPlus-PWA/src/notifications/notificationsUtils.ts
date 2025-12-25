// Web-adapted notificationsUtils - using Web Push API
// Placeholder implementation - full Web Push setup requires service worker

export const ApiStatusTypes = {
  SUCCESS: 'success',
  FAILURE: 'failed',
  ERROR: 'error',
  INTERNET_CHECK: 'internetCheck',
  REFRESH: 'refresh',
} as const;

export const ErrorMsgApi = {
  DATA_NOT_SAVE: 'DNS',
};

export type ApiStatus =
  | { type: typeof ApiStatusTypes.SUCCESS; message?: string; status?: string }
  | {
      type: typeof ApiStatusTypes.FAILURE;
      message?: string;
      status?: string;
      notSavedData?: any;
    }
  | { type: typeof ApiStatusTypes.REFRESH; message?: string; status?: string }
  | { type: typeof ApiStatusTypes.ERROR; message: string }
  | { type: typeof ApiStatusTypes.INTERNET_CHECK; message?: string };

export const NotificationConst = {
  CHANNEL_ID: 'zylemini-background',
  CHANNEL_NAME: 'zylemini background processing',
  CHANNEL_IMPORTANCE: 'high',
  CHANNEL_SOUND: 'default',
  CHANNEL_ID_DEFAULT: 'zylemini-general',
  CHANNEL_DEFAULT_NAME: 'zylemini-general-channel',
};

// Web: Request notification permission and return token
export const requestUserPermission = async (): Promise<string | null> => {
  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    if (Notification.permission === 'granted') {
      // Web Push API token would be obtained from service worker
      // For now, return a placeholder
      return 'web_push_token_placeholder';
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // TODO: Get actual Web Push token from service worker
      return 'web_push_token_placeholder';
    }

    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Web: Display notification
export const onDisplayNotification = async (
  title: string,
  body: string,
  data?: any,
) => {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.png', // Place logo in public folder
        data,
      });
    }
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
};

// Web: Handle notification press (limited in web)
export const handleNotificationPressOrOnLoad = (
  notificationData: any,
  navigate: any,
) => {
  // Web: Handle notification click
  if (notificationData?.data) {
    // Navigate based on notification data
    console.log('Notification data:', notificationData.data);
  }
};

// Screen mapping (for navigation)
import { ScreenName } from '../constants/screenConstants';

export const NotificationScreenMap: { [key: string]: string } = {
  '1': ScreenName.SHOPS,
  '2': ScreenName.LOGIN,
  '3': ScreenName.FORGET_OTP,
  '4': ScreenName.MAINSCREEN,
  '5': ScreenName.DASHBOARD,
  // Add more mappings as needed
};

