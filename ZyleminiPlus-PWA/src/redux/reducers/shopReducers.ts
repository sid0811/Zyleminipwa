import {createSlice} from '@reduxjs/toolkit';
import {reducerName} from '../../constants/reduxConstants';

type INITIALSTATE = {
  selectedShopData: any;
  isNavigatedFromShop:boolean;
};

const INITIAL_STATE: INITIALSTATE = {
  selectedShopData: [],
  isNavigatedFromShop:false
};

const shopSlice = createSlice({
  name: reducerName.SHOP_REDUCER,
  initialState: INITIAL_STATE,
  reducers: {
    setShopsData: (state, action) => {
      state.selectedShopData = action.payload;
    },
    setIsNavigatedFromShop: (state, action) => {
      state.isNavigatedFromShop = action.payload;
    },
  },
});

// destructure actions and reducer from the slice (or you can access as globalSlice.actions)
const {actions, reducer} = shopSlice;

// export individual action creator functions
export const {setShopsData,setIsNavigatedFromShop} = actions;

export default reducer;
