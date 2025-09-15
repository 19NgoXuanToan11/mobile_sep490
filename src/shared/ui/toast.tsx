import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { create } from "zustand";
import { cn } from "../lib/utils";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearAll: () => {
    set({ toasts: [] });
  },
}));

export const useToast = () => {
  const { addToast } = useToastStore();

  const toast = {
    success: (title: string, description?: string, duration?: number) =>
      addToast({ type: "success", title, description, duration }),
    error: (title: string, description?: string, duration?: number) =>
      addToast({ type: "error", title, description, duration }),
    warning: (title: string, description?: string, duration?: number) =>
      addToast({ type: "warning", title, description, duration }),
    info: (title: string, description?: string, duration?: number) =>
      addToast({ type: "info", title, description, duration }),
  };

  return toast;
};

const getToastStyles = (type: Toast["type"]) => {
  switch (type) {
    case "success":
      return {
        container: "bg-success-50 border-success-200",
        icon: "checkmark-circle",
        iconColor: "#16a34a",
        titleColor: "text-success-800",
        descriptionColor: "text-success-600",
      };
    case "error":
      return {
        container: "bg-error-50 border-error-200",
        icon: "close-circle",
        iconColor: "#dc2626",
        titleColor: "text-error-800",
        descriptionColor: "text-error-600",
      };
    case "warning":
      return {
        container: "bg-warning-50 border-warning-200",
        icon: "warning",
        iconColor: "#d97706",
        titleColor: "text-warning-800",
        descriptionColor: "text-warning-600",
      };
    case "info":
    default:
      return {
        container: "bg-blue-50 border-blue-200",
        icon: "information-circle",
        iconColor: "#2563eb",
        titleColor: "text-blue-800",
        descriptionColor: "text-blue-600",
      };
  }
};

export const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToastStore();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  const styles = getToastStyles(toast.type);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRemove = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      removeToast(toast.id);
    });
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim }],
        opacity: opacityAnim,
      }}
      className={cn(
        "mx-4 mb-2 p-4 rounded-lg border shadow-sm",
        styles.container
      )}
    >
      <View className="flex-row items-start space-x-3">
        <Ionicons
          name={styles.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={styles.iconColor}
        />

        <View className="flex-1">
          <Text className={cn("font-medium", styles.titleColor)}>
            {toast.title}
          </Text>
          {toast.description && (
            <Text className={cn("text-sm mt-1", styles.descriptionColor)}>
              {toast.description}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={handleRemove}>
          <Ionicons name="close" size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export const ToastProvider: React.FC = () => {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <View className="absolute top-safe-top left-0 right-0 z-50 pt-16">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
};
