// Web-adapted useGlobalLocationRef
import { useEffect, useRef } from 'react';
import Store from '../store';

type NormalizedLocation = { latitude: number; longitude: number };

function extractLatLng(gl: any): NormalizedLocation {
  return {
    latitude: gl?.coords?.latitude ?? gl?.latitude ?? 0,
    longitude: gl?.coords?.longitude ?? gl?.longitude ?? 0,
  };
}

export function useGlobalLocationRef() {
  const locationRef = useRef<NormalizedLocation>({ latitude: 0, longitude: 0 });

  useEffect(() => {
    // initial
    const state = Store.getState();
    locationRef.current = extractLatLng(state.locationReducer?.globalLocation);

    // subscribe without causing React re-renders
    const unsubscribe = Store.subscribe(() => {
      const s = Store.getState();
      locationRef.current = extractLatLng(s.locationReducer?.globalLocation);
    });

    return unsubscribe;
  }, []);

  return locationRef;
}
