import {useDispatch} from 'react-redux';
import {setShopsData,setIsNavigatedFromShop} from '../reducers/shopReducers';
import {useAppSelector} from '../store';

type Function = {
  setSelectedShopData: any;
  selectedShopData: any;
  setIsNavigatedFromShops:(val:boolean)=>void
  isNavigatedFromShops:boolean;
};

export const useShopAction = (): Function => {
  const dispatch = useDispatch();

  const setSelectedShopData = (payload: any) => {
    dispatch(setShopsData(payload));
  };

  const setIsNavigatedFromShops = (payload: any) => {
    dispatch(setIsNavigatedFromShop(payload));
  };

  const selectedShopData = useAppSelector(
    state => state.shopReducer.selectedShopData,
  );

  const isNavigatedFromShops = useAppSelector(
    state => state.shopReducer.isNavigatedFromShop,
  );

  return {selectedShopData, setSelectedShopData,setIsNavigatedFromShops,isNavigatedFromShops};
};

