import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, CartItem, Cart } from "../../types";
import { authStorage, storage, STORAGE_KEYS } from "../lib/storage";
import { authApi, cartApi } from "../data/api";

// Notification types
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

// Authentication hook
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

        // Sync guest cart to user cart after successful login
        // Đồng bộ giỏ hàng khách đến giỏ hàng người dùng sau khi đăng nhập thành công
        setTimeout(() => {
          useCartStore.getState().syncGuestCartToUser();
        }, 500);

        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
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

      // Clear cart when logging out
      // Xóa giỏ hàng khi đăng xuất
      useCartStore.getState().clearCart();
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

// Cart hook with Guest and User mode support
interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  loadItems: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncGuestCartToUser: () => Promise<void>;
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
      console.error("Load cart items error:", error);
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
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const { isAuthenticated } = useAuthStore.getState();

      if (isAuthenticated) {
        // For authenticated users, we need to get the productId from the cart item
        // since backend expects productId, not cartItemId
        const currentItems = get().items;
        const item = currentItems.find((i) => i.id === itemId);
        if (!item) {
          console.error("Cart item not found:", itemId);
          return;
        }

        const response = await cartApi.updateQuantity(
          item.productId, // Pass productId instead of itemId
          quantity,
          isAuthenticated
        );
        if (response.success) {
          set({ items: response.data });
        }
      } else {
        // Guest mode - use localStorage with itemId
        const response = await cartApi.updateQuantity(
          itemId,
          quantity,
          isAuthenticated
        );
        if (response.success) {
          set({ items: response.data });
        }
      }
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  },

  removeItem: async (itemId) => {
    try {
      const { isAuthenticated } = useAuthStore.getState();

      if (isAuthenticated) {
        // For authenticated users, we need to get the productId from the cart item
        // since backend expects productId, not cartItemId
        const currentItems = get().items;
        const item = currentItems.find((i) => i.id === itemId);
        if (!item) {
          console.error("Cart item not found:", itemId);
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
        // Guest mode - use localStorage with itemId
        const response = await cartApi.removeItem(itemId, isAuthenticated);
        if (response.success) {
          set({ items: response.data });
        }
      }
    } catch (error) {
      console.error("Remove item error:", error);
    }
  },

  clearCart: async () => {
    try {
      const { isAuthenticated } = useAuthStore.getState();
      const response = await cartApi.clear(isAuthenticated);
      if (response.success) {
        set({ items: [] });
      }
    } catch (error) {
      console.error("Clear cart error:", error);
    }
  },

  /**
   * Sync guest cart (localStorage) to user cart (API) after login
   * Đồng bộ giỏ hàng khách (localStorage) đến giỏ hàng người dùng (API) sau khi đăng nhập
   */
  syncGuestCartToUser: async () => {
    try {
      const { isAuthenticated } = useAuthStore.getState();

      if (!isAuthenticated) {
        return;
      }

      // Get guest cart from localStorage
      const guestCart =
        (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];

      if (guestCart.length === 0) {
        return;
      }

      // Add each guest cart item to user cart via API
      for (const item of guestCart) {
        try {
          await cartApi.addItem(item.productId, item.quantity, true);
        } catch (error) {
          console.error(`Failed to sync item ${item.productId}:`, error);
        }
      }

      // Clear guest cart from localStorage
      await storage.removeItem(STORAGE_KEYS.CART_ITEMS);

      // Reload cart items from API
      await get().loadItems();
    } catch (error) {
      console.error("Sync guest cart error:", error);
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

// Notifications hook
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
          // TODO: Replace with actual API call
          // const response = await notificationApi.getNotifications();
          // if (response.success) {
          //   const notifications = response.data;
          //   const unreadCount = notifications.filter(n => !n.isRead).length;
          //   set({ notifications, unreadCount });
          // }

          // Mock data for now
          const mockNotifications: Notification[] = [
            {
              id: "1",
              title: "Đơn hàng",
              message:
                "Đơn hàng #12345 đã được xác nhận\nĐơn hàng của bạn đã được xác nhận và đang được chuẩn bị. Dự kiến giao hàng trong 2-3 ngày.",
              type: "order",
              isRead: false,
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            },
            {
              id: "2",
              title: "Khuyến mãi",
              message:
                "🎉 Khuyến mãi đặc biệt 20%\nGiảm giá 20% cho tất cả sản phẩm rau củ quả tươi. Áp dụng từ hôm nay đến hết tuần!",
              type: "promotion",
              isRead: false,
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
            },
            {
              id: "3",
              title: "Thanh toán",
              message:
                "Thanh toán thành công\nThanh toán đơn hàng #12344 đã được xử lý thành công qua VNPay.",
              type: "payment",
              isRead: true,
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
            },
            {
              id: "4",
              title: "Giao hàng",
              message:
                "Đơn hàng đang được giao\nĐơn hàng #12343 đang trên đường giao đến bạn. Mã vận đơn: GH123456789",
              type: "delivery",
              isRead: true,
              timestamp: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ];

          const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
          set({ notifications: mockNotifications, unreadCount });
        } catch (error) {
          console.error("Load notifications error:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      markAsRead: async (id: string) => {
        try {
          // TODO: Replace with actual API call
          // await notificationApi.markAsRead(id);

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
        } catch (error) {
          console.error("Mark as read error:", error);
        }
      },

      markAllAsRead: async () => {
        try {
          // TODO: Replace with actual API call
          // await notificationApi.markAllAsRead();

          const { notifications } = get();
          const updatedNotifications = notifications.map((notification) => ({
            ...notification,
            isRead: true,
          }));

          set({ notifications: updatedNotifications, unreadCount: 0 });
        } catch (error) {
          console.error("Mark all as read error:", error);
        }
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
