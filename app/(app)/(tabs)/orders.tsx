import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Animated,
  Easing,
  Dimensions,
  Linking,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import {
  Card,
  Badge,
  EmptyState,
  Button,
  Skeleton,
} from "../../../src/shared/ui";
import { ordersApi } from "../../../src/shared/data/api";
import { useLocalization, useAuth } from "../../../src/shared/hooks";
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
} from "../../../src/shared/lib/utils";
import { Order } from "../../../src/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function OrdersScreen() {
  const { t } = useLocalization();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Animation values
  const searchAnimation = new Animated.Value(0);
  const chipAnimations = {
    all: new Animated.Value(1),
    placed: new Animated.Value(0.8),
    confirmed: new Animated.Value(0.8),
    shipped: new Animated.Value(0.8),
    delivered: new Animated.Value(0.8),
    cancelled: new Animated.Value(0.8),
  };

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Don't redirect immediately, just show empty state with login prompt
    }
  }, [isAuthenticated, isLoading]);

  // Enhanced status filter with more granular control - Mapping theo backend enum PaymentStatus
  const getStatusFilter = () => {
    switch (activeTab) {
      case "placed":
        return "0"; // UNPAID - Chờ thanh toán
      case "confirmed":
        return "1"; // PAID - Đã thanh toán/xác nhận
      case "shipped":
        return "3"; // PENDING - Đang giao
      case "delivered":
        return "5"; // COMPLETED - Hoàn thành (hoặc có thể filter cả 5 và 6)
      case "cancelled":
        return "4"; // CANCELLED - Đã hủy
      default:
        return undefined; // all statuses
    }
  };

  // Enhanced infinite query with search support and date filter
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: ordersLoading,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["orders", activeTab, debouncedSearch, selectedDate],
    queryFn: ({ pageParam = 1 }) => {
      // If date is selected, use getByDate API
      if (selectedDate) {
        return ordersApi.getByDate({
          date: selectedDate,
          pageIndex: pageParam,
          pageSize: 15,
        });
      }
      // Otherwise use getAll API
      return ordersApi.getAll({
        pageIndex: pageParam,
        pageSize: 15,
        status: getStatusFilter(),
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.success && lastPage.data.hasNextPage) {
        return pages.length + 1;
      }
      return undefined;
    },
    enabled: isAuthenticated,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false,
  });

  // Flatten all orders from all pages
  const orders =
    data?.pages.flatMap((page) => (page.success ? page.data.orders : [])) ?? [];
  const totalCount = data?.pages[0]?.success
    ? data.pages[0].data.totalCount
    : 0;

  // Enhanced status counts calculation
  const getStatusCounts = useMemo(() => {
    return {
      all: totalCount,
      placed: orders.filter((o) => o.status === "PLACED").length,
      confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
      shipped: orders.filter((o) => o.status === "SHIPPED").length,
      delivered: orders.filter((o) => o.status === "COMPLETED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    };
  }, [orders, totalCount]);

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!debouncedSearch) return orders;
    return orders.filter((order) =>
      order.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [orders, debouncedSearch]);

  // Animation helpers
  const animateChip = useCallback((chipId: string, scale: number) => {
    Animated.spring(chipAnimations[chipId as keyof typeof chipAnimations], {
      toValue: scale,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  }, []);

  const toggleSearch = useCallback(() => {
    const toValue = showSearch ? 0 : 1;
    setShowSearch(!showSearch);

    Animated.timing(searchAnimation, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      useNativeDriver: false, // Changed to false because we're animating layout properties
    }).start();

    if (!showSearch) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setSearchQuery("");
    }
  }, [showSearch, searchAnimation]);

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Thành công", "Đơn hàng đã được hủy thành công");
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Lỗi",
        error?.message || "Không thể hủy đơn hàng. Vui lòng thử lại."
      );
    },
  });

  // Handle cancel order
  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      "Xác nhận hủy đơn",
      "Bạn có chắc chắn muốn hủy đơn hàng này?",
      [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Có, hủy đơn",
          style: "destructive",
          onPress: () => {
            cancelOrderMutation.mutate(Number(orderId));
          },
        },
      ]
    );
  };

  // Enhanced status info with better colors and animations
  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "PLACED":
        return {
          text: "Chưa thanh toán",
          color: "#f59e0b",
          bgColor: "#fffbeb",
          borderColor: "#fbbf24",
          icon: "receipt-outline",
          gradient: ["#fbbf24", "#f59e0b"],
        };
      case "FAILED":
        return {
          text: "Thất bại",
          color: "#ef4444",
          bgColor: "#fef2f2",
          borderColor: "#f87171",
          icon: "close-circle-outline",
          gradient: ["#f87171", "#ef4444"],
        };
      case "CONFIRMED":
        return {
          text: "Xác nhận",
          color: "#047857",
          bgColor: "#ecfdf5",
          borderColor: "#10b981",
          icon: "checkmark-done-outline",
          gradient: ["#10b981", "#047857"],
        };
      case "PACKED":
        return {
          text: "Đang chuẩn bị",
          color: "#8b5cf6",
          bgColor: "#f5f3ff",
          borderColor: "#a78bfa",
          icon: "cube-outline",
          gradient: ["#a78bfa", "#8b5cf6"],
        };
      case "SHIPPED":
        return {
          text: "Đang giao",
          color: "#06b6d4",
          bgColor: "#ecfeff",
          borderColor: "#22d3ee",
          icon: "car-outline",
          gradient: ["#22d3ee", "#06b6d4"],
        };
      case "DELIVERED":
        return {
          text: "Đã giao",
          color: "#06b6d4",
          bgColor: "#ecfeff",
          borderColor: "#22d3ee",
          icon: "car-outline",
          gradient: ["#22d3ee", "#06b6d4"],
        };
      case "COMPLETED":
        return {
          text: "Hoàn thành",
          color: "#10b981",
          bgColor: "#ecfdf5",
          borderColor: "#34d399",
          icon: "checkmark-circle-outline",
          gradient: ["#34d399", "#10b981"],
        };
      case "CANCELLED":
        return {
          text: "Thất bại",
          color: "#ef4444",
          bgColor: "#fef2f2",
          borderColor: "#f87171",
          icon: "close-circle-outline",
          gradient: ["#f87171", "#ef4444"],
        };
      default:
        return {
          text: status,
          color: "#6b7280",
          bgColor: "#f9fafb",
          borderColor: "#d1d5db",
          icon: "ellipse-outline",
          gradient: ["#d1d5db", "#6b7280"],
        };
    }
  };

  // Enhanced refresh with haptic feedback
  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

  // Date picker handlers
  const handleDateSelect = () => {
    if (tempDate) {
      setSelectedDate(tempDate);
      setShowDatePicker(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleClearDate = () => {
    setSelectedDate(null);
    setTempDate("");
    setShowDatePicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatDateForDisplay = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Enhanced load more with haptic feedback
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      fetchNextPage();
    }
  };

  // Enhanced tab selection with animation
  const handleTabPress = useCallback(
    (tabId: string) => {
      if (tabId === activeTab) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setActiveTab(tabId);

      // Animate chips
      Object.keys(chipAnimations).forEach((chipId) => {
        const scale = chipId === tabId ? 1 : 0.85;
        animateChip(chipId, scale);
      });
    },
    [activeTab, animateChip]
  );

  // Enhanced filter chips configuration
  const filterChips = [
    {
      id: "all",
      label: "Tất cả",
      count: getStatusCounts.all,
      icon: "apps-outline",
      color: "#047857",
      bgColor: "#ecfdf5",
    },
    {
      id: "confirmed",
      label: "Xác nhận",
      count: getStatusCounts.confirmed,
      icon: "checkmark-done-outline",
      color: "#047857",
      bgColor: "#ecfdf5",
    },
    {
      id: "shipped",
      label: "Đang giao",
      count: getStatusCounts.shipped,
      icon: "car-outline",
      color: "#06b6d4",
      bgColor: "#ecfeff",
    },
    {
      id: "delivered",
      label: "Hoàn thành",
      count: getStatusCounts.delivered,
      icon: "checkmark-circle-outline",
      color: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      id: "cancelled",
      label: "Thất bại",
      count: getStatusCounts.cancelled,
      icon: "close-circle-outline",
      color: "#ef4444",
      bgColor: "#fef2f2",
    },


  ];

  // Enhanced Apple-style order card renderer
  const renderOrder = ({ item: order }: { item: Order }) => {
    const statusInfo = getStatusInfo(order.status);

    // Ưu tiên hiển thị order images từ backend, nếu không có thì dùng product images
    const orderImages = order.images && order.images.length > 0 ? order.images : [];
    const displayItems = order.items.slice(0, 2);
    const hasOrderImages = orderImages.length > 0;

    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/(app)/track/${order.id}` as any);
        }}
        activeOpacity={0.98}
        className="mx-4 mb-4"
      >
        <View className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5 border border-gray-100">
          {/* Premium Header */}
          <View className="flex-row items-start justify-between mb-5">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-xl font-bold text-gray-900 mr-3">
                  {order.orderNumber}
                </Text>
                <View
                  className="px-3 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: statusInfo.bgColor,
                    borderColor: statusInfo.borderColor,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: statusInfo.color }}
                  >
                    {statusInfo.text}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mb-3">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-500 ml-2">
                  {formatDate(order.createdAt)}
                </Text>
                {order.shippingAddress?.street && (
                  <>
                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-3" />
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#6B7280"
                    />
                    <Text
                      className="text-sm text-gray-500 ml-1 flex-1"
                      numberOfLines={1}
                    >
                      {order.shippingAddress.street}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Order/Product Images Section */}
          {(hasOrderImages || displayItems.length > 0) && (
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-gray-900">
                  {hasOrderImages ? "Hình ảnh đơn hàng" : "Sản phẩm"}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="cube-outline" size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-500 ml-1">
                    {order.itemCount} mặt hàng
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                {hasOrderImages ? (
                  // Hiển thị order images từ backend
                  <>
                    {orderImages.slice(0, 3).map((imageUri, index) => (
                      <View key={`order-img-${index}`} className="mr-4">
                        <Image
                          source={{
                            uri: imageUri || "https://via.placeholder.com/80x80/f9fafb/9ca3af?text=IMG",
                          }}
                          style={{ width: 80, height: 80 }}
                          className="rounded-2xl bg-gray-50"
                          contentFit="cover"
                        />
                      </View>
                    ))}
                    {orderImages.length > 3 && (
                      <View className="items-center">
                        <View className="w-20 h-20 bg-gray-50 rounded-2xl items-center justify-center border-2 border-dashed border-gray-200">
                          <Text className="text-lg font-bold text-gray-400">
                            +{orderImages.length - 3}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-500 mt-2">Khác</Text>
                      </View>
                    )}
                  </>
                ) : (
                  // Fallback: hiển thị product images như cũ
                  <>
                    {displayItems.map((item, index) => {
                      const imageUri = item.product?.images?.[0];
                      return (
                        <View key={`${item.id}-${index}`} className="mr-4">
                          <View className="relative">
                            <Image
                              source={{
                                uri:
                                  imageUri ||
                                  "https://via.placeholder.com/80x80/f9fafb/9ca3af?text=SP",
                              }}
                              style={{ width: 80, height: 80 }}
                              className="rounded-2xl bg-gray-50"
                              contentFit="cover"
                            />
                            {item.quantity > 1 && (
                              <View className="absolute -top-2 -right-2 bg-green-500 rounded-full w-7 h-7 items-center justify-center shadow-lg">
                                <Text className="text-white text-xs font-bold">
                                  {item.quantity}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            className="text-sm font-medium text-gray-700 mt-2 w-20 text-center"
                            numberOfLines={2}
                          >
                            {item.product?.name || "Sản phẩm"}
                          </Text>
                        </View>
                      );
                    })}

                    {order.items.length > 2 && (
                      <View className="items-center">
                        <View className="w-20 h-20 bg-gray-50 rounded-2xl items-center justify-center border-2 border-dashed border-gray-200">
                          <Text className="text-lg font-bold text-gray-400">
                            +{order.items.length - 2}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-500 mt-2">Khác</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          )}

          {/* Payment Info */}
          <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="card-outline" size={20} color="#059669" />
                </View>
                <Text className="text-base font-semibold text-gray-700">
                  Tổng thanh toán
                </Text>
              </View>
              <Text className="text-2xl font-bold text-green-600">
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>

          {/* Delivery Status */}
          {order.status === "SHIPPED" && order.estimatedDelivery && (
            <View className="bg-green-50 rounded-2xl p-4 mb-5 border border-green-100">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                  <Ionicons name="rocket-outline" size={24} color="#047857" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-green-900 mb-1">
                    Đang trên đường giao hàng
                  </Text>
                  <Text className="text-sm text-green-700">
                    Dự kiến giao: {formatDate(order.estimatedDelivery)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            {order.status === "PLACED" && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleCancelOrder(order.id);
                }}
                disabled={cancelOrderMutation.isPending}
                className="flex-1 bg-red-600 rounded-2xl py-4 items-center shadow-lg shadow-red-600/25"
                activeOpacity={0.85}
                style={{
                  opacity: cancelOrderMutation.isPending ? 0.6 : 1,
                }}
              >
                <View className="flex-row items-center">
                  {cancelOrderMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="close-circle-outline" size={20} color="white" />
                  )}
                  <Text className="text-white font-bold text-base ml-2">
                    {cancelOrderMutation.isPending ? "Đang hủy..." : "Hủy đơn"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {order.status === "FAILED" && (
              <TouchableOpacity
                onPress={async (e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  try {
                    await ordersApi.createOrderPayment(Number(order.id));
                    Alert.alert("Đã tạo yêu cầu", "Đã tạo yêu cầu thanh toán lại");
                    queryClient.invalidateQueries({ queryKey: ["orders"] });
                  } catch (err: any) {
                    Alert.alert("Lỗi", err?.message || "Không thể tạo thanh toán");
                  }
                }}
                className="flex-1 bg-green-700 rounded-2xl py-4 items-center shadow-lg shadow-green-700/25"
                activeOpacity={0.85}
              >
                <View className="flex-row items-center">
                  <Ionicons name="repeat-outline" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Mua lại
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {order.status === "COMPLETED" && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(app)/(tabs)/catalog");
                }}
                className="flex-1 bg-green-700 rounded-2xl py-4 items-center shadow-lg shadow-green-700/25"
                activeOpacity={0.85}
              >
                <View className="flex-row items-center">
                  <Ionicons name="repeat-outline" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Mua lại
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Enhanced Apple-style skeleton loader
  const renderLoadingSkeleton = () => (
    <View className="mx-4 mb-4">
      <View className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5">
        {/* Header skeleton */}
        <View className="mb-5">
          <View className="flex-row items-center mb-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <View className="ml-3">
              <Skeleton className="h-7 w-24 rounded-full" />
            </View>
          </View>
          <View className="flex-row items-center">
            <Skeleton className="h-4 w-24 rounded" />
            <View className="ml-4">
              <Skeleton className="h-4 w-40 rounded" />
            </View>
          </View>
        </View>

        {/* Products section skeleton */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </View>
          <View className="flex-row">
            <Skeleton className="w-20 h-20 rounded-2xl mr-4" />
            <Skeleton className="w-20 h-20 rounded-2xl mr-4" />
            <Skeleton className="w-20 h-20 rounded-2xl" />
          </View>
        </View>

        {/* Payment info skeleton */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Skeleton className="w-10 h-10 rounded-full mr-3" />
              <Skeleton className="h-5 w-24 rounded" />
            </View>
            <Skeleton className="h-7 w-20 rounded" />
          </View>
        </View>

        {/* Action buttons skeleton */}
        <View className="flex-row space-x-3">
          <Skeleton className="flex-1 h-14 rounded-2xl" />
          <Skeleton className="flex-1 h-14 rounded-2xl" />
        </View>
      </View>
    </View>
  );

  // Enhanced filter chip component
  const renderFilterChip = ({ item: chip }: { item: any }) => {
    const isActive = activeTab === chip.id;
    const animatedStyle = {
      transform: [
        { scale: chipAnimations[chip.id as keyof typeof chipAnimations] },
      ],
    };

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={() => handleTabPress(chip.id)}
          className={`mr-3 px-4 py-3 rounded-2xl border-2 ${isActive
            ? "bg-white border-green-500 shadow-lg shadow-green-500/25"
            : "bg-gray-50 border-gray-200"
            }`}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${isActive ? "bg-green-100" : "bg-gray-100"
                }`}
            >
              <Ionicons
                name={chip.icon as any}
                size={16}
                color={isActive ? "#047857" : "#6b7280"}
              />
            </View>
            <View>
              <Text
                className={`font-semibold ${isActive ? "text-green-600" : "text-gray-600"
                  }`}
              >
                {chip.label}
              </Text>
              {chip.count > 0 && (
                <View
                  className={`px-2 py-0.5 rounded-full mt-1 ${isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                  <Text
                    className={`text-xs font-bold ${isActive ? "text-white" : "text-gray-600"
                      }`}
                  >
                    {chip.count}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Enhanced search bar component
  const renderSearchBar = () => {
    const searchHeight = searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 60],
    });

    const searchOpacity = searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={{ maxHeight: searchHeight, opacity: searchOpacity }}
        className="mx-4 mb-4 overflow-hidden"
      >
        <View className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-row items-center px-4">
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            placeholder="Tìm kiếm theo mã đơn hàng (VD: ORD-30)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-base text-gray-900"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="ml-2 w-6 h-6 bg-gray-100 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={14} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  // Show login prompt if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <View className="flex-1 justify-center pt-12">
          <EmptyState
            icon="person-outline"
            title="Yêu cầu đăng nhập"
            description="Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn"
            actionLabel="Đăng nhập ngay"
            onActionPress={() => router.push("/(public)/auth/login")}
          />
        </View>
      </View>
    );
  }

  // Show loading skeleton during initial load
  if (ordersLoading && filteredOrders.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => renderLoadingSkeleton()}
          keyExtractor={(item, index) => `skeleton-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 16,
            paddingBottom: 110,
          }}
        />
      </View>
    );
  }

  // Empty state for no orders
  if (filteredOrders.length === 0 && !ordersLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Enhanced Apple-style header */}
        <View className="bg-white pt-12 pb-6">
          {/* Search toggle button */}
          <View className="px-4 mb-4">
            <TouchableOpacity
              onPress={toggleSearch}
              className="bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons name="search-outline" size={20} color="#6b7280" />
                <Text className="text-gray-600 ml-3 font-medium">
                  Tìm kiếm đơn hàng
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          {renderSearchBar()}

          {/* Filter chips */}
          <View className="px-4">
            <FlatList
              data={filterChips}
              renderItem={renderFilterChip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            />
          </View>
        </View>

        <View className="flex-1 justify-center">
          <EmptyState
            icon="receipt-outline"
            title={
              selectedDate || debouncedSearch
                ? "Không tìm thấy đơn hàng"
                : "Chưa có đơn hàng"
            }
            description={
              selectedDate
                ? `Không tìm thấy đơn hàng vào ngày ${formatDateForDisplay(selectedDate)}`
                : debouncedSearch
                  ? `Không tìm thấy đơn hàng với mã "${debouncedSearch}"`
                  : activeTab === "placed"
                    ? "Bạn không có đơn hàng nào vừa đặt"
                    : activeTab === "failed"
                      ? "Bạn không có đơn hàng nào thất bại"
                      : activeTab === "packed"
                        ? "Bạn không có đơn hàng nào đang đóng gói"
                        : activeTab === "shipped"
                          ? "Bạn không có đơn hàng nào đang giao"
                          : activeTab === "delivered"
                            ? "Bạn không có đơn hàng nào đã hoàn thành"
                            : activeTab === "cancelled"
                              ? "Bạn không có đơn hàng nào đã hủy"
                              : "Hãy bắt đầu mua sắm những sản phẩm nông sản tươi ngon!"
            }
            actionLabel={
              selectedDate || debouncedSearch
                ? "Xóa bộ lọc"
                : "Khám phá sản phẩm"
            }
            onActionPress={() => {
              if (selectedDate || debouncedSearch) {
                if (selectedDate) handleClearDate();
                if (debouncedSearch) setSearchQuery("");
              } else {
                router.push("/(app)/(tabs)/catalog");
              }
            }}
          />
        </View>
      </View>
    );
  }

  // Main orders list view
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Enhanced Apple-style header */}
      <View className="bg-white pt-12 pb-6">
        {/* Search and Date filter buttons */}
        <View className="px-4 mb-4 flex-row gap-3">
          <TouchableOpacity
            onPress={toggleSearch}
            className="flex-1 bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="search-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3 font-medium">
                Tìm kiếm đơn hàng
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowDatePicker(true);
              setTempDate(selectedDate || "");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className={`rounded-2xl p-4 flex-row items-center ${selectedDate ? "bg-green-100" : "bg-gray-50"
              }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={selectedDate ? "#047857" : "#6b7280"}
            />
            {selectedDate && (
              <Text className="text-green-700 ml-2 font-medium text-xs">
                {formatDateForDisplay(selectedDate)}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Selected date indicator */}
        {selectedDate && (
          <View className="px-4 mb-2">
            <TouchableOpacity
              onPress={handleClearDate}
              className="bg-green-50 rounded-xl px-3 py-2 flex-row items-center self-start"
              activeOpacity={0.7}
            >
              <Text className="text-green-700 text-sm font-medium">
                Ngày: {formatDateForDisplay(selectedDate)}
              </Text>
              <Ionicons
                name="close-circle"
                size={16}
                color="#047857"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Search bar */}
        {renderSearchBar()}

        {/* Filter chips */}
        <View className="px-4">
          <FlatList
            data={filterChips}
            renderItem={renderFilterChip}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>
      </View>

      {/* Orders list */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#047857"]}
            tintColor="#047857"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => {
          if (isFetchingNextPage) {
            return (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#047857" />
                <Text className="text-sm text-gray-500 mt-2">
                  Đang tải thêm...
                </Text>
              </View>
            );
          }
          if (!hasNextPage && filteredOrders.length > 5) {
            return (
              <View className="py-6 items-center">
                <Text className="text-sm text-gray-500">
                  Đã hiển thị tất cả đơn hàng
                </Text>
              </View>
            );
          }
          return null;
        }}
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: 110,
        }}
      />

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Chọn ngày
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-gray-600 mb-4">
              Nhập ngày theo định dạng YYYY-MM-DD (ví dụ: 2025-11-09)
            </Text>

            <TextInput
              placeholder="2025-11-09"
              value={tempDate}
              onChangeText={setTempDate}
              className="bg-gray-50 rounded-xl p-4 text-base text-gray-900 mb-4 border border-gray-200"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleClearDate}
                className="flex-1 bg-gray-100 rounded-xl py-4 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold">Xóa bộ lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDateSelect}
                className="flex-1 bg-green-600 rounded-xl py-4 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">Áp dụng</Text>
              </TouchableOpacity>
            </View>

            {/* Quick date buttons */}
            <View className="mt-6 pt-6 border-t border-gray-200">
              <Text className="text-sm text-gray-600 mb-3 font-medium">
                Chọn nhanh:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { label: "Hôm nay", days: 0 },
                  { label: "Hôm qua", days: -1 },
                  { label: "7 ngày trước", days: -7 },
                  { label: "30 ngày trước", days: -30 },
                ].map((option) => {
                  const date = new Date();
                  date.setDate(date.getDate() + option.days);
                  const dateStr = date.toISOString().split("T")[0];
                  return (
                    <TouchableOpacity
                      key={option.label}
                      onPress={() => {
                        setTempDate(dateStr);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200"
                      activeOpacity={0.7}
                    >
                      <Text className="text-gray-700 text-sm font-medium">
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
