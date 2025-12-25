import {useDispatch} from 'react-redux';
import {
  setCollection,
  setShowCollection,
  setMarketdata,
  setSalesData,
  setTargetData,
  setUserDetail,
  setAttendActivity,
  setSelectedArea,
  setDivisionSelected,
  setAttendanceDone,
  setAttendanceOut,
  setBase64String,
  setApiVersion,
  setAppVersion,
  setCachedTeamSummary,
} from '../reducers/dashboardReducers';
import {useAppSelector} from '../store';

type Function = {
  setIsCollectionVisible?: any;
  setCollectionData?: any;
  setMarketCallData?: any;
  setSalesTrend?: any;
  setTargetCalls?: any;
  setUserDetails?: any;
  CollectionStatus: any;
  CollectionVisible: any;
  MarketCalls: any;
  SalesTrend: any;
  Target: any;
  UserDetails: any;
  //
  setAttendanceActivity: any;
  setSelectedAreaDash: any;
  AttendActivity: any;
  SelectedArea: any;
  setSelectedDivision: any;
  SelectedDivison: any;
  AttendanceIn: boolean;
  setIsAttDone: (data: boolean) => void;
  AttendanceOut: boolean;
  setIsAttendOut: (data: boolean) => void;
  setBase64Strings: any;
  base64: any;
  ConsentApiVersion: any;
  setConsentApiVersion: any;
  ConsentAppVersion: any;
  setConsentAppVersion: any;
  cachedTeamSummary: {
    data: any[];
    timestamp: string;
    isTeamReport: boolean;
    date: string;
  } | null;
  setCachedTeamSummaryData: (data: any) => void;
};

export const useDashAction = (): Function => {
  const dispatch = useDispatch();

  const setCollectionData = (payload: any) => {
    dispatch(setCollection(payload));
  };

  const setIsCollectionVisible = (payload: any) => {
    dispatch(setShowCollection(payload));
  };

  const setMarketCallData = (payload: any) => {
    dispatch(setMarketdata(payload));
  };
  const setSalesTrend = (payload: any) => {
    dispatch(setSalesData(payload));
  };
  const setTargetCalls = (payload: any) => {
    dispatch(setTargetData(payload));
  };
  const setUserDetails = (payload: any) => {
    dispatch(setUserDetail(payload));
  };

  // Modal
  const setAttendanceActivity = (payload: string) => {
    dispatch(setAttendActivity(payload));
  };
  const setSelectedAreaDash = (payload: number | string) => {
    dispatch(setSelectedArea(payload));
  };
  const setSelectedDivision = (payload: string) => {
    dispatch(setDivisionSelected(payload));
  };
  const setIsAttDone = (payload: boolean) => {
    dispatch(setAttendanceDone(payload));
  };
  const setIsAttendOut = (payload: boolean) => {
    dispatch(setAttendanceOut(payload));
  };

  const setBase64Strings = (payload: boolean) => {
    dispatch(setBase64String(payload));
  };

  const setConsentApiVersion = (payload: boolean) => {
    dispatch(setApiVersion(payload));
  };

  const setConsentAppVersion = (payload: boolean) => {
    dispatch(setAppVersion(payload));
  };
  const setCachedTeamSummaryData = (payload: any) => {
    dispatch(setCachedTeamSummary(payload));
  };

  const CollectionStatus = useAppSelector(
    state => state.dashReducer.CollectionStatus,
  );
  const CollectionVisible = useAppSelector(
    state => state.dashReducer.CollectionVisible,
  );
  const MarketCalls = useAppSelector(state => state.dashReducer.MarketCalls);
  const SalesTrend = useAppSelector(state => state.dashReducer.SalesTrend);
  const Target = useAppSelector(state => state.dashReducer.Target);
  const UserDetails = useAppSelector(state => state.dashReducer.UserDetails);
  //
  const AttendActivity = useAppSelector(
    state => state.dashReducer.AttendActivity,
  );
  const SelectedArea = useAppSelector(state => state.dashReducer.SelectedArea);
  const SelectedDivison = useAppSelector(
    state => state.dashReducer.SelectedDivison,
  );
  const AttendanceIn = useAppSelector(state => state.dashReducer.AttendanceIn);
  const AttendanceOut = useAppSelector(
    state => state.dashReducer.AttendanceOut,
  );

  const base64 = useAppSelector(state => state.dashReducer.base64String);
  const ConsentApiVersion = useAppSelector(
    state => state.dashReducer.ApiVersion,
  );
  const ConsentAppVersion = useAppSelector(
    state => state.dashReducer.AppVersion,
  );

  const cachedTeamSummary = useAppSelector(
    state => state.dashReducer.cachedTeamSummary,
  );
  return {
    CollectionStatus,
    setCollectionData,
    CollectionVisible,
    setIsCollectionVisible,
    MarketCalls,
    setMarketCallData,
    SalesTrend,
    setSalesTrend,
    Target,
    setTargetCalls,
    UserDetails,
    setUserDetails,
    AttendActivity,
    setAttendanceActivity,
    SelectedArea,
    setSelectedAreaDash,
    SelectedDivison,
    setSelectedDivision,
    AttendanceIn,
    setIsAttDone,
    AttendanceOut,
    setIsAttendOut,
    setBase64Strings,
    base64,
    cachedTeamSummary,
    setCachedTeamSummaryData,
    setConsentApiVersion,
    setConsentAppVersion,
    ConsentApiVersion,
    ConsentAppVersion,
  };
};

