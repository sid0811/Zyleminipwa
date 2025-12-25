/**
 * Secure storage wrapper for web
 * Uses localStorage (can be enhanced with encryption if needed)
 * Adapted from React Native AsyncStorage
 */

class SecureStorage {
  /**
   * Get string value from storage
   */
  async getString(key: string): Promise<string | null> {
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  /**
   * Set string value to storage
   */
  async setString(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get object value from storage
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting object ${key}:`, error);
      return null;
    }
  }

  /**
   * Set object value to storage
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting object ${key}:`, error);
      throw error;
    }
  }

  /**
   * Remove value from storage
   */
  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Check if key exists
   */
  async containsKey(key: string): Promise<boolean> {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set value (alias for setString for compatibility)
   */
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get value (alias for getString for compatibility)
   */
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }
}

const cacheStorage = new SecureStorage();
export default cacheStorage;

