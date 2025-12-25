// Web-adapted useNetInfo hook
import { useEffect, useState } from 'react';

export const useNetInfo = () => {
  const [isNetConnected, setIsNetConnected] = useState<boolean | null>(
    typeof navigator !== 'undefined' ? navigator.onLine : null
  );

  useEffect(() => {
    const handleOnline = () => setIsNetConnected(true);
    const handleOffline = () => setIsNetConnected(false);

    // Set initial state
    setIsNetConnected(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isNetConnected,
    isConnected: isNetConnected,
    isInternetReachable: isNetConnected,
  };
};


