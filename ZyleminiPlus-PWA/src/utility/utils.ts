// Web-adapted utils.ts - Removed React Native dependencies
import moment from 'moment';
// Removed: react-native-responsive-screen, react-native-fs, react-native-background-geolocation
// Removed: @notifee/react-native, @react-native-firebase/messaging, react-native Linking/Platform

// Import web-compatible modules
import {
  AccessControlKeyConstants,
  DATE_FORMAT_CONSTANTS,
  ScreenName,
  VERSION_DETAIL,
} from '../constants/screenConstants';
import {
  ActivityTirggeredTracking,
  GeofenceSettings,
  PODType,
} from '../types/types';
import Apis from '../api/LoginAPICalls';
import cacheStorage from '../localstorage/secureStorage';
import {UserPreferenceKeys} from '../constants/asyncStorageKeys';
import {API_ENDPOINTS, AUTH_ENDPOINTS} from '../constants/APIEndPoints';
import type {GlobleAction} from '../redux/actionHooks/useGlobalAction';
import createApiClient from '../api/Client';
import { WebDatabase, executeSql, executeSqlWrite } from '../database/WebDatabase';

export interface GPSDataPoint {
  DateTimeStamp: string;
  UserId: number;
  UserName: string;
  VisitDate: string;
  latitude: number;
  longitude: number;
}

// GLOBAL

export const getAppOrderId = async (uid: number | string) => {
  let AOID = '';
  AOID = uid + moment().format('YYMMDDHHmmss');
  return AOID;
};

export const getCurrentDateTime = async (date = new Date()) =>
  moment(date).format('YYYY-MM-DD HH:mm:ss');

export const getCurrentDate = async (date = new Date()) =>
  moment(date).format('DD-MMM-YYYY');

export const getCurrentDateWithTime = async (date = new Date()) =>
  moment(date).format('DDMMMYYYYHHmmss');

export const getCurrentDateTimeT = (date = new Date()) =>
  moment(date).format(getTimeFormatWithT);

export const getTimeWithFormat = async (
  date?: Date,
  format: string = DATE_FORMAT_CONSTANTS?.GET_DATE_DD_MMM_YYYY || 'DD-MMM-YYYY',
) => {
  const finalDate = date || new Date();
  return moment(finalDate).format(format);
};

export const getMinDateFromPrevODate = async (date = '0') =>
  new Date(Date.now() - parseInt(date) * 24 * 60 * 60 * 1000);

export const isValidvalue = (value: any) => {
  // Original logic preserved: value !== undefined || value !== 'undefined' || value !== null || value !== 'null' ? true : false
  // Note: Original uses OR (||) which means if ANY condition is true, return true
  // This is logically equivalent to: if value is defined and not null/undefined strings, return true
  return value !== undefined ||
    value !== 'undefined' ||
    value !== null ||
    value !== 'null'
    ? true
    : false;
};

export const removeNonNumeric = (input = '') => input.replace(/[^0-9]/g, '');
export const removeSpecialCharacters = (input = '') =>
  input.replace(/[^a-zA-Z0-9 ]/g, '');
export const removeQuotation = (input = '') => input.replace(/['"]/g, '');
export const removeComaAndAT = (input = '') => input.replace(/[@,]/gm, '');

// Database
export const databaseName = 'ZyleminiPlusDatabase';
export const databaseVersion = '1.0';
export const databaseDisplayName = 'ZyleminiPlusDatabase';
export const databaseSize = 200000000; // in bytes

export const DATABASE_VERSION = 7;
export const MAX_SIZE_BYTES_TO_POST = 27 * 1024 * 1024; // 27 MB in bytes

export const _userAccessDataDefault: string[] = [
  'SIDE_MENU_SYNCNOW',
  'SIDE_MENU_REFRESHDATA',
  'SIDE_MENU_LOGOUT',
  'SIDE_MENU_REPORTERROR',
];

export const USER_ACTIVITY_TYPE = {
  '0': 'ORDER BOOKED',
  '1': 'DATA COLLECTED',
  '2': 'DATA COLLECTED',
  '3': 'IMAGE TAKEN',
  '4': 'CHECK IN',
  '5': 'Asset Verified',
  '6': 'ACTIVITY DONE',
  '7': 'COLLECTION',
  '8': 'USER DAY STARTED',
  '9': 'USER DAY END',
};

// LOGIN - Web: Use CSS units instead of responsive screen
export const LOGIN_BOX = {
  Height: '8vh', // Web equivalent
  Width: '87vw', // Web equivalent
};

export const UPTIME_FROM_CURRENT = Math.floor(Date.now() / 1000) + 120;

export const generateRandomOTP = async () =>
  Math.floor(Math.random() * 9000 + 1000);

// DASHBOARD
export const attendanceList = [
  {id: '1', name: 'Local Market'},
  {id: '2', name: 'Outstation'},
  {id: '3', name: 'Work from Home'},
  {id: '4', name: 'Ex-Headquarter'},
];

// FilePath - Web: Use IndexedDB or localStorage for file storage
export const filePaths = {
  shops: (route: string) => `Shops/${route}`,
  collections: (route: string) => `Collections/${route}`,
  POD: (route: string) => `POD/${route}`,
  PO: (route: string) => `PO/${route}`,
  Orders: (route: string) => `Orders/${route}`,
  PDF: () => `Documents/`,
};

export const picCaputredFrom = {
  SHOP: 'InfoShop',
  CHEQUE_COLLECTION: 'ChequeCollection',
  ADD_NEW_SHOP: 'AddNewShop',
  ASSETS: 'Assets',
  POD: 'POD',
  PO: 'PO',
  ORDERS: 'Pdfs',
};

// COLLECTION TYPE
export const PaymentMode = {
  CHEQUE: 'CHEQUE',
  CASH: 'CASH',
  NEFT: 'NEFT',
  RTGS: 'RTGS',
};

export const paymentModeCheck = [
  {type: 'CHEQUE', mode: 1},
  {type: 'CASH', mode: 0},
  {type: 'NEFT', mode: 3},
  {type: 'RTGS', mode: 2},
];

// DATA COLLECTION
export const SalesStock = {
  SALE: 'Sales',
  STOCK: 'Stock',
};

export const auditAsset = {
  AUDITEXIST: 'Audit Existing Asset',
  ADDNEW: 'Add New Asset',
  REPLACE: 'Replace Asset',
  DISCARD: 'Discard Asset',
};

// CREATE NEW ORDER
export const entityTypes = [
  {value: 'Retailer', id: 1},
  {value: 'Distributor', id: 2},
];

export const discountTypeArray = [
  {id: '1', name: 'Net'},
  {id: '2', name: 'Percent'},
  {id: '3', name: 'Rate Per Case'},
  {id: '4', name: 'Rate Per Unit'},
];

export const discountOnArray = [
  {id: '1', name: 'Box'},
  {id: '2', name: 'Bottle'},
  {id: '3', name: 'Amount'},
];

export const FilterNameValidation = [
  {name: 'firstFilter'},
  {name: 'secondFilter'},
];

export const enum COLLECTION_TYPE {
  ORDER = '0',
  DATA_COLLECTION1 = '1',
  DATA_COLLECTION2 = '2',
  IMAGE = '3',
  VISITED_SHOPS = '4',
  ASSETS = '5',
  MEETING = '6',
  PAYMENT_COLLECTION = '7',
  ATTENDANCE_IN = '8',
  ATTENDANCE_OUT = '9',
  TAKE_SURVEY = '10',
}

export function formatNoWithTwoDecimal(input: string) {
  let numberValue = parseFloat(input);
  if (!isNaN(numberValue)) {
    let formattedValue = numberValue.toFixed(2);
    return Number(formattedValue);
  } else {
    console.error('Invalid number format for input:', input);
    return 0;
  }
}

// My Report List - Web: Navigation adapted for React Router
export const MyReportListData = (t: any, navigate: any) => [
  {
    img: null, // Will need to import or use web-compatible images
    title: 'Distributor Data Upload',
    duration: 'Last 7 days',
    nav: () => navigate(ScreenName?.DISTRIBUTOR_DATA_STATUS || '/distributor-data-status'),
    accessKeyValue: AccessControlKeyConstants?.REPORT_DISTRIBUTOR_DATA_UPLOAD || 'REPORT_DISTRIBUTOR_DATA_UPLOAD',
  },
  // Add more reports as needed
];

export const chartConfigBrandSales = {
  backgroundGradientFrom: '#01C6FD',
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: '#00D4BD',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2,
  useShadowColorFromDataset: true,
  propsForDots: {
    r: '6',
    strokeWidth: '2',
  },
  renderVerticalLabels: {
    paddingLeft: 10,
  },
};

export const brandWiseSorting = [
  {name: 'Top performing Brands', value: '3'},
  {name: 'Least performing Brands', value: '4'},
  {name: 'Ascending', value: '1'},
  {name: 'Decending', value: '2'},
];

export const today = moment();
export const currentMonth = today.month();
export const currentYear = today.year();

export const previousMonthDate = today.clone().subtract(1, 'month');
export const previousMonth = previousMonthDate.month();
export const previousYear = previousMonthDate.year();

export const twoMonthsBackDate = today.clone().subtract(2, 'months');
export const twoMonthsBack = twoMonthsBackDate.month();
export const twoMonthsBackYear = twoMonthsBackDate.year();

export const getNextMonthDate = (date = today) => {
  const nextDate = date.clone().add(1, 'month');
  return {
    date: nextDate,
    month: nextDate.month(),
    year: nextDate.year(),
  };
};

export const getNextTwoMonthDate = (date = today) => {
  const twoMonthsNextDate = date.clone().add(2, 'months');
  return {
    date: twoMonthsNextDate,
    month: twoMonthsNextDate.month(),
    year: twoMonthsNextDate.year(),
  };
};

export const getPreviousMonthDate = (date = today) => {
  const prevDate = date.clone().subtract(1, 'month');
  return {
    date: prevDate,
    month: prevDate.month(),
    year: prevDate.year(),
  };
};

export const getPreviousTwoMonthBackDate = (date = today) => {
  const twoMonthsBackDate = date.clone().subtract(2, 'months');
  return {
    date: twoMonthsBackDate,
    month: twoMonthsBackDate.month(),
    year: twoMonthsBackDate.year(),
  };
};

// Web-adapted: Removed geofenceCache dependency (will need to be implemented)
export async function fetchUserAccess(
  userId: string,
  actions: GlobleAction,
  setGeofenceGlobalSettingsAction?: (val: GeofenceSettings) => void,
  getUserAccessDataParam?: any,
  setAccessControlSettingsAction?: (val: string[]) => void,
) {
  try {
    let _getUserAccessData: any = [];
    if (getUserAccessDataParam != null) {
      _getUserAccessData = getUserAccessDataParam;
    } else {
      _getUserAccessData = await Apis.getUserAccess({
        UserId: Number(userId),
      });
    }
    let isWhatsAppOrderPostDocument = false;
    isWhatsAppOrderPostDocument =
      (_getUserAccessData.UserAccessDetails[0].isWhatsAppOrderPostDocument
        ? _getUserAccessData.UserAccessDetails[0].isWhatsAppOrderPostDocument
        : '0') === '1';
    let geofenceSettings = _getUserAccessData?.GeoFencingSettings[0];
    let accessControlUserData: string =
      _getUserAccessData.UserAccessDetails[0].AccessControlUser;

    let _userAccessData = _userAccessDataDefault;
    if (accessControlUserData != null && accessControlUserData != undefined) {
      _userAccessData = accessControlUserData.includes(',')
        ? accessControlUserData.split(',').map((item: string) => item.trim())
        : [];
      _userAccessData.push(
        'SIDE_MENU_SYNCNOW',
        'SIDE_MENU_REFRESHDATA',
        'SIDE_MENU_LOGOUT',
        'SIDE_MENU_REPORTERROR',
      );
    }
    actions.setisWhatsAppOrderPostDocumentAction(isWhatsAppOrderPostDocument);
    setAccessControlSettingsAction?.(_userAccessData);

    // Web: Geofence cache will need web implementation
    // let geofenceCacheSettings = await geofenceCache.getGeofenceSettingsCache();
    
    if (geofenceSettings) {
      let _geofenceRadius_Shop = '200';
      let _geofenceZoomRadiusLatDelat = '0.001';
      let _geofenceZoomRadiusLongDelat = '0.001';
      let _liveLocationStartTime = '09:00';
      let _liveLocationEndTime = '22:00';
      let _userId = userId;
      let _isShopEnteredNotificationEnabled = false;
      let _lastSyncThresholdTimeApiCall = 15;
      let _lastSyncLiveLocationApiTimeStamp = 0; // Web: Will need cache implementation
      let _isAttandanceBasedTrackingEnabled = false;
      let _isAppOpenedActivityBasedTrackingEnabled = false;
      let _currentDate = await getTimeWithFormat();
      
      if (
        geofenceSettings.GeofenceRadius_Shop != null &&
        geofenceSettings.GeofenceRadius_Shop != ''
      ) {
        _geofenceRadius_Shop = geofenceSettings.GeofenceRadius_Shop;
      }
      if (
        geofenceSettings.GeoLocationMapZoomRadius != null &&
        geofenceSettings.GeoLocationMapZoomRadius.toString().includes(',')
      ) {
        let _geofenceZoomDeltas =
          geofenceSettings.GeoLocationMapZoomRadius.toString().split(',');
        _geofenceZoomRadiusLatDelat = _geofenceZoomDeltas[0];
        _geofenceZoomRadiusLongDelat = _geofenceZoomDeltas[1];
      }
      if (
        geofenceSettings.LiveLocationStartTime != null &&
        geofenceSettings.LiveLocationStartTime.toString().includes(':')
      ) {
        _liveLocationStartTime = geofenceSettings.LiveLocationStartTime;
      }
      if (
        geofenceSettings.LiveLocationEndTime != null &&
        geofenceSettings.LiveLocationEndTime.toString().includes(':')
      ) {
        _liveLocationEndTime = geofenceSettings.LiveLocationEndTime;
      }
      if (geofenceSettings?.IsShopEnteredNotificationEnabled !== undefined) {
        _isShopEnteredNotificationEnabled =
          geofenceSettings.IsShopEnteredNotificationEnabled === '1';
      }
      if (geofenceSettings?.IsAttandanceBasedTracking !== undefined) {
        _isAttandanceBasedTrackingEnabled =
          geofenceSettings.IsAttandanceBasedTracking === '1';
      }
      if (geofenceSettings?.IsAppOpenedActivityBasedTracking !== undefined) {
        _isAppOpenedActivityBasedTrackingEnabled =
          geofenceSettings.IsAppOpenedActivityBasedTracking === '1';
      }
      
      setGeofenceGlobalSettingsAction?.({
        IsGeoFencingEnabled: geofenceSettings.IsGeoFencingEnabled === '1',
        IsLocationRestriction: geofenceSettings.IsLocationRestriction === '1',
        IsFetchOneTimeLatLogEnabled:
          geofenceSettings.IsFetchOneTimeLatLogEnabled === '1',
        GeofenceRadius_Shop: _geofenceRadius_Shop,
        GeofenceRadiusLatDelat: _geofenceZoomRadiusLatDelat,
        GeofenceRadiusLongDelat: _geofenceZoomRadiusLongDelat,
        GeoFenceDistanceFilterMtr: geofenceSettings?.GeoFenceDistanceFilterMtr
          ? geofenceSettings.GeoFenceDistanceFilterMtr
          : '10',
        IsLiveLocationTracking:
          (geofenceSettings?.ContinuousLiveTracking
            ? geofenceSettings.ContinuousLiveTracking
            : '0') === '1',
        LiveLocationStartTime: _liveLocationStartTime,
        LiveLocationEndTime: _liveLocationEndTime,
        LoggedInUserId: _userId,
        IsShopEnteredNotificationEnabled: _isShopEnteredNotificationEnabled,
        LastSyncLiveLocationApiTimeStamp: _lastSyncLiveLocationApiTimeStamp,
        LastSyncThresholdTimeApiCall:
          geofenceSettings?.LastSyncThresholdTimeApiCall
            ? Number(geofenceSettings.LastSyncThresholdTimeApiCall)
            : _lastSyncThresholdTimeApiCall,
        TypeOfLiveLocationTracking: {
          IsAttandanceBasedTracking: _isAttandanceBasedTrackingEnabled,
          IsAppOpenedActivityBasedTracking:
            _isAppOpenedActivityBasedTrackingEnabled,
        },
        ActivityTriggered: {
          IsAttandanceTriggeredForTheDay: false, // Web: Will need cache
          AppOpenedActivityTriggeredForTheDay: _currentDate,
        },
      });
    }
  } catch (error) {
    console.log('error getting user access detail -->', error);
  }
}

// Web-adapted: File operations using IndexedDB or Blob storage
export const logAndReportError = async (errorData: object) => {
  try {
    const timestamp = new Date()
      .toISOString()
      .replace(/T/, '_')
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    const filename = `${'Zylemini+'}_${timestamp}.json`;

    const jsonString = JSON.stringify(errorData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Convert to base64 for API
    const reader = new FileReader();
    const base64File = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const apiClient = await createApiClient();
    const response = await apiClient.post<any>(
      API_ENDPOINTS.ERRORLOG,
      base64File,
    );

    return response.data;
  } catch (err) {
    console.error('Error in logAndReportError:', err);
  }
};

// Web-adapted: FCM token not available on web, use Web Push API
export async function getTokenFCM() {
  try {
    // Web: Use Web Push API instead of FCM
    // This is a placeholder - actual implementation needs Service Worker
    console.log('Web Push API token fetch - to be implemented');
    return null;
  } catch (error) {
    console.error('Error fetching Web Push Token:', error);
    return null;
  }
}

export function resetLoginData(globalActions?: GlobleAction) {
  console.log('resetLoginData', globalActions?.isLoggedin);
  globalActions?.setIsLogin(false);
  resetGeofenceData(globalActions?.setGeofenceGlobalSettingsAction);
}

// Web-adapted: Geofence reset (no BackgroundGeolocation on web)
export function resetGeofenceData(
  setGeofenceGlobalSettingsAction?: (val: GeofenceSettings) => void,
) {
  // Web: Geofencing is limited, just reset settings
  setGeofenceGlobalSettingsAction?.({
    IsGeoFencingEnabled: false,
    IsLocationRestriction: false,
    IsFetchOneTimeLatLogEnabled: false,
    LiveLocationStartTime: '',
    LiveLocationEndTime: '',
    LoggedInUserId: '',
    IsShopEnteredNotificationEnabled: false,
    LastSyncLiveLocationApiTimeStamp: 0,
    LastSyncThresholdTimeApiCall: 0,
    TypeOfLiveLocationTracking: {
      IsAttandanceBasedTracking: false,
      IsAppOpenedActivityBasedTracking: false,
    },
    ActivityTriggered: {
      AppOpenedActivityTriggeredForTheDay: undefined,
      IsAttandanceTriggeredForTheDay: false,
    },
    IsLiveLocationTracking: false,
  });
}

export function isLocationEmpty(latitude: string | null | undefined): Boolean {
  return (
    latitude == null || latitude == 'null' || latitude == '' || latitude == '0'
  );
}

export const CollectionType = {
  Collection: 'Collection',
};

export const ReportCategories = [
  {
    name: 'Target vs Achievement',
    subtitle: 'Achievement against set target',
    icon: 'target',
    CommandType: '1',
    iconColor: '#0000FF', // Blue
    accessKeyValue: AccessControlKeyConstants?.DASHBOARD_PERFORMANCE_TVA || 'DASHBOARD_PERFORMANCE_TVA',
  },
  // Add more categories as needed
];

export const ReportName = {
  dashboard: 'Dashboard',
  perfReport: 'Performance Report',
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'km' | 'm' = 'm',
) => {
  try {
    const sine = (num: number) => Math.sin(num / 2);
    const cos = (num: number) => Math.cos(num);
    const earthRadius = 6371;

    const φ1 = degreesToRadians(lat1);
    const λ1 = degreesToRadians(lon1);
    const φ2 = degreesToRadians(lat2);
    const λ2 = degreesToRadians(lon2);
    const Δφ = φ2 - φ1;
    const Δλ = λ2 - λ1;
    const a = sine(Δφ) * sine(Δφ) + cos(φ1) * cos(φ2) * Math.pow(sine(Δλ), 2);

    const distanceInKm =
      2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * earthRadius;
    if (unit === 'km') {
      return distanceInKm;
    } else if (unit === 'm') {
      return distanceInKm * 1000;
    } else {
      throw new Error('unit must be either km or m');
    }
  } catch (err) {
    console.log('error while converting distance -->', err);
    return;
  }
};

function degreesToRadians(degrees = 0) {
  if (isNaN(degrees)) {
    throw new Error('Must input valid number for degrees');
  }
  return degrees * 0.017453292519943295;
}

// ERROR LOGS - Web: Use WebDatabase instead of SqlDatabase
export const writeErrorLog = async (funcName: string, err: any) => {
  const curDateTime = await getCurrentDateTime();
  try {
    await executeSqlWrite(
      `INSERT INTO uses_log (menu_keys, uses_datetime, is_sync) VALUES (?, ?, ?)`,
      [`ERROR: ${funcName} ${String(err)}`, curDateTime, 'False']
    );
  } catch (error) {
    console.error('Error writing log:', error);
  }
};

// General LOGS
export const writeLog = async (category: string, message: string) => {
  const curDateTime = await getCurrentDateTime();
  try {
    await executeSqlWrite(
      `INSERT INTO uses_log (menu_keys, uses_datetime, is_sync) VALUES (?, ?, ?)`,
      [`${category}: ${message}`, curDateTime, 'False']
    );
  } catch (error) {
    console.error('Error writing log:', error);
  }
};

// Activity LOGS
export const writeActivityLog = async (activity: string) => {
  const curDateTime = await getCurrentDateTime();
  try {
    await executeSqlWrite(
      `INSERT INTO uses_log (menu_keys, uses_datetime, is_sync) VALUES (?, ?, ?)`,
      [`Activity: ${activity}`, curDateTime, 'False']
    );
  } catch (error) {
    console.error('Error writing activity log:', error);
  }
};

export const writeApiVersionLog = async () => {
  const curDateTime = await getCurrentDateTime();
  try {
    await executeSqlWrite(
      `INSERT INTO uses_log (menu_keys, uses_datetime, is_sync) VALUES (?, ?, ?)`,
      [`App Version: ${VERSION_DETAIL || 'Unknown'} APP API Version: ${AUTH_ENDPOINTS.APP_API_VERSION}`, curDateTime, 'False']
    );
  } catch (error) {
    console.error('Error writing API version log:', error);
  }
};

export const writeReportsLog = async (activity: string) => {
  const curDateTime = await getCurrentDateTime();
  try {
    await executeSqlWrite(
      `INSERT INTO uses_log (menu_keys, uses_datetime, is_sync) VALUES (?, ?, ?)`,
      [`Reports: ${activity}`, curDateTime, 'False']
    );
  } catch (error) {
    console.error('Error writing reports log:', error);
  }
};

export const writeLocationLog = async (
  funcName: string,
  event: string,
  err: any,
) => {
  const curDateTime = await getCurrentDateTime();
  try {
    await executeSqlWrite(
      `INSERT INTO uses_log (menu_keys, uses_datetime, is_sync) VALUES (?, ?, ?)`,
      [`Geofence: ${event} :- ${funcName} ${String(err)}`, curDateTime, 'False']
    );
  } catch (error) {
    console.error('Error writing location log:', error);
  }
};

// post data sync object keys
export const dataSyncObjectKeys = {
  OrderMaster: 'OrderMaster',
  OrderDetails: 'OrderDetails',
  NewParty: 'NewParty',
  NewPartyImage: 'NewPartyImage',
  newPartyTargetId: 'newPartyTargetId',
  LogUsages: 'LogUsages',
  Collections: 'Collections',
  CollectionsDetails: 'CollectionsDetails',
  CategoryDiscountItem: 'CategoryDiscountItem',
  PaymentReceipt: 'PaymentReceipt',
  Discount: 'Discount',
  ImageDetails: 'ImageDetails',
  AssetDetails: 'AssetDetails',
};

export const dataReportObjectKeys = {
  OrderMaster: 'OrderMaster',
  OrderDetails: 'OrderDetails',
  NewParty: 'NewParty',
  NewPartyImage: 'NewPartyImage',
  newPartyTargetId: 'newPartyTargetId',
  LogUsages: 'LogUsages',
  Collections: 'Collections',
  CollectionsDetails: 'CollectionsDetails',
  CategoryDiscountItem: 'CategoryDiscountItem',
  PaymentReceipt: 'PaymentReceipt',
  Discount: 'Discount',
  ImageDetails: 'ImageDetails',
  AssetDetails: 'AssetDetails',
  PaymentReceiptLog: 'PaymentReceiptLog',
  CollectionsLog: 'CollectionsLog',
  CollectionsDetailsLog: 'CollectionsDetailsLog',
  DiscountTemp: 'DiscountTemp',
  Settings: 'Settings',
  ReportControlMaster: 'ReportControlMaster',
  Report: 'Report',
  Customer: 'Customer',
  Distributor: 'Distributor',
  PItem: 'PItem',
  OutstandingDetails: 'OutstandingDetails',
  MeetReport: 'MeetReport',
  MJPMaster: 'MJPMaster',
  ChequeReturnDetails: 'ChequeReturnDetails',
  NewPartyImageOutlet: 'NewPartyImageOutlet',
  OrderMasterTemp: 'OrderMasterTemp',
  OrderDetailsTemp: 'OrderDetailsTemp',
  uses_log: 'UsesLog',
};

export function getTodaysEndTime() {
  const today = new Date();
  today.setHours(23, 59, 59);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  const seconds = String(today.getSeconds()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

export function getCurrentSystemTimeIn24HoursFormat(): string {
  const today = new Date();
  return today.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
}

export function compareCurrentTimeIsGreaterThan(startTime: string): boolean {
  return startTime < getCurrentSystemTimeIn24HoursFormat();
}

export function compareCurrentTimeIsLessThan(endTime: string): boolean {
  return endTime > getCurrentSystemTimeIn24HoursFormat();
}

export function randomColorGenerator(): string {
  return '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');
}

// Function to filter GPS data by distance and speed thresholds
export const filterGPSData = (
  gpsData: GPSDataPoint[],
  maxDistanceMeters: number,
  maxSpeedKmh: number,
): GPSDataPoint[] => {
  const filteredData: GPSDataPoint[] = [];

  for (let i = 0; i < gpsData.length - 1; i++) {
    const point1 = gpsData[i];
    const point2 = gpsData[i + 1];

    const time1 = new Date(point1?.DateTimeStamp).getTime();
    const time2 = new Date(point2?.DateTimeStamp).getTime();

    if (isNaN(time1) || isNaN(time2)) {
      console.log(`Invalid timestamp at point ${i + 1}`);
      continue;
    }

    const timeDiffInHours = (time2 - time1) / (1000 * 60 * 60);

    if (timeDiffInHours === 0) {
      console.log(`Same timestamp at point ${i + 1}`);
      continue;
    }

    const distance = calculateDistance(
      point1.latitude,
      point1.longitude,
      point2.latitude,
      point2.longitude,
      'm',
    );

    if (typeof distance === 'undefined') {
      console.log(`Error calculating distance at point ${i + 1}`);
      continue;
    }

    const speedKmh = distance / 1000 / timeDiffInHours;

    if (distance <= maxDistanceMeters && speedKmh <= maxSpeedKmh) {
      filteredData.push(point1);
    }
  }

  if (gpsData.length > 0) {
    filteredData.push(gpsData[gpsData.length - 1]);
  }

  return filteredData;
};

export function calDistance(ExecutiveLatLogList: any) {
  let totalDistance = 0;
  for (let i = 1; i < ExecutiveLatLogList.length; i++) {
    const pointA = ExecutiveLatLogList[i - 1];
    const pointB = ExecutiveLatLogList[i];
    let x = calculateDistance(
      pointA?.latitude,
      pointA?.longitude,
      pointB.latitude,
      pointB.longitude,
      'km',
    );
    if (x != undefined) totalDistance += x;
  }
  return totalDistance;
}

export const getDateRangeArray = (
  date: Date | moment.Moment | string,
  monthFormat?: string,
) => {
  const selectedDate = moment(date);
  const nextMonthDate = getNextMonthDate(selectedDate);
  const nextTwoMonthsDate = getNextTwoMonthDate(selectedDate);

  const validMonthFormat = monthFormat ? monthFormat : 'MMMM';

  const updatedMonths = [
    {
      month: selectedDate.format(validMonthFormat),
      monthKey: String(selectedDate.month() + 1),
      year: String(selectedDate.year()),
    },
    {
      month: nextMonthDate.date.format(validMonthFormat),
      monthKey: String(nextMonthDate.month + 1),
      year: String(nextMonthDate.year),
    },
    {
      month: nextTwoMonthsDate.date.format(validMonthFormat),
      monthKey: String(nextTwoMonthsDate.month + 1),
      year: String(nextTwoMonthsDate.year),
    },
  ];

  return updatedMonths;
};

export function hasMinutesPassed(
  lastTimestamp: number,
  minuteThreshold: number,
) {
  const now = new Date().getTime();
  const threshold = minuteThreshold * 60 * 1000;
  return now - lastTimestamp > threshold;
}

// POD Module
export function createPadded15DigitUserId(userId: string) {
  return userId.padStart(15, '0');
}

export const PODTypeSelectionTab: PODType[] = [
  {tabName: 'Claim', id: 2},
  {tabName: 'Invoices', id: 1},
];

export const PODUploadType: PODType[] = [
  {tabName: 'Not Uploaded', id: 1},
  {tabName: 'Uploaded', id: 2},
];

export const INVOICE_UPLOAD_TYPES = [
  'POD Upload',
  'Invoice Upload',
  'POD + Invoice Upload',
  'Other Upload',
];

// Web-adapted: File to Base64 conversion
export const convertFileToBase64 = async (file: File | Blob): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error converting file to Base64:', error);
    throw error;
  }
};

// Web: File input handling
export const convertFileToBase64FromDirectory = async (
  file: File,
): Promise<string> => {
  try {
    return await convertFileToBase64(file);
  } catch (error) {
    console.error('Error converting file to Base64:', error);
    throw error;
  }
};

// Web: Not needed (no content URIs)
export const resolveContentUriToFilePath = async (
  uri: string,
  filePath: string,
): Promise<string> => {
  // Web: Files are already accessible
  return uri;
};

export function isDataEmpty(data: any) {
  if (
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' && Object.keys(data).length === 0)
  ) {
    return true;
  }
  return false;
}

export function calculateDaysDifference(plannedDate: string): number {
  console.log('calculateDaysDifference', plannedDate);
  const parsedDate = moment(plannedDate, 'DD-MMM-YYYY').startOf('day');
  const currentDate = new Date();
  const currentMoment = moment(currentDate).startOf('day');
  const differenceInDays = currentMoment.diff(parsedDate, 'days');
  return differenceInDays;
}

export function getSplittedPlannedDate(plannedDate: string) {
  const [_day, _monthAbbr, _year] = plannedDate.split('-');
  return {_day, _monthAbbr, _year};
}

export function currentTimeData() {
  const _currentDate = new Date();
  var datee = _currentDate.getDate();
  var month = _currentDate.getMonth();
  var year = _currentDate.getFullYear();
  var hours = _currentDate.getHours();
  var min = _currentDate.getMinutes();
  var sec = _currentDate.getSeconds();

  const formattedDate = datee < 10 ? `0${datee}` : `${datee}`;
  const formattedMonth = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ][month];
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMin = min < 10 ? `0${min}` : `${min}`;
  const formattedSec = sec < 10 ? `0${sec}` : `${sec}`;

  return {
    date: formattedDate,
    month: formattedMonth,
    year,
    hours: formattedHours,
    min: formattedMin,
    sec: formattedSec,
  };
}

export function getSplittedTime(time: string, format: string) {
  const momentObj = moment(time, format);
  const hours = momentObj.format('HH');
  const minutes = momentObj.format('mm');
  const seconds = momentObj.format('ss');
  return {
    splittedHour: hours,
    splittedMinutes: minutes,
    splittedSeconds: seconds,
  };
}

export const getTimeFormatWithT = 'YYYY-MM-DDTHH:mm:ss';

export function isAccessControlProvided(ref: string[], value: string): boolean {
  return ref?.includes(value) ?? false;
}

export const isLiveLocationTrackingConditionMeet = async (
  geofenceSettings: GeofenceSettings,
): Promise<boolean> => {
  let datetime = await getTimeWithFormat();
  let _isAttandanceBasedTracking =
    geofenceSettings.TypeOfLiveLocationTracking.IsAttandanceBasedTracking &&
    geofenceSettings.ActivityTriggered.IsAttandanceTriggeredForTheDay;

  let _isAppOpenActivityBasedTracking =
    geofenceSettings.TypeOfLiveLocationTracking
      .IsAppOpenedActivityBasedTracking &&
    geofenceSettings.ActivityTriggered.AppOpenedActivityTriggeredForTheDay ==
      datetime;

  return (
    geofenceSettings.IsLiveLocationTracking &&
    (compareCurrentTimeIsGreaterThan(geofenceSettings.LiveLocationStartTime) ||
      _isAttandanceBasedTracking ||
      _isAppOpenActivityBasedTracking) &&
    compareCurrentTimeIsLessThan(geofenceSettings.LiveLocationEndTime)
  );
};

// Web-adapted: Database query instead of direct function
export const isAttandanceMarked = async (dateOfAttendanceMarked: string) => {
  try {
    const result = await executeSql(
      `SELECT COUNT(*) as count FROM MeetReport WHERE ActivityTitle = 'ATTENDANCE_IN' AND PlannedDate = ?`,
      [dateOfAttendanceMarked]
    );
    return result.length > 0 && result[0].count >= 1;
  } catch (error) {
    return false;
  }
};

export const updateAttandanceActivityInCacheAndReduxGeofencing = async (
  geofenceSettings: GeofenceSettings,
  storeGeofenceSettingsCache: (value: GeofenceSettings) => void,
  setGeofenceGlobalSettingsAction: (val: GeofenceSettings) => void,
  isMarkActivity: boolean = false,
) => {
  geofenceSettings.ActivityTriggered = {
    ...geofenceSettings.ActivityTriggered,
    IsAttandanceTriggeredForTheDay: isMarkActivity,
  };
  let _geofenceSettings = {
    ...geofenceSettings,
    ActivityTriggered: {
      AppOpenedActivityTriggeredForTheDay:
        geofenceSettings.ActivityTriggered.AppOpenedActivityTriggeredForTheDay,
      IsAttandanceTriggeredForTheDay: isMarkActivity,
    },
  };
  setGeofenceGlobalSettingsAction?.(_geofenceSettings);
  storeGeofenceSettingsCache?.(_geofenceSettings);
};

export const updateAppOpenActivityInCacheAndReduxGeofencing = async (
  geofenceSettings: GeofenceSettings,
  storeGeofenceSettingsCache: (value: GeofenceSettings) => void,
  setGeofenceGlobalSettingsAction: (val: GeofenceSettings) => void,
  currentDateTime: string,
  isMarkActivity?: boolean,
) => {
  let _geofenceSettings = {
    ...geofenceSettings,
    ActivityTriggered: {
      AppOpenedActivityTriggeredForTheDay: currentDateTime,
      IsAttandanceTriggeredForTheDay:
        isMarkActivity != undefined
          ? isMarkActivity
          : geofenceSettings.ActivityTriggered.IsAttandanceTriggeredForTheDay,
    },
  };
  setGeofenceGlobalSettingsAction?.(_geofenceSettings);
  storeGeofenceSettingsCache?.(_geofenceSettings);
};

// Web-adapted: Browser link opening
export function openLinkInBrowser(url: string) {
  window.open(url, '_blank');
}

export type OpenMapArgs = {
  lat: string | number;
  lng: string | number;
  label: string;
};

export const openMap = ({lat, lng, label}: OpenMapArgs) => {
  const url = `https://www.google.com/maps?q=${lat},${lng}&label=${encodeURIComponent(label)}`;
  window.open(url, '_blank');
};

export const openPhoneDialer = (phoneNumber: string) => {
  window.location.href = `tel:${phoneNumber}`;
};

export const contactSplitLogic = (info: string) => {
  let result: string | undefined;
  if (info.includes('||')) {
    const parts = info.split('||');
    if (parts.length > 2 && parts[2].includes(':')) {
      const subParts = parts[2].split(':');
      if (subParts.length > 1) {
        return (result = subParts[1]);
      }
    }
  }
};

export const getEffectiveLocation = (
  latitude: number | undefined,
  longitude: number | undefined,
  globalLocation?: {latitude?: number; longitude?: number},
) => {
  return {
    latitude:
      latitude && latitude !== 0 ? latitude : globalLocation?.latitude ?? 0,
    longitude:
      longitude && longitude !== 0 ? longitude : globalLocation?.longitude ?? 0,
  };
};

export const formatToIST = (utcTimestamp: string): string => {
  return moment(utcTimestamp)
    .utcOffset('+05:30')
    .format(DATE_FORMAT_CONSTANTS?.GET_DATE_YYYY_MM_DD_HH_mm_ss || 'YYYY-MM-DD HH:mm:ss');
};

// Web-adapted: Removed Location type check (not applicable)
export function shouldUseLocationForTracking(location: any): boolean {
  // Web: Basic validation
  if (!location || !location.coords) return false;
  return true;
}
