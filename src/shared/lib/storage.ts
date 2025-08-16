import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Keys
export const STORAGE_KEYS = {
  // Secure store keys
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",

  // Async storage keys
  USER_PREFERENCES: "user_preferences",
  LANGUAGE: "language",
  CART_ITEMS: "cart_items",
  RECENT_SEARCHES: "recent_searches",
  LAST_ACTIVE_TAB: "last_active_tab",
} as const;

// Secure storage utilities
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore setItem error:", error);
      // Fallback to AsyncStorage in case SecureStore fails
      await AsyncStorage.setItem(`secure_${key}`, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("SecureStore getItem error:", error);
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(`secure_${key}`);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("SecureStore removeItem error:", error);
      // Fallback to AsyncStorage
      await AsyncStorage.removeItem(`secure_${key}`);
    }
  },

  async clear(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
    } catch (error) {
      console.error("SecureStore clear error:", error);
    }
  },
};

// Regular storage utilities
export const storage = {
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("AsyncStorage setItem error:", error);
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("AsyncStorage getItem error:", error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("AsyncStorage removeItem error:", error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("AsyncStorage clear error:", error);
    }
  },

  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error("AsyncStorage getAllKeys error:", error);
      return [];
    }
  },

  async multiGet(keys: string[]): Promise<readonly [string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error("AsyncStorage multiGet error:", error);
      return keys.map((key) => [key, null]);
    }
  },
};

// Specific storage functions
export const authStorage = {
  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    if (refreshToken) {
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  async getAccessToken(): Promise<string | null> {
    return await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return await secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

export const userPreferences = {
  async setLanguage(language: string): Promise<void> {
    await storage.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  async getLanguage(): Promise<string | null> {
    return await storage.getItem(STORAGE_KEYS.LANGUAGE);
  },

  async setLastActiveTab(tab: string): Promise<void> {
    await storage.setItem(STORAGE_KEYS.LAST_ACTIVE_TAB, tab);
  },

  async getLastActiveTab(): Promise<string | null> {
    return await storage.getItem(STORAGE_KEYS.LAST_ACTIVE_TAB);
  },

  // Clean up any legacy onboarding flags that might exist
  async clearLegacyOnboardingFlags(): Promise<void> {
    try {
      await storage.removeItem("onboarding_completed");
      // Also clear from the persisted zustand store
      const keys = await storage.getAllKeys();
      const onboardingKeys = keys.filter(
        (key) => key.includes("onboarding") || key.includes("user-preferences")
      );
      await Promise.all(onboardingKeys.map((key) => storage.removeItem(key)));
    } catch (error) {
      console.error("Error clearing legacy onboarding flags:", error);
    }
  },
};
