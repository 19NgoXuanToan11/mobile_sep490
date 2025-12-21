import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Badge, EmptyState } from "../../../src/shared/ui";
import { useNotifications, Notification } from "../../../src/shared/hooks";

const NotificationBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;

  return (
    <View className="bg-error-500 rounded-full min-w-[20px] h-[20px] items-center justify-center px-1">
      <Text className="text-white text-xs font-bold">
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "order":
        return "bag-outline";
      case "promotion":
        return "pricetag-outline";
      case "system":
        return "settings-outline";
      case "payment":
        return "card-outline";
      case "delivery":
        return "car-outline";
      default:
        return "notifications-outline";
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case "order":
        return "#059669";
      case "promotion":
        return "#dc2626";
      case "system":
        return "#7c3aed";
      case "payment":
        return "#ea580c";
      case "delivery":
        return "#2563eb";
      default:
        return "#6b7280";
    }
  };

  const getTypeText = () => {
    switch (notification.type) {
      case "order":
        return "Đơn hàng";
      case "promotion":
        return "Khuyến mãi";
      case "system":
        return "Hệ thống";
      case "payment":
        return "Thanh toán";
      case "delivery":
        return "Giao hàng";
      default:
        return "Thông báo";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return "Hôm qua";
      if (diffInDays < 7) return `${diffInDays} ngày trước`;
      return date.toLocaleDateString("vi-VN");
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className={`mx-4 mb-3 rounded-lg border ${
        notification.isRead
          ? "bg-white border-neutral-200"
          : "bg-green-50 border-green-200"
      }`}
    >
      <View className="p-4">
        <View className="flex-row space-x-3">
          <View className="shrink-0">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${getIconColor()}20` }}
            >
              <Ionicons name={getIcon()} size={20} color={getIconColor()} />
            </View>
          </View>

          <View className="flex-1 min-w-0">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center space-x-2 flex-1 min-w-0">
                <Badge variant="secondary" size="sm">
                  {getTypeText()}
                </Badge>
              </View>
              <Text className="text-xs text-neutral-500 shrink-0 ml-2">
                {formatTime(notification.timestamp)}
              </Text>
            </View>

            <Text
              className={`font-medium mb-1 ${
                notification.isRead ? "text-neutral-700" : "text-neutral-900"
              }`}
            >
              {notification.title}
            </Text>

            <Text
              className={`text-sm leading-5 ${
                notification.isRead ? "text-neutral-500" : "text-neutral-600"
              }`}
            >
              {notification.message}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FILTER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "order", label: "Đơn hàng" },
  { key: "promotion", label: "Khuyến mãi" },
] as const;

export default function NotificationsScreen() {
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTER_TABS)[number]["key"]>("all");
  const [refreshing, setRefreshing] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    loadNotifications,
  } = useNotifications();

  const filteredNotifications = notifications.filter((notification) => {
    switch (activeFilter) {
      case "unread":
        return !notification.isRead;
      case "order":
        return notification.type === "order";
      case "promotion":
        return notification.type === "promotion";
      default:
        return true;
    }
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
    }
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView
        edges={["top"]}
        className="bg-white border-b border-neutral-200"
      >
        <View className="relative flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View className="absolute left-0 right-0 items-center">
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold text-neutral-900">
                Thông báo
              </Text>
              <View className="ml-2">
                <NotificationBadge count={unreadCount} />
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 pb-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-full border ${
                activeFilter === tab.key
                  ? "bg-primary-600 border-primary-600"
                  : "bg-white border-neutral-300"
              }`}
            >
              <View className="flex-row items-center space-x-2">
                <Text
                  className={`font-medium ${
                    activeFilter === tab.key ? "text-white" : "text-neutral-700"
                  }`}
                >
                  {tab.label}
                </Text>
                {tab.key === "unread" && unreadCount > 0 && (
                  <View className="bg-error-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                    <Text className="text-white text-xs font-bold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title={
              activeFilter === "unread"
                ? "Không có thông báo chưa đọc"
                : "Không có thông báo"
            }
            description={
              activeFilter === "unread"
                ? "Tất cả thông báo đã được đọc"
                : "Chưa có thông báo nào được gửi đến bạn"
            }
          />
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={handleNotificationPress}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
