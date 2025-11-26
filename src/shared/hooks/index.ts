import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { User, CartItem, Cart } from "../../types";
import { authStorage, storage, STORAGE_KEYS } from "../lib/storage";
import { authApi, cartApi } from "../data/api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "payment" | "delivery";
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<boolean>;
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

        setTimeout(() => {
          useCartStore.getState().syncGuestCartToUser();
        }, 500);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  register: async (email, password, confirmPassword) => {
    try {
      const response = await authApi.register({
        email,
        password,
        confirmPassword,
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

      useCartStore.getState().clearCart();
    } catch (error) {}
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

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  loadItems: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncGuestCartToUser: () => Promise<void>;
  toggleItemSelection: (itemId: string) => Promise<void>;
  toggleAllSelection: (selected: boolean) => Promise<void>;
}
export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  loadItems: async () => {
    try {
      set({ isLoading: true });
      const { isAuthenticated } = useAuthStore.getState();
      const response = await cartApi.getItems(isAuthenticated);
      if (response.success) {
        set({ items: response.data });
      }
    } catch (error) {
    } finally {
      set({ isLoading: false });
    }
  },
  addItem: async (productId, quantity = 1) => {
    try {
      const { isAuthenticated } = useAuthStore.getState();
      const response = await cartApi.addItem(
        productId,
        quantity,
        isAuthenticated
      );
      if (response.success) {
        set({ items: response.data });
      }
    } catch (error) {}
  },
  updateQuantity: async (itemId, quantity) => {
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        const currentItems = get().items;
        const item = currentItems.find((i) => i.id === itemId);
        if (!item) {
          return;
        }
        const response = await cartApi.updateQuantity(
          item.productId,
          quantity,
          isAuthenticated
        );
        if (response.success) {
          set({ items: response.data });
        }
      } else {
        const response = await cartApi.updateQuantity(
          itemId,
          quantity,
          isAuthenticated
        );
        if (response.success) {
          set({ items: response.data });
        }
      }
    } catch (error) {}
  },
  removeItem: async (itemId) => {
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        const currentItems = get().items;
        const item = currentItems.find((i) => i.id === itemId);
        if (!item) {
          return;
        }
        const response = await cartApi.removeItem(
          item.productId,
          isAuthenticated
        );
        if (response.success) {
          set({ items: response.data });
        }
      } else {
        const response = await cartApi.removeItem(itemId, isAuthenticated);
        if (response.success) {
          set({ items: response.data });
        }
      }
    } catch (error) {}
  },
  clearCart: async () => {
    try {
      const { isAuthenticated } = useAuthStore.getState();
      const response = await cartApi.clear(isAuthenticated);
      if (response.success) {
        set({ items: [] });
      }
    } catch (error) {}
  },

  syncGuestCartToUser: async () => {
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        return;
      }

      const guestCart =
        (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
      if (guestCart.length === 0) {
        return;
      }

      for (const item of guestCart) {
        try {
          await cartApi.addItem(item.productId, item.quantity, true);
        } catch (error) {}
      }

      await storage.removeItem(STORAGE_KEYS.CART_ITEMS);

      await get().loadItems();
    } catch (error) {}
  },

  toggleItemSelection: async (itemId) => {
    try {
      const currentItems = get().items;
      const updatedItems = currentItems.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      );
      set({ items: updatedItems });

      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        await storage.setItem(STORAGE_KEYS.CART_ITEMS, updatedItems);
      }
    } catch (error) {}
  },

  toggleAllSelection: async (selected) => {
    try {
      const currentItems = get().items;
      const updatedItems = currentItems.map((item) => ({
        ...item,
        selected,
      }));
      set({ items: updatedItems });

      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        await storage.setItem(STORAGE_KEYS.CART_ITEMS, updatedItems);
      }
    } catch (error) {}
  },
}));
export const useCart = () => {
  const store = useCartStore();
  const cart = useMemo((): Cart => {
    const itemCount = store.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = store.items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = 0; // Không tính phí ship
    const discount = 0;
    const total = subtotal - discount; // Tổng thanh toán = tạm tính - giảm giá
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

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, "id">) => void;
}
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      loadNotifications: async () => {
        try {
          set({ isLoading: true });
          // TODO: Integrate with real notifications API.
          // For now, ensure no mock/placeholder notifications are loaded.
          set({ notifications: [], unreadCount: 0 });
        } catch (error) {
        } finally {
          set({ isLoading: false });
        }
      },
      markAsRead: async (id: string) => {
        try {
          const { notifications } = get();
          const updatedNotifications = notifications.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          );
          const unreadCount = updatedNotifications.filter(
            (n) => !n.isRead
          ).length;
          set({ notifications: updatedNotifications, unreadCount });
        } catch (error) {}
      },
      markAllAsRead: async () => {
        try {
          const { notifications } = get();
          const updatedNotifications = notifications.map((notification) => ({
            ...notification,
            isRead: true,
          }));
          set({ notifications: updatedNotifications, unreadCount: 0 });
        } catch (error) {}
      },
      addNotification: (notification: Omit<Notification, "id">) => {
        const { notifications, unreadCount } = get();
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
        };
        set({
          notifications: [newNotification, ...notifications],
          unreadCount: notification.isRead ? unreadCount : unreadCount + 1,
        });
      },
    }),
    {
      name: "notifications-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
export const useNotifications = () => {
  const store = useNotificationStore();
  useEffect(() => {
    store.loadNotifications();
  }, []);
  return store;
};

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

interface PreferencesStore {
  language: string;
  lastActiveTab: string;
  setLanguage: (language: string) => Promise<void>;
  setLastActiveTab: (tab: string) => Promise<void>;
}
export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      language: "vi",
      lastActiveTab: "home",
      setLanguage: async (language) => {
        set({ language });
        await storage.setItem(STORAGE_KEYS.LANGUAGE, language);
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

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        setIsLoading(true);
        const result = await fn();
        return result;
      } catch (error) {
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

export const useAuthActions = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const logoutWithCacheInvalidation = useCallback(async () => {
    try {
      await authStore.logout();

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["featured-products"] });
      await queryClient.invalidateQueries({ queryKey: ["trending-products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["banners"] });

      queryClient.removeQueries({ queryKey: ["products"], exact: false });
      queryClient.removeQueries({ queryKey: ["featured-products"] });
      queryClient.removeQueries({ queryKey: ["trending-products"] });
    } catch (error) {}
  }, [authStore, queryClient]);
  return {
    ...authStore,
    logout: logoutWithCacheInvalidation,
  };
};

export { useProvinceData } from "./useProvinceData";
