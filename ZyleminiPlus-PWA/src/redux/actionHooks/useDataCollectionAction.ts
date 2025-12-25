import {useDispatch} from 'react-redux';
import {
  resetDataCollections,
  setCollectionType,
  setDataCollFromDate,
  setDataCollToDate,
} from '../reducers/dataCollectionReducers';
import {useAppSelector} from '../store';

type Function = {
  resetAllDataCollection: () => void;
  dataCollectionType: string;
  setSelectedCollectionType: (val: string) => void;
  fromDateDC: string;
  setFromDateDC: (val: string) => void;
  toDateDC: string;
  setToDateDC: (val: string) => void;
};

export const useDataCollectionAction = (): Function => {
  const dispatch = useDispatch();

  const setSelectedCollectionType = (payload: string) => {
    dispatch(setCollectionType(payload));
  };
  const setFromDateDC = (payload: string) => {
    dispatch(setDataCollFromDate(payload));
  };
  const setToDateDC = (payload: string) => {
    dispatch(setDataCollToDate(payload));
  };

  const resetAllDataCollection = () => {
    dispatch(resetDataCollections());
  };

  const dataCollectionType = useAppSelector(
    state => state.dataCollectionReducers.dataCollectionType,
  );
  const fromDateDC = useAppSelector(
    state => state.dataCollectionReducers.fromDateDC,
  );
  const toDateDC = useAppSelector(
    state => state.dataCollectionReducers.toDateDC,
  );

  return {
    resetAllDataCollection,
    dataCollectionType,
    setSelectedCollectionType,
    fromDateDC,
    setFromDateDC,
    toDateDC,
    setToDateDC,
  };
};

