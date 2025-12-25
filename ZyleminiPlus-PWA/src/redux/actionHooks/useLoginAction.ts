import {useDispatch} from 'react-redux';
import {
  setEnteredUName,
  setUserPassword,
  setClientCode,
  setClientBaseURL,
  setLoginLoading,
  setUName,
  setUId,
  setDevId,
  setAreaaId,
  setToken,
  setSavedApiVersion,
  setSavedAppendedApiVersion,
} from '../reducers/loginReducers';
import {useAppSelector} from '../store';

type Function = {
  setUserPass?: any;
  setEnterUserName?: any;
  setEnteredClientCode?: any;
  setClientBasedURL?: any;
  setLoginLoader?: any;
  enteredUserName: string;
  userPassword: string;
  savedClientCode: string;
  clientBaseURL: string;
  loginLoading: boolean;
  setUserName: any;
  setUserId: any;
  setDeviceId: any;
  setAreaId: any;
  userName: string;
  userId: string;
  deviceId: string;
  areaId: string;
  setJWTToken: any;
  token: any;
  setSavedAppendedApiVersionAction: (payload: string) => void;
  savedAppendApiVersion: string;
  setSavedApiVersionAction: (payload: string) => void;
  savedApiVersion: string;
};

export const useLoginAction = (): Function => {
  const dispatch = useDispatch();

  const setEnterUserName = (payload: string) => {
    dispatch(setEnteredUName(payload));
  };

  const setUserPass = (payload: string) => {
    dispatch(setUserPassword(payload));
  };

  const setEnteredClientCode = (payload: string) => {
    dispatch(setClientCode(payload));
  };
  const setClientBasedURL = (payload: string) => {
    dispatch(setClientBaseURL(payload));
  };
  const setLoginLoader = (payload: boolean) => {
    dispatch(setLoginLoading(payload));
  };

  //API Response
  const setUserName = (payload: string | number) => {
    dispatch(setUName(payload));
  };
  const setUserId = (payload: string | number) => {
    dispatch(setUId(payload));
  };
  const setDeviceId = (payload: string | number) => {
    dispatch(setDevId(payload));
  };
  const setAreaId = (payload: string | number) => {
    dispatch(setAreaaId(payload));
  };
  const setJWTToken = (payload: any) => {
    dispatch(setToken(payload));
  };

  //#region--------------API VERSION------------
  const setSavedApiVersionAction = (payload: string) => {
    dispatch(setSavedApiVersion(payload));
  };

  const setSavedAppendedApiVersionAction = (payload: string) => {
    dispatch(setSavedAppendedApiVersion(payload));
  };
  //#endregion

  const enteredUserName = useAppSelector(
    state => state.loginReducer.enteredUserName,
  );
  const userPassword = useAppSelector(state => state.loginReducer.userPassword);
  const savedClientCode = useAppSelector(
    state => state.loginReducer.savedClientCode,
  );
  const clientBaseURL = useAppSelector(
    state => state.loginReducer.clientBaseURL,
  );
  const loginLoading = useAppSelector(state => state.loginReducer.loginLoading);

  const userName = useAppSelector(state => state.loginReducer.userName);
  const userId = useAppSelector(state => state.loginReducer.userId);
  const deviceId = useAppSelector(state => state.loginReducer.deviceId);
  const areaId = useAppSelector(state => state.loginReducer.areaId);
  const token = useAppSelector(state => state.loginReducer.token);

  //#region--------------API VERSION------------
  const savedApiVersion = useAppSelector(
    state => state.loginReducer.savedApiVersion,
  );
  const savedAppendApiVersion = useAppSelector(
    state => state.loginReducer.savedAppendApiVersion,
  );
  //#endregion

  return {
    enteredUserName,
    setEnterUserName,
    userPassword,
    setUserPass,
    savedClientCode,
    setEnteredClientCode,
    clientBaseURL,
    setClientBasedURL,
    loginLoading,
    setLoginLoader,
    userName,
    setUserName,
    userId,
    setUserId,
    deviceId,
    setDeviceId,
    areaId,
    setAreaId,
    token,
    setJWTToken,
    setSavedApiVersionAction,
    savedApiVersion,
    setSavedAppendedApiVersionAction,
    savedAppendApiVersion,
  };
};

