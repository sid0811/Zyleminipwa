import {createSlice} from '@reduxjs/toolkit';
import {reducerName} from '../../constants/reduxConstants';
import moment from 'moment';

type INITIALSTATE = {
  dataCollectionType: string;
  fromDateDC: string;
  toDateDC: string;
};

const INITIAL_STATE: INITIALSTATE = {
  dataCollectionType: '1',
  fromDateDC: moment().format('DD-MMM-YYYY'),
  toDateDC: moment().format('DD-MMM-YYYY'),
};

const DataCollectionSlice = createSlice({
  name: reducerName.DATA_COLLECTION_REDUCER,
  initialState: INITIAL_STATE,
  reducers: {
    setCollectionType: (state, action) => {
      state.dataCollectionType = action.payload;
    },

    setDataCollFromDate: (state, action) => {
      state.fromDateDC = action.payload;
    },
    setDataCollToDate: (state, action) => {
      state.toDateDC = action.payload;
    },

    resetDataCollections: state => {
      state.dataCollectionType = '1';
      state.fromDateDC = moment().format('DD-MMM-YYYY');
      state.toDateDC = moment().format('DD-MMM-YYYY');
    },
  },
});

// destructure actions and reducer from the slice (or you can access as orderSlice.actions)
const {actions, reducer} = DataCollectionSlice;

// export individual action creator functions
export const {
  setCollectionType,
  setDataCollFromDate,
  setDataCollToDate,
  resetDataCollections,
} = actions;

export default reducer;
