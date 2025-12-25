import {createSlice} from '@reduxjs/toolkit';
import {reducerName} from '../../constants/reduxConstants';
import {GeofenceSettings, MeetingEndBlockValidation} from '../../types/types';

type INITIALSTATE = {
  isLoggedin: boolean;
  isDarkMode: boolean;
  isMultiDivision: boolean;
  isParentUser: boolean;
  parentEnabled: boolean;
  syncFlag: boolean;
  accessControl: any;
  menuOrder: any;
  lastExecutionTime: string;
  isShopCheckedIn: boolean;
  isMeetingEnded: boolean;
  persistedStartTime: string;
  blockedShopName: any;
  selectedAreaId: string;
  syncRefresh: boolean;
  isSplashShown: boolean;
  globalGeofenceSettings: GeofenceSettings;
  isLogWritingEnabled: boolean;
  AllowBackdatedDispatchDays: string;
  meetingEndBlocker: MeetingEndBlockValidation;
  isPDC_Unallocated_Enabled: boolean;
  onNavWipeDataPOD: boolean;
  accessControlSettings: string[];
  isSyncImmediate: boolean;
  navigationSourceShops: boolean;
  isWhatsAppOrderPostDocument: boolean;
  AttendanceOptions: {id: string; name: string}[];
  externalShare: false;
  OrderConfirmationSignature: boolean;
};

const INITIAL_STATE: INITIALSTATE = {
  isLoggedin: false,
  isDarkMode: false,
  isMultiDivision: false,
  isParentUser: false,
  parentEnabled: false,
  syncFlag: false,
  accessControl: [],
  menuOrder: [],
  lastExecutionTime: '',
  isShopCheckedIn: false,
  isMeetingEnded: false,
  persistedStartTime: '', // FOR SHOP CHECK-OUT AND ENDING MEETING
  blockedShopName: {},
  selectedAreaId: '0', // areaID for getMandetaory procedure call
  syncRefresh: false,
  isSplashShown: true,
  globalGeofenceSettings: {
    IsGeoFencingEnabled: false,
    IsFetchOneTimeLatLogEnabled: false,
    IsLocationRestriction: false,
    LiveLocationStartTime: '',
    LiveLocationEndTime: '',
    LoggedInUserId: '',
    IsShopEnteredNotificationEnabled: false,
    LastSyncLiveLocationApiTimeStamp: 0,
    LastSyncThresholdTimeApiCall: 15,
    TypeOfLiveLocationTracking: {
      IsAttandanceBasedTracking: false,
      IsAppOpenedActivityBasedTracking: false,
    },
    ActivityTriggered: {
      IsAttandanceTriggeredForTheDay: false,
      AppOpenedActivityTriggeredForTheDay: undefined,
    },
    IsLiveLocationTracking: false,
  },
  isLogWritingEnabled: false,
  AllowBackdatedDispatchDays: '0',
  meetingEndBlocker: {
    Meeting_Id: '',
    EntityTypeID: '',
    ActivityTitle: '',
    PlannedDate: '',
    IsActivityDone: '',
    EntityType: '',
  },
  isPDC_Unallocated_Enabled: false,
  onNavWipeDataPOD: false,
  accessControlSettings: [
    'SIDE_MENU_SYNCNOW',
    'SIDE_MENU_REFRESHDATA',
    'SIDE_MENU_LOGOUT',
  ],
  isSyncImmediate: false,
  navigationSourceShops: false,
  isWhatsAppOrderPostDocument: false,
  AttendanceOptions: [],
  externalShare: false,
  OrderConfirmationSignature: false,
};

const globalSlice = createSlice({
  name: reducerName.GLOBLE_REDUCER,
  initialState: INITIAL_STATE,
  reducers: {
    setIsLoggedIn: (state, action) => {
      state.isLoggedin = action.payload;
    },
    setIsDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    setIsMultiDivision: (state, action) => {
      state.isMultiDivision = action.payload;
    },
    setIsParentUser: (state, action) => {
      state.isParentUser = action.payload;
    },
    setIsParentEnabled: (state, action) => {
      state.parentEnabled = action.payload;
    },
    setSyncFlagState: (state, action) => {
      state.syncFlag = action.payload;
    },
    setAccessControlData: (state, action) => {
      state.accessControl = action.payload;
    },
    setMenuOrderData: (state, action) => {
      state.menuOrder = action.payload;
    },
    setLastExecTimeStamp: (state, action) => {
      state.lastExecutionTime = action.payload;
    },
    setShopCheckedIn: (state, action) => {
      state.isShopCheckedIn = action.payload;
    },
    setMeetingEnded: (state, action) => {
      state.isMeetingEnded = action.payload;
    },
    setStartTime: (state, action) => {
      state.persistedStartTime = action.payload;
    },
    setBlockedShop: (state, action) => {
      state.blockedShopName = action.payload;
    },
    setSelectedAreaId: (state, action) => {
      state.selectedAreaId = action.payload;
    },
    setSyncRefersh: (state, action) => {
      state.syncRefresh = action.payload;
    },
    setIsSplashShowned: (state, action) => {
      state.isSplashShown = action.payload;
    },
    setGeofenceSettings: (state, action) => {
      state.globalGeofenceSettings = action.payload;
    },
    setIsLogEnabled: (state, action) => {
      state.isLogWritingEnabled = action.payload;
    },
    setAllowBackdatedDispatchDays: (state, action) => {
      state.AllowBackdatedDispatchDays = action.payload;
    },
    setMeetingEndBlocker: (state, action) => {
      state.meetingEndBlocker = action.payload;
    },
    resetMeetingValidation: state => {
      state.meetingEndBlocker = INITIAL_STATE.meetingEndBlocker;
    },
    setIsPDCandUnallocatedEnabled: (state, action) => {
      state.isPDC_Unallocated_Enabled = action.payload;
    },
    setIsOnNavWipeDataPOD: (state, action) => {
      state.onNavWipeDataPOD = action.payload;
    },
    setAccessControlSettingsReducer: (state, action) => {
      state.accessControlSettings = action.payload;
    },

    setIsSyncImmediateReducer: (state, action) => {
      state.isSyncImmediate = action.payload;
    },

    setIsNavigationSourceShopsReducer: (state, action) => {
      state.navigationSourceShops = action.payload;
    },
    setisWhatsAppOrderPostDocumentReducer: (state, action) => {
      state.isWhatsAppOrderPostDocument = action.payload;
    },
    setAttendanceOptions: (state, action) => {
      state.AttendanceOptions = action.payload;
    },

    setExternalShare: (state, action) => {
      state.externalShare = action.payload;
    },

    setOrderConfirmationSignature: (state, action) => {
      state.OrderConfirmationSignature = action.payload;
    },
  },
});

// destructure actions and reducer from the slice (or you can access as globalSlice.actions)
const {actions, reducer} = globalSlice;

// export individual action creator functions
export const {
  setIsLoggedIn,
  setIsDarkMode,
  setIsMultiDivision,
  setIsParentUser,
  setIsParentEnabled,
  setSyncFlagState,
  setAccessControlData,
  setMenuOrderData,
  setLastExecTimeStamp,
  setShopCheckedIn,
  setMeetingEnded,
  setStartTime,
  setBlockedShop,
  setSelectedAreaId,
  setSyncRefersh,
  setIsSplashShowned,
  setGeofenceSettings,
  setIsLogEnabled,
  setAllowBackdatedDispatchDays,
  setMeetingEndBlocker,
  resetMeetingValidation,
  setIsPDCandUnallocatedEnabled,
  setIsOnNavWipeDataPOD,
  setAccessControlSettingsReducer,
  setIsSyncImmediateReducer,
  setIsNavigationSourceShopsReducer,
  setisWhatsAppOrderPostDocumentReducer,
  setAttendanceOptions,
  setExternalShare,
  setOrderConfirmationSignature,
} = actions;

export default reducer;
