// Web-adapted deviceManager - using Web APIs
// Generate a unique device ID and store it in localStorage
const getStoredDeviceId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('device_id');
};

const generateDeviceId = (): string => {
  // Generate a unique ID
  let deviceId = 'web_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('device_id', deviceId);
  }
  
  return deviceId;
};

export const getDeviceID = async (): Promise<string> => {
  const stored = getStoredDeviceId();
  if (stored) {
    return stored;
  }
  return generateDeviceId();
};

export const appVersionInformation = (): string => {
  // Get from package.json or environment variable
  return import.meta.env.VITE_APP_VERSION || '1.0.0';
};

export const appBuildNumberInformation = (): string => {
  return import.meta.env.VITE_APP_BUILD || '1';
};

export const systemsName = (): string => {
  if (typeof navigator === 'undefined') return 'Unknown';
  return navigator.userAgent;
};

export const systemIsTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Simple tablet detection based on screen size
  return window.innerWidth >= 768 && window.innerWidth <= 1024;
};

export const systemBatteryLevel = async (): Promise<number> => {
  // Web Battery API (limited browser support)
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return battery.level * 100;
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
  }
  return 0;
};

export const systemBattery = async (): Promise<any> => {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      };
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
  }
  return null;
};

export const operatingSystemsVersion = (): string => {
  if (typeof navigator === 'undefined') return 'Unknown';
  return navigator.platform || 'Unknown';
};

export const isAndroid = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};


