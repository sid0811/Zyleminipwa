import {useDispatch} from 'react-redux';
import {
  setGlobalLocationUser,
  setIsBGLocGranted,
  setIsLocationGrant,
} from '../reducers/locationReducers';
import {useAppSelector} from '../store';
import {WebLocation} from '../reducers/locationReducers';

type Function = {
  globalLocation?: WebLocation | GeolocationPosition | null;
  setGlobalLocation?: (val: WebLocation | GeolocationPosition) => void;
  isBGLocationGranted?: boolean;
  setIsBGLocationGranted?: (val: boolean) => void;
  isLocationGranted?: boolean;
  setIsLocationGranted?: any;
};

export const useLocationAction = (): Function => {
  const dispatch = useDispatch();
  const setGlobalLocation = (payload: WebLocation | GeolocationPosition) => {
    dispatch(setGlobalLocationUser(payload));
  };
  const setIsBGLocationGranted = (payload: boolean) => {
    dispatch(setIsBGLocGranted(payload));
  };
  const setIsLocationGranted = (payload: boolean) => {
    dispatch(setIsLocationGrant(payload));
  };

  const isLocationGranted = useAppSelector(
    state => state.locationReducer.isLocationGranted,
  );
  const globalLocation = useAppSelector(
    state => state.locationReducer.globalLocation,
  );
  const isBGLocationGranted = useAppSelector(
    state => state.locationReducer.isBGLocationGranted,
  );

  return {
    isLocationGranted,
    setIsLocationGranted,
    globalLocation,
    setGlobalLocation,
    isBGLocationGranted,
    setIsBGLocationGranted,
  };
};

export type LocationAction = ReturnType<typeof useLocationAction>;

