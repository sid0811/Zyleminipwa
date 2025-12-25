import {useDispatch} from 'react-redux';
import {
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
} from '../reducers/globalReducers';
import {useAppSelector} from '../store';
import {GeofenceSettings, MeetingEndBlockValidation} from '../../types/types';

type Function = {
  setIsLogin?: any;
  setDarkMode?: any;
  setMultiDivision?: any;
  setParentUser?: any;
  setParentEnabled?: any;
  setSyncFlag?: any;
  setAccessControl?: any;
  setMenuOrder?: any;
  setLastExecTime?: any;
  isLoggedin?: boolean;
  isDarkMode?: boolean;
  isMultiDivision?: boolean;
  isParentUser?: boolean;
  parentEnabled?: boolean;
  syncFlag?: boolean;
  accessControl?: any;
  menuOrder?: any;
  lastExecutionTime?: any;
  isShopCheckedIn: boolean;
  setIsShopCheckIn?: any;
  isMeetingEnded?: boolean;
  setIsMeetingEnded?: any;
  persistedStartTime?: string;
  selectedAreaId?: string;
  setPersistStartTime?: any;
  setSelectedAreaID?: any;
  syncRefresh?: boolean;
  setIsSyncRefersh?: (val: boolean) => void;
  blockedShopName?: any;
  setBlockedShopDetail?: any;
  isSplashShown?: boolean;
  setIsSplashShown?: (val: boolean) => void;
  geofenceGlobalSettingsAction?: GeofenceSettings;
  setGeofenceGlobalSettingsAction?: (val: GeofenceSettings) => void;
  setLogWritingEnabled?: (val: boolean) => void;
  isLogWritingEnabled?: boolean;
  AllowBackdatedDispatchDays?: string;
  setAllowedBackdateDispatchDays: (val: string) => void;
  meetingEndBlocker: MeetingEndBlockValidation;
  setMeetingEndBlockerVal: (val: MeetingEndBlockValidation) => void;
  resetMeetingValidations: () => void;
  isPDC_Unallocated_Enabled: boolean;
  setIsPDCandUnallocatedEnable?: any;
  onNavWipeDataPOD: boolean;
  setIsOnNavWipePODData: (val: boolean) => void;
  setAccessControlSettingsAction: (val: string[]) => void;
  getAccessControlSettings: string[];
  setIsSyncImmediateAction: (val: boolean) => void;
  isSyncImmediate: boolean;
  setIsNavigationSourceShopsAction: (val: boolean) => void;
  isNavigationSourceShops: boolean;
  isWhatsAppOrderPostDocument: boolean;
  setisWhatsAppOrderPostDocumentAction: (val: boolean) => void;
  AttendanceOptions: {id: string; name: string}[];
  setAttendanceOptionsAction: (val: {id: string; name: string}[]) => void;
  externalShare: boolean;
  setExternalShare: (val: boolean) => void;
  OrderConfirmationSignature: boolean;
  setOrderConfirmationSignatureAction: (val: boolean) => void;
};

export const useGlobleAction = (): Function => {
  const dispatch = useDispatch();

  const setIsLogin = (payload: boolean) => {
    dispatch(setIsLoggedIn(payload));
  };

  const setDarkMode = (payload: boolean) => {
    dispatch(setIsDarkMode(payload));
  };
  const setMultiDivision = (payload: boolean) => {
    dispatch(setIsMultiDivision(payload));
  };
  const setParentUser = (payload: boolean) => {
    dispatch(setIsParentUser(payload));
  };
  const setParentEnabled = (payload: boolean) => {
    dispatch(setIsParentEnabled(payload));
  };
  const setSyncFlag = (payload: boolean) => {
    dispatch(setSyncFlagState(payload));
  };
  const setAccessControl = (payload: any) => {
    dispatch(setAccessControlData(payload));
  };
  const setMenuOrder = (payload: any) => {
    dispatch(setMenuOrderData(payload));
  };
  const setLastExecTime = (payload: string) => {
    dispatch(setLastExecTimeStamp(payload));
  };
  const setIsShopCheckIn = (payload: boolean) => {
    dispatch(setShopCheckedIn(payload));
  };
  const setIsMeetingEnded = (payload: boolean) => {
    dispatch(setMeetingEnded(payload));
  };
  const setPersistStartTime = (payload: string) => {
    dispatch(setStartTime(payload));
  };
  const setSelectedAreaID = (payload: string) => {
    dispatch(setSelectedAreaId(payload));
  };
  const setIsSyncRefersh = (payload: boolean) => {
    dispatch(setSyncRefersh(payload));
  };

  const setBlockedShopDetail = (payload: any) => {
    dispatch(setBlockedShop(payload));
  };

  const setIsSplashShown = (payload: boolean) => {
    dispatch(setIsSplashShowned(payload));
  };

  const setGeofenceGlobalSettingsAction = (payload: GeofenceSettings) => {
    dispatch(setGeofenceSettings(payload));
  };

  const setLogWritingEnabled = (payload: boolean) => {
    dispatch(setIsLogEnabled(payload));
  };
  const setAllowedBackdateDispatchDays = (payload: string) => {
    dispatch(setAllowBackdatedDispatchDays(payload));
  };
  const setMeetingEndBlockerVal = (payload: MeetingEndBlockValidation) => {
    dispatch(setMeetingEndBlocker(payload));
  };
  const resetMeetingValidations = () => {
    dispatch(resetMeetingValidation());
  };
  const setIsPDCandUnallocatedEnable = (payload: boolean) => {
    dispatch(setIsPDCandUnallocatedEnabled(payload));
  };
  const setIsOnNavWipePODData = (payload: boolean) => {
    dispatch(setIsOnNavWipeDataPOD(payload));
  };
  const setAccessControlSettingsAction = (payload: string[]) => {
    dispatch(setAccessControlSettingsReducer(payload));
  };

  const setIsSyncImmediateAction = (payload: boolean) => {
    dispatch(setIsSyncImmediateReducer(payload));
  };

  const setIsNavigationSourceShopsAction = (payload: boolean) => {
    dispatch(setIsNavigationSourceShopsReducer(payload));
  };

  const setisWhatsAppOrderPostDocumentAction = (payload: boolean) => {
    dispatch(setisWhatsAppOrderPostDocumentReducer(payload));
  };

  const setAttendanceOptionsAction = (
    payload: {id: string; name: string}[],
  ) => {
    dispatch(setAttendanceOptions(payload));
  };

  const setExternalShareAction = (payload: boolean) => {
    dispatch(setExternalShare(payload));
  };

  const setOrderConfirmationSignatureAction = (payload: boolean) => {
    dispatch(setOrderConfirmationSignature(payload));
  };

  const isLoggedin = useAppSelector(state => state.globalReducer.isLoggedin);
  const isDarkMode = useAppSelector(state => state.globalReducer.isDarkMode);
  const isMultiDivision = useAppSelector(
    state => state.globalReducer.isMultiDivision,
  );
  const isParentUser = useAppSelector(
    state => state.globalReducer.isParentUser,
  );
  const parentEnabled = useAppSelector(
    state => state.globalReducer.parentEnabled,
  );
  const syncFlag = useAppSelector(state => state.globalReducer.syncFlag);
  const accessControl = useAppSelector(
    state => state.globalReducer.accessControl,
  );
  const menuOrder = useAppSelector(state => state.globalReducer.menuOrder);
  const lastExecutionTime = useAppSelector(
    state => state.globalReducer.lastExecutionTime,
  );
  const isShopCheckedIn = useAppSelector(
    state => state.globalReducer.isShopCheckedIn,
  );
  const isMeetingEnded = useAppSelector(
    state => state.globalReducer.isMeetingEnded,
  );
  const persistedStartTime = useAppSelector(
    state => state.globalReducer.persistedStartTime,
  );
  const selectedAreaId = useAppSelector(
    state => state.globalReducer.selectedAreaId,
  );
  const syncRefresh = useAppSelector(state => state.globalReducer.syncRefresh);

  const blockedShopName = useAppSelector(
    state => state.globalReducer.blockedShopName,
  );
  const isSplashShown = useAppSelector(
    state => state.globalReducer.isSplashShown,
  );

  const geofenceGlobalSettingsAction = useAppSelector(
    state => state.globalReducer.globalGeofenceSettings,
  );

  const isLogWritingEnabled = useAppSelector(
    state => state.globalReducer.isLogWritingEnabled,
  );

  const AllowBackdatedDispatchDays = useAppSelector(
    state => state.globalReducer.AllowBackdatedDispatchDays,
  );

  const meetingEndBlocker = useAppSelector(
    state => state.globalReducer.meetingEndBlocker,
  );
  const isPDC_Unallocated_Enabled = useAppSelector(
    state => state.globalReducer.isPDC_Unallocated_Enabled,
  );
  const onNavWipeDataPOD = useAppSelector(
    state => state.globalReducer.onNavWipeDataPOD,
  );
  const getAccessControlSettings = useAppSelector(
    state => state.globalReducer.accessControlSettings,
  );

  const isSyncImmediate = useAppSelector(
    state => state.globalReducer.isSyncImmediate,
  );

  const isNavigationSourceShops = useAppSelector(
    state => state.globalReducer.navigationSourceShops,
  );

  const isWhatsAppOrderPostDocument = useAppSelector(
    state => state.globalReducer.isWhatsAppOrderPostDocument,
  );

  const AttendanceOptions = useAppSelector(
    state => state.globalReducer.AttendanceOptions,
  );

  const externalShare = useAppSelector(
    state => state.globalReducer.externalShare,
  );

  const OrderConfirmationSignature = useAppSelector(
    state => state.globalReducer.OrderConfirmationSignature,
  );

  return {
    isLoggedin,
    setIsLogin,
    isDarkMode,
    setDarkMode,
    isMultiDivision,
    setMultiDivision,
    isParentUser,
    setParentUser,
    parentEnabled,
    setParentEnabled,
    syncFlag,
    setSyncFlag,
    accessControl,
    setAccessControl,
    menuOrder,
    setMenuOrder,
    lastExecutionTime,
    setLastExecTime,
    isShopCheckedIn,
    setIsShopCheckIn,
    isMeetingEnded,
    setIsMeetingEnded,
    persistedStartTime,
    setPersistStartTime,
    selectedAreaId,
    setSelectedAreaID,
    syncRefresh,
    setIsSyncRefersh,
    blockedShopName,
    setBlockedShopDetail,
    isSplashShown,
    setIsSplashShown,
    geofenceGlobalSettingsAction,
    setGeofenceGlobalSettingsAction,
    isLogWritingEnabled,
    setLogWritingEnabled,
    AllowBackdatedDispatchDays,
    setAllowedBackdateDispatchDays,
    meetingEndBlocker,
    setMeetingEndBlockerVal,
    resetMeetingValidations,
    isPDC_Unallocated_Enabled,
    setIsPDCandUnallocatedEnable,
    onNavWipeDataPOD,
    setIsOnNavWipePODData,
    setAccessControlSettingsAction,
    getAccessControlSettings,
    setIsSyncImmediateAction,
    isSyncImmediate,
    setIsNavigationSourceShopsAction,
    isNavigationSourceShops,
    setisWhatsAppOrderPostDocumentAction,
    isWhatsAppOrderPostDocument,
    AttendanceOptions,
    setAttendanceOptionsAction,
    externalShare,
    setExternalShare: setExternalShareAction,
    OrderConfirmationSignature,
    setOrderConfirmationSignatureAction,
  };
};

export type GlobleAction = ReturnType<typeof useGlobleAction>;

