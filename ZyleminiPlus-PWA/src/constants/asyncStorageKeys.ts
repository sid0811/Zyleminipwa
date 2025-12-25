/**
 * AsyncStorage keys
 * Copied from React Native version - Web adapted
 */
export const enum UserPreferenceKeys {
  LANGUAGE = 'app_language',
  ISLOGGEDIN = 'app_login',
  BASE_URL = 'client_base_url',
  USER_OTP = 'rand_OTP',
  // FCM KEY
  FCM_TOKEN_KEY = 'FCM_TOKEN_KEY',
  //LOGIN
  LOGIN_LOGIN_ID = 'loginId', //eg:- 2:EM003
  LOGIN_CLIENT_CODE = 'clientcode', //eg: WINDSRBV1
  LOGIN_USER_ID = 'userId', //eg:- 63
  LOGIN_USER_CRED = 'password', //i.e:- password
  LOGIN_USER_DEVICE_ID = 'deviceId', //i.e:- deviceId
  LOGIN_USER_JWT_TOKEN = 'token', //i.e:- user jwt token
}

export const enum NotificationKeys {
  PENDING_BG_NOTIFICATIONS = 'pendingbgNotification',
  PENDING_BG_ACTIONS = 'pendingbgAction',
}

