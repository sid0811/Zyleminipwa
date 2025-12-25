import {createSlice} from '@reduxjs/toolkit';
import {reducerName} from '../../constants/reduxConstants';

type INITIALSTATE = {
  CollectionStatus: any;
  CollectionVisible: any;
  MarketCalls: any;
  SalesTrend: any;
  Target: any;
  UserDetails: any;
  // Modal
  AttendActivity: string;
  SelectedArea: string;
  SelectedDivison: any;
  AttendanceIn: boolean;
  AttendanceOut: boolean;
  base64String: any;
  ApiVersion: any;
  AppVersion: any;
  cachedTeamSummary: {
    data: any[];
    timestamp: string;
    isTeamReport: boolean;
    date: string;
  } | null;
};

const INITIAL_STATE: INITIALSTATE = {
  CollectionStatus: [],
  CollectionVisible: [],
  MarketCalls: [],
  SalesTrend: [],
  Target: [],
  UserDetails: [],
  //
  AttendActivity: '',
  SelectedArea: '',
  SelectedDivison: [],
  AttendanceIn: false,
  AttendanceOut: false,
  base64String: '',
  ApiVersion: '',
  AppVersion: '',
  cachedTeamSummary: null,
};

const dashboardSlice = createSlice({
  name: reducerName.DASH_REDUCER,
  initialState: INITIAL_STATE,
  reducers: {
    // Graphs
    setCollection: (state, action) => {
      state.CollectionStatus = action.payload;
    },
    setShowCollection: (state, action) => {
      state.CollectionVisible = action.payload;
    },
    setMarketdata: (state, action) => {
      state.MarketCalls = action.payload;
    },
    setSalesData: (state, action) => {
      state.SalesTrend = action.payload;
    },
    setTargetData: (state, action) => {
      state.Target = action.payload;
    },
    setUserDetail: (state, action) => {
      state.UserDetails = action.payload;
    },
    // Modal
    setAttendActivity: (state, action) => {
      state.AttendActivity = action.payload;
    },
    setSelectedArea: (state, action) => {
      state.SelectedArea = action.payload;
    },
    setDivisionSelected: (state, action) => {
      state.SelectedDivison = action.payload;
    },
    setAttendanceDone: (state, action) => {
      state.AttendanceIn = action.payload;
    },
    setAttendanceOut: (state, action) => {
      state.AttendanceOut = action.payload;
    },
    setBase64String: (state, action) => {
      state.base64String = action.payload;
    },

    setApiVersion: (state, action) => {
      state.ApiVersion = action.payload;
    },

    setAppVersion: (state, action) => {
      state.AppVersion = action.payload;
    },
    setCachedTeamSummary: (state, action) => {
      state.cachedTeamSummary = action.payload;
    },
  },
});

// destructure actions and reducer from the slice (or you can access as dashboardSlice.actions)
const {actions, reducer} = dashboardSlice;

// export individual action creator functions
export const {
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
} = actions;

export default reducer;
