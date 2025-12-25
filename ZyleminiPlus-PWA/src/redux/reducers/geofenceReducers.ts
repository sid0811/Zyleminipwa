import {createSlice} from '@reduxjs/toolkit';
import {reducerName} from '../../constants/reduxConstants';
import { OutletGeofence } from '../../types/types';

type INITIALSTATE = {
  geofenceEvents: any;
  oneTimeGeofenceCaptureCtaClicked: Boolean;
};

const INITIAL_STATE: INITIALSTATE = {
  geofenceEvents: [],
  oneTimeGeofenceCaptureCtaClicked: false
};

const geofenceSlice = createSlice({
  name: reducerName.GEOFENCE_REDUCER,
  initialState: INITIAL_STATE,
  reducers: {
    setGeofenceEventsReducer: (state, action) => {
      //console.log("setGeofenceEventsReducer payload--->",state.geofenceEvents.includes(action.payload))
      if (!state.geofenceEvents.includes(action.payload)) {
        state.geofenceEvents.push(action.payload);
        //state.flag = !state.flag
      }
    },
    setRemoveExitedGeofence: (state, action) => {
      //console.log("setRemoveExitedGeofence raj payload1--->", state.geofenceEvents)

      // console.log("setRemoveExitedGeofence raj payload2--->", state.geofenceEvents.filter(
      //   (str: OutletGeofence) => str.id !== action.payload.id 
      // ));
      state.geofenceEvents = state.geofenceEvents.filter(
        (str: OutletGeofence) => str.id !== action.payload.id 
      );
    },
    setOneTimeGeofenceCaptureCtaClicked: (state, action) =>{
      state.oneTimeGeofenceCaptureCtaClicked = action.payload
    },
    setGeofenceEventsReducerToEmpty: (state) =>{
      state.geofenceEvents = []
    }
  },
});

// destructure actions and reducer from the slice (or you can access as geofenceSlice.actions)
const {actions, reducer} = geofenceSlice;

// export individual action creator functions
export const {
  setGeofenceEventsReducer,
  setRemoveExitedGeofence,
  setOneTimeGeofenceCaptureCtaClicked,
  setGeofenceEventsReducerToEmpty,
} = actions;

export default reducer;
