import {createSlice} from '@reduxjs/toolkit';
import {reducerName} from '../../constants/reduxConstants';

// Web location types (adapted from React Native)
export interface WebLocation {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: number;
}

type INITIALSTATE = {
  isBGLocationGranted: boolean;
  isLocationGranted: boolean;
  globalLocation: WebLocation | GeolocationPosition | null;
};

const INITIAL_STATE: INITIALSTATE = {
  isLocationGranted: false, // Start as false, will be set when permission granted
  globalLocation: null,
  isBGLocationGranted: false, // Background location not available on web
};

const locationSlice = createSlice({
  name: reducerName.LOCATION_REDUCER,
  initialState: INITIAL_STATE,
  reducers: {
    setIsLocationGrant: (state, action) => {
      state.isLocationGranted = action.payload;
    },
    setGlobalLocationUser: (state, action) => {
      state.globalLocation = action.payload;
    },
    setIsBGLocGranted: (state, action) => {
      state.isBGLocationGranted = action.payload;
    },
  },
});

// destructure actions and reducer from the slice (or you can access as globalSlice.actions)
const {actions, reducer} = locationSlice;

// export individual action creator functions
export const {setIsLocationGrant, setGlobalLocationUser, setIsBGLocGranted} =
  actions;

export default reducer;
