import {createSlice} from '@reduxjs/toolkit';
import {reducerName} from '../../constants/reduxConstants';

type INITIALSTATE = {
  enteredUserName: string;
  userPassword: string;
  savedClientCode: string;
  clientBaseURL: string;
  loginLoading: boolean;
  //
  userName: string;
  userId: string;
  deviceId: string;
  areaId: string;
  token: any;
  savedApiVersion: string;
  savedAppendApiVersion: string;
};

const INITIAL_STATE: INITIALSTATE = {
  enteredUserName: '',
  userPassword: '',
  savedClientCode: '',
  clientBaseURL: '',
  loginLoading: false,
  //
  userName: '',
  userId: '',
  deviceId: '',
  areaId: '',
  token: {},
  savedApiVersion: '',
  savedAppendApiVersion: '',
};

const loginSlice = createSlice({
  name: reducerName.LOGIN_REDUCER,
  initialState: INITIAL_STATE,
  reducers: {
    setEnteredUName: (state, action) => {
      state.enteredUserName = action.payload;
    },
    setUserPassword: (state, action) => {
      state.userPassword = action.payload;
    },
    setClientCode: (state, action) => {
      state.savedClientCode = action.payload;
    },
    setClientBaseURL: (state, action) => {
      state.clientBaseURL = action.payload;
    },
    setLoginLoading: (state, action) => {
      state.loginLoading = action.payload;
    },

    // API Response
    setUName: (state, action) => {
      state.userName = action.payload;
    },
    setDevId: (state, action) => {
      state.deviceId = action.payload;
    },
    setUId: (state, action) => {
      state.userId = action.payload;
    },
    setAreaaId: (state, action) => {
      state.areaId = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },

    //#region --------------API VERSION ------------
    setSavedApiVersion: (state, action) => {
      state.savedApiVersion = action.payload;
    },
    setSavedAppendedApiVersion: (state, action) => {
      state.savedAppendApiVersion = action.payload;
    },
    //#endregion
  },
});

// destructure actions and reducer from the slice (or you can access as globalSlice.actions)
const {actions, reducer} = loginSlice;

// export individual action creator functions
export const {
  setEnteredUName,
  setUserPassword,
  setClientCode,
  setClientBaseURL,
  setLoginLoading,
  //
  setUName,
  setUId,
  setDevId,
  setAreaaId,
  setToken,
  setSavedApiVersion,
  setSavedAppendedApiVersion,
} = actions;

export default reducer;
