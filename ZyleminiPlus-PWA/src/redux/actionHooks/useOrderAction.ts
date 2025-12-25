import {useDispatch} from 'react-redux';
import {
  setEntiType,
  setOrderValue,
  setSavedAppOrderID,
  setSelectBeat,
  setSelectDist,
  setSelectOutlet,
  setStartsTime,
  resetOrder,
  setIsDataColl,
  setOrdDate,
  setExpectOrdDate,
  togglePressCardIndex,
  setAddSelectBrandID,
  setRemoveSelectBrandID,
  setAddSelectItemID,
  setRemoveSelectItemID,
  setIncrementOrderValue,
  setDecrementOrderValue,
  setPropsDataState,
  setSidePropsDataState,
  setDataCollectionProps,
  setToggleItemList,
} from '../reducers/orderReducers';
import {useAppSelector} from '../store';

type Function = {
  setEntityType?: any;
  setSelectedBeat?: any;
  setSelectedDist?: any;
  setSelectedOutlet?: any;
  setSavedStartTime?: any;
  setSavedOrderId: any;
  setTotalOrderVal: (value: number) => void;
  setIsDataCollection: (value: boolean) => void;
  setOrderDate: (value: string) => void;
  setExpectedOrderDate: (value: string) => void;
  togglePressedCardIndex: (value: number) => void;
  setAddSelectedBrandID: (value: string) => void;
  setRemoveSelectedBrandID: (value: string) => void;
  setAddSelectededItemID: (value: string) => void;
  setRemoveSelectedItemID: (value: string) => void;
  IncrementOrderValue: () => void;
  DecrementOrderValue: () => void;
  setPropsData: any;
  setSidePropsData: any;
  resetAllOrder: () => void;
  entityType: any;
  selectedBeat: any;
  selectedDist: any;
  selectedOutlet: any;
  startTime: string;
  savedOrderID: string;
  totalOrderValue: number;
  pressedCardIndex: number | null;
  isDataCollection: boolean;
  orderDate: string;
  expectedOrderDate: string;
  selectedBrandID: string[];
  selectedItemID: string[];
  openItemsList: number[];
  propsData: any;
  sideOrderProps: any;
  dataCollectionProps: any;
  setDataCollectionPropsData: any;
  setToggleItemListCNO2: (val: number) => void;
};

export const useOrderAction = (): Function => {
  const dispatch = useDispatch();

  const setEntityType = (payload: string) => {
    dispatch(setEntiType(payload));
  };

  const setSelectedBeat = (payload: string) => {
    dispatch(setSelectBeat(payload));
  };

  const setSelectedDist = (payload: string) => {
    dispatch(setSelectDist(payload));
  };
  const setSelectedOutlet = (payload: string) => {
    dispatch(setSelectOutlet(payload));
  };
  const setSavedStartTime = (payload: string) => {
    dispatch(setStartsTime(payload));
  };
  const setSavedOrderId = (payload: string) => {
    dispatch(setSavedAppOrderID(payload));
  };
  const setTotalOrderVal = (payload: number) => {
    dispatch(setOrderValue(payload));
  };

  const setTotalOrderValIncrement = (payload: number) => {
    dispatch(setOrderValue(payload));
  };
  const setIsDataCollection = (payload: boolean) => {
    dispatch(setIsDataColl(payload));
  };
  const setOrderDate = (payload: string) => {
    dispatch(setOrdDate(payload));
  };
  const setExpectedOrderDate = (payload: string) => {
    dispatch(setExpectOrdDate(payload));
  };

  const togglePressedCardIndex = (payload: number) => {
    dispatch(togglePressCardIndex(payload));
  };

  const setAddSelectedBrandID = (payload: string) => {
    dispatch(setAddSelectBrandID(payload));
  };

  const setRemoveSelectedBrandID = (payload: string) => {
    dispatch(setRemoveSelectBrandID(payload));
  };

  const setAddSelectededItemID = (payload: string) => {
    dispatch(setAddSelectItemID(payload));
  };

  const setRemoveSelectedItemID = (payload: string) => {
    dispatch(setRemoveSelectItemID(payload));
  };

  const IncrementOrderValue = () => {
    dispatch(setIncrementOrderValue());
  };

  const DecrementOrderValue = () => {
    dispatch(setDecrementOrderValue());
  };

  const setPropsData = (payload: any) => {
    dispatch(setPropsDataState(payload));
  };
  const setSidePropsData = (payload: any) => {
    dispatch(setSidePropsDataState(payload));
  };
  const setDataCollectionPropsData = (payload: any) => {
    dispatch(setDataCollectionProps(payload));
  };
  const setToggleItemListCNO2 = (payload: number) => {
    dispatch(setToggleItemList(payload));
  };

  const resetAllOrder = () => {
    dispatch(resetOrder());
  };

  const entityType = useAppSelector(state => state.orderReducer.entityType);
  const selectedBeat = useAppSelector(state => state.orderReducer.selectedBeat);
  const selectedDist = useAppSelector(state => state.orderReducer.selectedDist);
  const selectedOutlet = useAppSelector(
    state => state.orderReducer.selectedOutlet,
  );
  const startTime = useAppSelector(state => state.orderReducer.startTime);
  const savedOrderID = useAppSelector(state => state.orderReducer.savedOrderID);
  const isDataCollection = useAppSelector(
    state => state.orderReducer.isDataCollection,
  );
  const orderDate = useAppSelector(state => state.orderReducer.orderDate);
  const expectedOrderDate = useAppSelector(
    state => state.orderReducer.expectedOrderDate,
  );
  const totalOrderValue = useAppSelector(
    state => state.orderReducer.totalOrderValue,
  );
  const pressedCardIndex = useAppSelector(
    state => state.orderReducer.pressedCardIndex,
  );

  const selectedBrandID = useAppSelector(
    state => state.orderReducer.selectedBrandID,
  );
  const selectedItemID = useAppSelector(
    state => state.orderReducer.selectedItemID,
  );
  const propsData = useAppSelector(state => state.orderReducer.propsData);
  const sideOrderProps = useAppSelector(
    state => state.orderReducer.sideOrderProps,
  );
  const dataCollectionProps = useAppSelector(
    state => state.orderReducer.dataCollectionProps,
  );
  const openItemsList = useAppSelector(
    state => state.orderReducer.openItemsList,
  );

  return {
    entityType,
    setEntityType,
    selectedBeat,
    setSelectedBeat,
    selectedDist,
    setSelectedDist,
    selectedOutlet,
    setSelectedOutlet,
    startTime,
    setSavedStartTime,
    savedOrderID,
    setSavedOrderId,
    totalOrderValue,
    setTotalOrderVal,
    IncrementOrderValue,
    DecrementOrderValue,
    isDataCollection,
    setIsDataCollection,
    orderDate,
    setOrderDate,
    expectedOrderDate,
    setExpectedOrderDate,
    pressedCardIndex,
    togglePressedCardIndex,
    selectedBrandID,
    setAddSelectedBrandID,
    setRemoveSelectedBrandID,
    selectedItemID,
    setAddSelectededItemID,
    setRemoveSelectedItemID,
    propsData,
    setPropsData,
    sideOrderProps,
    setSidePropsData,
    dataCollectionProps,
    setDataCollectionPropsData,
    openItemsList,
    setToggleItemListCNO2,
    resetAllOrder,
  };
};

