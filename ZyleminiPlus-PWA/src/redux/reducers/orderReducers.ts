import {createSlice} from '@reduxjs/toolkit';
import {reducerName} from '../../constants/reduxConstants';
import moment from 'moment';

type INITIALSTATE = {
  entityType: any;
  selectedBeat: any;
  selectedOutlet: any;
  selectedDist: any;
  startTime: string;
  savedOrderID: string;
  totalOrderValue: number;
  isDataCollection: boolean;
  orderDate: string;
  expectedOrderDate: string;
  pressedCardIndex: number | null;
  selectedBrandID: string[];
  selectedItemID: string[];
  propsData: {isFromShop: boolean; shopId: string} | undefined;
  sideOrderProps: any;
  dataCollectionProps: any;
  openItemsList: number[];
};

const INITIAL_STATE: INITIALSTATE = {
  entityType: {},
  selectedBeat: {},
  selectedOutlet: {},
  selectedDist: {},
  startTime: '',
  savedOrderID: '',
  totalOrderValue: 0,
  isDataCollection: false,
  orderDate: moment().format('DD-MMM-YYYY'),
  expectedOrderDate: moment().format('DD-MMM-YYYY'),
  pressedCardIndex: null,
  selectedBrandID: [],
  selectedItemID: [],
  propsData: undefined,
  sideOrderProps: undefined,
  dataCollectionProps: undefined,
  openItemsList: [],
};

const orderSlice = createSlice({
  name: reducerName.ORDER_REDUCER,
  initialState: INITIAL_STATE,
  reducers: {
    setEntiType: (state, action) => {
      state.entityType = action.payload;
    },
    setSelectBeat: (state, action) => {
      state.selectedBeat = action.payload;
    },
    setSelectOutlet: (state, action) => {
      state.selectedOutlet = action.payload;
    },
    setSelectDist: (state, action) => {
      state.selectedDist = action.payload;
    },
    setStartsTime: (state, action) => {
      state.startTime = action.payload;
    },
    setSavedAppOrderID: (state, action) => {
      state.savedOrderID = action.payload;
    },
    setOrderValue: (state, action) => {
      state.totalOrderValue = action.payload;
    },

    setIncrementOrderValue: state => {
      state.totalOrderValue++;
    },
    setDecrementOrderValue: state => {
      state.totalOrderValue--;
    },

    setIsDataColl: (state, action) => {
      state.isDataCollection = action.payload;
    },
    setOrdDate: (state, action) => {
      state.orderDate = action.payload;
    },
    setExpectOrdDate: (state, action) => {
      state.expectedOrderDate = action.payload;
    },
    setPressCardIndex: (state, action) => {
      state.pressedCardIndex = action.payload;
    },
    togglePressCardIndex: (state, action) => {
      state.pressedCardIndex =
        state.pressedCardIndex === action.payload ? null : action.payload;
    },

    setAddSelectBrandID: (state, action) => {
      if (!state.selectedBrandID.includes(action.payload)) {
        state.selectedBrandID.push(action.payload);
      }
    },

    setRemoveSelectBrandID: (state, action) => {
      state.selectedBrandID = state.selectedBrandID.filter(
        str => str !== action.payload,
      );
    },

    setAddSelectItemID: (state, action) => {
      if (!state.selectedItemID.includes(action.payload)) {
        state.selectedItemID.push(action.payload);
      }
    },

    setRemoveSelectItemID: (state, action) => {
      state.selectedItemID = state.selectedItemID.filter(
        str => str !== action.payload,
      );
    },

    setPropsDataState: (state, action) => {
      state.propsData = action.payload;
    },

    setSidePropsDataState: (state, action) => {
      state.sideOrderProps = action.payload;
    },
    setDataCollectionProps: (state, action) => {
      state.dataCollectionProps = action.payload;
    },

    setToggleItemList: (state, action) => {
      if (state.openItemsList.includes(action.payload)) {
        state.openItemsList = state.openItemsList.filter(
          itemIndex => itemIndex !== action.payload,
        );
      } else {
        state.openItemsList.push(action.payload);
      }
    },

    resetOrder: state => {
      state.entityType = {};
      state.selectedBeat = {};
      state.selectedDist = {};
      state.selectedOutlet = {};
      state.savedOrderID = '';
      state.startTime = '';
      state.orderDate = moment().format('DD-MMM-YYYY');
      state.expectedOrderDate = moment().format('DD-MMM-YYYY');
      state.totalOrderValue = 0;
      state.isDataCollection = false;
      state.pressedCardIndex = null;
      state.selectedBrandID = [];
      state.selectedItemID = [];
      state.openItemsList = [];
      // state.propsData = undefined;
    },
  },
});

// destructure actions and reducer from the slice (or you can access as orderSlice.actions)
const {actions, reducer} = orderSlice;

// export individual action creator functions
export const {
  setEntiType,
  setSelectBeat,
  setSelectOutlet,
  setSelectDist,
  setStartsTime,
  setSavedAppOrderID,
  setOrderValue,
  setIncrementOrderValue,
  setDecrementOrderValue,
  resetOrder,
  setIsDataColl,
  setOrdDate,
  setExpectOrdDate,
  setPressCardIndex,
  togglePressCardIndex,
  setAddSelectBrandID,
  setRemoveSelectBrandID,
  setAddSelectItemID,
  setRemoveSelectItemID,
  setPropsDataState,
  setSidePropsDataState,
  setDataCollectionProps,
  setToggleItemList,
} = actions;

export default reducer;
