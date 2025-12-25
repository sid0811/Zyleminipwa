import {useDispatch} from 'react-redux';
import { setGeofenceEventsReducer, setGeofenceEventsReducerToEmpty, setOneTimeGeofenceCaptureCtaClicked, setRemoveExitedGeofence } from '../reducers/geofenceReducers';
import {useAppSelector} from '../store';

type Function = { 
    geofenceEvents ?: any;
    setGeofenceEvents ?: any;
    setRemoveExitedGeofenceEvents : (value : any) => void;
    getOneTimeGeofenceCaptureCtaClickedEvents ?: Boolean
    setOneTimeGeofenceCaptureCtaClickedEvents : (value : Boolean) => void;
    setGeofenceEventsReducerToEmptyEvent?: any;
}

export const useGeofenceAction = (): Function => {
    const dispatch = useDispatch();
    const setGeofenceEvents = (payload: any) => {
        console.log("setGeofenceEvents payload1--->",geofenceEvents)
        console.log("setGeofenceEvents payload--->",payload)
         dispatch(setGeofenceEventsReducer(payload))
       }
       const setRemoveExitedGeofenceEvents = (payload : any) => {
        console.log("setRemoveExitedGeofenceEvents payload--->",payload)
        dispatch(setRemoveExitedGeofence(payload))
       }

  const setOneTimeGeofenceCaptureCtaClickedEvents = (payload : Boolean) => {
    dispatch(setOneTimeGeofenceCaptureCtaClicked(payload))
  }

  const setGeofenceEventsReducerToEmptyEvent = ()=>{
    dispatch(setGeofenceEventsReducerToEmpty())
  }

  const geofenceEvents = useAppSelector(state => state.geofenceReducer.geofenceEvents);

  const getOneTimeGeofenceCaptureCtaClickedEvents =  useAppSelector(state => state.geofenceReducer.oneTimeGeofenceCaptureCtaClicked);

return {
    geofenceEvents,
    setGeofenceEvents,
    setRemoveExitedGeofenceEvents,
    setOneTimeGeofenceCaptureCtaClickedEvents,
    getOneTimeGeofenceCaptureCtaClickedEvents,
    setGeofenceEventsReducerToEmptyEvent
}
}

