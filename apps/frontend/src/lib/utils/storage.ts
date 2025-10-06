/**
 * Storage Utilities Module
 * Simple, self-contained storage functions
 */

/**
 * Safe localStorage operations
 */
export class SafeStorage {
  /**
   * Get item from localStorage
   */
  static getItem(key: string): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  static setItem(key: string, value: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all localStorage
   */
  static clear(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * JSON storage utilities
 */
export class JsonStorage {
  /**
   * Get JSON object from localStorage
   */
  static getObject<T>(key: string, defaultValue: T): T {
    const item = SafeStorage.getItem(key);
    if (!item) return defaultValue;

    try {
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Set JSON object in localStorage
   */
  static setObject(key: string, value: any): boolean {
    try {
      const jsonString = JSON.stringify(value);
      return SafeStorage.setItem(key, jsonString);
    } catch {
      return false;
    }
  }

  /**
   * Remove JSON object from localStorage
   */
  static removeObject(key: string): boolean {
    return SafeStorage.removeItem(key);
  }
}

/**
 * Session storage utilities
 */
export class SessionStorage {
  /**
   * Get item from sessionStorage
   */
  static getItem(key: string): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Set item in sessionStorage
   */
  static setItem(key: string, value: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  static removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all sessionStorage
   */
  static clear(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      sessionStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
}
