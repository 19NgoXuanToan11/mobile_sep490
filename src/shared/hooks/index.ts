import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, CartItem, Cart } from "../../types";
import { authStorage, storage, STORAGE_KEYS } from "../lib/storage";
import { authApi, cartApi } from "../data/api";

// Authentication hook
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.success) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await authApi.register({
        name,
        email,
        password,
        confirmPassword: password,
      });
      if (response.success) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  checkAuth: async () => {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await authApi.getCurrentUser();
      if (response.success) {
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        await authStorage.clearTokens();
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({ isLoading: false });
    }
  },
}));

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    store.checkAuth();
  }, []);

  return store;
};

// Cart hook
interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  loadItems: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,

  loadItems: async () => {
    try {
      set({ isLoading: true });
      const response = await cartApi.getItems();
      if (response.success) {
        set({ items: response.data });
      }
    } catch (error) {
      console.error("Load cart items error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    try {
      const response = await cartApi.addItem(productId, quantity);
      if (response.success) {
        set({ items: response.data });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const response = await cartApi.updateQuantity(itemId, quantity);
      if (response.success) {
        set({ items: response.data });
      }
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  },

  removeItem: async (itemId) => {
    try {
      const response = await cartApi.removeItem(itemId);
      if (response.success) {
        set({ items: response.data });
      }
    } catch (error) {
      console.error("Remove item error:", error);
    }
  },

  clearCart: async () => {
    try {
      const response = await cartApi.clear();
      if (response.success) {
        set({ items: [] });
      }
    } catch (error) {
      console.error("Clear cart error:", error);
    }
  },
}));

export const useCart = () => {
  const store = useCartStore();

  const cart = useMemo((): Cart => {
    const itemCount = store.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = store.items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = subtotal > 0 ? 25000 : 0; // Free shipping over 500k
    const discount = 0; // TODO: Implement discount logic
    const total = subtotal + shippingFee - discount;

    return {
      items: store.items,
      itemCount,
      subtotal,
      shippingFee,
      discount,
      total,
    };
  }, [store.items]);

  useEffect(() => {
    store.loadItems();
  }, []);

  return {
    ...store,
    cart,
  };
};

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Preferences hook
interface PreferencesStore {
  language: string;
  theme: "light" | "dark" | "system";
  lastActiveTab: string;
  setLanguage: (language: string) => Promise<void>;
  setTheme: (theme: "light" | "dark" | "system") => Promise<void>;
  setLastActiveTab: (tab: string) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      language: "vi",
      theme: "system",
      lastActiveTab: "home",

      setLanguage: async (language) => {
        set({ language });
        await storage.setItem(STORAGE_KEYS.LANGUAGE, language);
      },

      setTheme: async (theme) => {
        set({ theme });
        await storage.setItem(STORAGE_KEYS.THEME, theme);
      },

      setLastActiveTab: async (tab) => {
        set({ lastActiveTab: tab });
        await storage.setItem(STORAGE_KEYS.LAST_ACTIVE_TAB, tab);
      },
    }),
    {
      name: "user-preferences",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const usePreferences = () => usePreferencesStore();

// Loading state hook
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        setIsLoading(true);
        const result = await fn();
        return result;
      } catch (error) {
        console.error("Loading error:", error);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    setIsLoading,
    withLoading,
  };
};

// Async state hook
interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  deps: any[] = []
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await asyncFunction();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }, deps);

  useEffect(() => {
    execute();
  }, deps);

  return {
    ...state,
    refetch: execute,
  };
};

// Localization hook (wrapper around useTranslation)
export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = usePreferences();

  const changeLanguage = useCallback(
    async (lang: string) => {
      await setLanguage(lang);
      await i18n.changeLanguage(lang);
    },
    [i18n, setLanguage]
  );

  return {
    t,
    language: i18n.language,
    changeLanguage,
    isRTL: i18n.dir() === "rtl",
  };
};
