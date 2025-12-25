// Web-adapted useCheckAppStateCurrent hook
// Web doesn't have AppState like React Native, but we can track document visibility
import { useEffect, useRef, useState } from 'react';

const useCheckAppStateCurrent = () => {
  const [appStateVisible, setAppStateVisible] = useState<'active' | 'background' | 'inactive'>(
    document.hidden ? 'background' : 'active'
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setAppStateVisible('background');
      } else {
        setAppStateVisible('active');
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for window blur/focus (additional tracking)
    const handleBlur = () => setAppStateVisible('background');
    const handleFocus = () => setAppStateVisible('active');

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return { appStateVisible };
};

export default useCheckAppStateCurrent;


