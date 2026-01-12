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
  EmptyState,
  Button,
  Skeleton,
} from "../../../src/shared/ui";
import FeedbackFormModal from "../../../src/shared/ui/feedback-form-modal";
import { ordersApi, productsApi } from "../../../src/shared/data/api";
import { FeedbackService } from "../../../src/api/services/FeedbackService";
import { useToast } from "../../../src/shared/ui/toast";
import { useLocalization, useAuth, useCart } from "../../../src/shared/hooks";
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
} from "../../../src/shared/lib/utils";
import { Order } from "../../../src/types";
import { useOrderStatusUpdates } from "../../../src/features/order/hooks/useOrderStatusUpdates";
import { openPayment } from "../../../src/services/payment/vnpay";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const { addItem, loadItems } = useCart();
  const queryClient = useQueryClient();
  useOrderStatusUpdates({ enableToast: false });
  const [activeTab, setActiveTab] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [repurchaseOrderId, setRepurchaseOrderId] = useState<string | null>(null);
  const [repayOrderId, setRepayOrderId] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState<Order | null>(null);
  const [selectedOrderDetailId, setSelectedOrderDetailId] = useState<number | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const toast = useToast();

  const searchAnimation = new Animated.Value(0);
  const chipAnimations = {
    all: new Animated.Value(1),
    placed: new Animated.Value(0.8),
    confirmed: new Animated.Value(0.8),
    shipped: new Animated.Value(0.8),
    delivered: new Animated.Value(0.8),
    failed: new Animated.Value(0.8),
    cancelled: new Animated.Value(0.8),
  };

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
    }
  }, [isAuthenticated, isLoading]);

  const getStatusFilter = () => {
    switch (activeTab) {
      case "placed":
        return "0";
      case "confirmed":
        return "1";
      case "failed":
        return "2";
      case "shipped":
        return "6";
      case "delivered":
        return "5";
      case "cancelled":
        return "4";
      default:
        return undefined;
    }
  };

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
    queryFn: async ({ pageParam = 1 }) => {
      const statusParam = getStatusFilter();
      if (selectedDate) {
        const res = await ordersApi.getByDate({
          date: selectedDate,
          pageIndex: pageParam,
          pageSize: 15,
        });
        const count =
          Array.isArray(res.data) ? res.data.length : res.data?.orders?.length ?? 0;
        return res;
      }

      const res = await ordersApi.getAll({
        pageIndex: pageParam,
        pageSize: 15,
        status: statusParam,
      });
      try {
        const ordersList = res.data?.orders ?? [];
      } catch (e) {
      }
      const returnedCount = (res.data?.orders ?? []).length;
      if (statusParam === "0" && returnedCount === 0) {
        const resAll = await ordersApi.getAll({
          pageIndex: pageParam,
          pageSize: 15,
        });
        const allOrders = resAll.data?.orders ?? [];
        const placedOrders = allOrders.filter((o: any) => (o.status === "PLACED" || o.status === "PENDING"));
        return {
          success: true,
          data: { orders: placedOrders, totalCount: placedOrders.length, hasNextPage: false },
        } as any;
      }
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.success && lastPage.data.hasNextPage) {
        return pages.length + 1;
      }
      return undefined;
    },
    enabled: isAuthenticated,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const orders =
    data?.pages.flatMap((page) => (page.success ? page.data.orders : [])) ?? [];

  const filteredOrders = useMemo(() => {
    if (!debouncedSearch) return orders;
    return orders.filter((order) =>
      order.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [orders, debouncedSearch]);

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
      useNativeDriver: false,
    }).start();

    if (!showSearch) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setSearchQuery("");
    }
  }, [showSearch, searchAnimation]);

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
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

  const createFeedbackMutation = useMutation({
    mutationFn: async (data: { comment: string; rating: number | null; orderDetailId: number }) => {
      if (!user?.id) {
        throw new Error("User not logged in");
      }
      return await FeedbackService.postApiV1FeedbackCreateFeedback({
        requestBody: {
          comment: data.comment,
          rating: data.rating,
          orderDetailId: data.orderDetailId,
        },
      });
    },
    onSuccess: () => {
      toast.success("Đánh giá thành công", "Cảm ơn bạn đã đánh giá sản phẩm!");
      setShowFeedbackForm(false);
      setSelectedOrderDetailId(null);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Không thể gửi đánh giá. Vui lòng thử lại.";
      toast.error("Lỗi", errorMessage);
    },
  });

  const handleOpenFeedback = useCallback(async (order: Order) => {
    if (order.status !== "COMPLETED") {
      toast.error("Không thể đánh giá", "Chỉ có thể đánh giá đơn hàng đã hoàn thành");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const orderDetailResult = await ordersApi.getById(order.id);
      if (orderDetailResult.success && orderDetailResult.data) {
        setSelectedOrderForFeedback(orderDetailResult.data);
        setShowFeedbackModal(true);
      } else {
        toast.error("Lỗi", "Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Lỗi", "Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
    }
  }, [toast]);

  const handleSelectProductToReview = useCallback((orderDetailId: number) => {
    if (!orderDetailId || orderDetailId === 0) {
      toast.error("Lỗi", "Không tìm thấy thông tin đơn hàng chi tiết");
      return;
    }
    setSelectedOrderDetailId(orderDetailId);
    setShowFeedbackModal(false);
    setShowFeedbackForm(true);
  }, [toast]);

  const handleSubmitFeedback = async (data: { comment: string; rating: number | null }) => {
    if (!selectedOrderDetailId || selectedOrderDetailId === 0) {
      toast.error("Lỗi", "Không tìm thấy thông tin đơn hàng");
      return;
    }
    try {
      await createFeedbackMutation.mutateAsync({
        ...data,
        orderDetailId: selectedOrderDetailId,
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

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

  const waitForAcknowledgement = useCallback(
    (title: string, message: string) =>
      new Promise<void>((resolve) => {
        Alert.alert(title, message, [{ text: "Đã hiểu", onPress: () => resolve() }], {
          cancelable: false,
        });
      }),
    []
  );

  const precheckOrderItems = useCallback(async (order: Order) => {
    const blockingIssues: string[] = [];
    const warnings: string[] = [];
    const sanitizedItems: Array<{ productId: string; quantity: number; name: string }> =
      [];

    await Promise.all(
      order.items.map(async (item) => {
        try {
          const response = await productsApi.getById(item.productId);
          const product = response?.data;

          if (!response?.success || !product) {
            blockingIssues.push(
              `${item.product?.name || "Sản phẩm"} không còn khả dụng trong kho.`
            );
            return;
          }

          if (!product.isInStock || product.stock <= 0) {
            blockingIssues.push(`${product.name} hiện đã hết hàng.`);
            return;
          }

          const permittedQuantity = Math.min(item.quantity, product.stock);
          if (permittedQuantity < item.quantity) {
            blockingIssues.push(
              `${product.name} chỉ còn ${permittedQuantity} sản phẩm, vui lòng điều chỉnh số lượng.`
            );
            return;
          }

          if (product.price !== item.price) {
            warnings.push(
              `${product.name}: ${formatCurrency(item.price)} → ${formatCurrency(
                product.price
              )}`
            );
          }

          sanitizedItems.push({
            productId: String(product.id ?? item.productId),
            quantity: permittedQuantity,
            name: product.name,
          });
        } catch (error) {
          blockingIssues.push(
            `${item.product?.name || "Sản phẩm"} tạm thời không thể kiểm tra.`
          );
        }
      })
    );

    return { blockingIssues, warnings, sanitizedItems };
  }, []);

  const handleRepurchase = useCallback(
    async (order: Order) => {
      if (!order.items.length) {
        Alert.alert("Không thể mua lại", "Đơn hàng không có sản phẩm hợp lệ.");
        return;
      }

      setRepurchaseOrderId(order.id);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const { blockingIssues, warnings, sanitizedItems } = await precheckOrderItems(order);

        if (blockingIssues.length) {
          Alert.alert(
            "Không thể mua lại",
            `Vui lòng kiểm tra lại:\n• ${blockingIssues.join("\n• ")}`
          );
          return;
        }

        if (!sanitizedItems.length) {
          Alert.alert(
            "Không có sản phẩm khả dụng",
            "Tất cả sản phẩm trong đơn cũ đã hết hàng hoặc không còn bán."
          );
          return;
        }

        if (warnings.length) {
          const shouldContinue = await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Giá đã thay đổi",
              `Một số sản phẩm đã cập nhật giá và sẽ áp dụng giá mới trong giỏ hàng:\n• ${warnings.join(
                "\n• "
              )}`,
              [
                {
                  text: "Hủy",
                  style: "cancel",
                  onPress: () => resolve(false),
                },
                {
                  text: "Tiếp tục",
                  onPress: () => resolve(true),
                },
              ]
            );
          });

          if (!shouldContinue) {
            return;
          }
        }

        const response = await ordersApi.buyAgain(Number(order.id));

        if (!response.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            "Không thể mua lại",
            response.message || "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau."
          );
          return;
        }

        await loadItems();

        queryClient.invalidateQueries({ queryKey: ["orders"] });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          "Thành công",
          "Đã thêm tất cả sản phẩm vào giỏ hàng thành công",
          [
            {
              text: "Xem giỏ hàng",
              onPress: () => {
                router.push("/(app)/(tabs)/cart");
              },
            },
            {
              text: "Ở lại",
              style: "cancel",
            },
          ]
        );
      } catch (error: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        const errorMessage =
          error?.response?.data?.message ??
          error?.body?.message ??
          error?.message ??
          "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.";

        Alert.alert("Không thể mua lại", errorMessage);
      } finally {
        setRepurchaseOrderId(null);
      }
    },
    [loadItems, precheckOrderItems, queryClient]
  );

  const handleRepay = useCallback(
    async (order: Order) => {
      setRepayOrderId(order.id);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const response = await ordersApi.createOrderPayment(Number(order.id));

        if (!response.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            "Lỗi thanh toán",
            response.message || "Không thể tạo phiên thanh toán. Vui lòng thử lại sau."
          );
          return;
        }

        const paymentUrl = response.data?.paymentUrl;

        if (!paymentUrl) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            "Lỗi thanh toán",
            "Không nhận được URL thanh toán. Vui lòng thử lại sau."
          );
          return;
        }

        await openPayment(paymentUrl, Number(order.id));

        queryClient.invalidateQueries({ queryKey: ["orders"] });
      } catch (error: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        const errorMessage =
          error?.response?.data?.message ??
          error?.body?.message ??
          error?.message ??
          "Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại sau.";

        Alert.alert("Lỗi thanh toán", errorMessage);
      } finally {
        setRepayOrderId(null);
      }
    },
    [queryClient]
  );

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
          color: "#dc2626",
          bgColor: "#fee2e2",
          borderColor: "#ef4444",
          icon: "close-circle-outline",
          gradient: ["#ef4444", "#dc2626"],
        };
      case "CONFIRMED":
        return {
          text: "Xác nhận",
          color: "#0ea5a4",
          bgColor: "#ecfeff",
          borderColor: "#2dd4bf",
          icon: "checkmark-done-outline",
          gradient: ["#06b6d4", "#0ea5a4"],
        };
      case "PACKED":
        return {
          text: "Thất bại",
          color: "#8b5cf6",
          bgColor: "#f5f3ff",
          borderColor: "#a78bfa",
          icon: "cube-outline",
          gradient: ["#a78bfa", "#8b5cf6"],
        };
      case "PENDING":
        return {
          text: "Chưa thanh toán",
          color: "#f59e0b",
          bgColor: "#fffbeb",
          borderColor: "#fbbf24",
          icon: "time-outline",
          gradient: ["#fbbf24", "#f59e0b"],
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
          text: "Đang giao",
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
          text: "Hủy đơn",
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

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

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
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      fetchNextPage();
    }
  };

  const handleTabPress = useCallback(
    (tabId: string) => {
      if (tabId === activeTab) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setActiveTab(tabId);

      Object.keys(chipAnimations).forEach((chipId) => {
        const scale = chipId === tabId ? 1 : 0.85;
        animateChip(chipId, scale);
      });
    },
    [activeTab, animateChip]
  );

  const filterChips = [
    {
      id: "all",
      label: "Tất cả",
      icon: "apps-outline",
      color: "#047857",
      bgColor: "#ecfdf5",
    },
    {
      id: "placed",
      label: "Chưa thanh toán",
      icon: "receipt-outline",
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      id: "confirmed",
      label: "Xác nhận",
      icon: "checkmark-done-outline",
      color: "#047857",
      bgColor: "#ecfdf5",
    },
    {
      id: "shipped",
      label: "Đang giao",
      icon: "car-outline",
      color: "#06b6d4",
      bgColor: "#ecfeff",
    },
    {
      id: "delivered",
      label: "Hoàn thành",
      icon: "checkmark-circle-outline",
      color: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      id: "failed",
      label: "Thất bại",
      icon: "close-circle-outline",
      color: "#ef4444",
      bgColor: "#fef2f2",
    },
    {
      id: "cancelled",
      label: "Hủy đơn",
      icon: "close-circle-outline",
      color: "#ef4444",
      bgColor: "#fef2f2",
    },


  ];

  const renderOrder = useCallback(
    ({ item: order }: { item: Order }) => {
      const statusInfo = getStatusInfo(order.status);

      const orderImages = order.images && order.images.length > 0 ? order.images : [];
      const hasOrderImages = orderImages.length > 0;
      const fallbackItems = order.items.slice(0, 3);
      const remainingCount = hasOrderImages
        ? Math.max(orderImages.length - 3, 0)
        : Math.max(order.items.length - 3, 0);
      const canRepurchase = ["COMPLETED", "CANCELLED"].includes(order.status);
      const canRepay = order.status === "FAILED";
      const canFeedback = order.status === "COMPLETED";

      return (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({
              pathname: "/(app)/track/[id]",
              params: { id: order.id, status: order.status },
            } as any);
          }}
          activeOpacity={0.95}
          className="mx-4 mb-3"
        >
          <View className="bg-white rounded-2xl p-4 shadow-md shadow-black/5 border border-gray-100">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {order.orderNumber}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </Text>
                </View>
              </View>
              <View
                className="px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: statusInfo.bgColor,
                  borderColor: statusInfo.borderColor,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: statusInfo.color }}
                >
                  {statusInfo.text}
                </Text>
              </View>
            </View>

            {(hasOrderImages || fallbackItems.length > 0) && (
              <View className="flex-row items-center mt-3">
                {(hasOrderImages ? orderImages.slice(0, 3) : fallbackItems).map(
                  (entry, index) => {
                    if (hasOrderImages) {
                      const imageUri =
                        (entry as string) ||
                        "https://via.placeholder.com/64x64/f9fafb/9ca3af?text=IMG";
                      return (
                        <View key={`preview-${index}`} className="mr-3">
                          <Image
                            source={{ uri: imageUri }}
                            style={{ width: 56, height: 56 }}
                            className="rounded-xl bg-gray-50"
                            contentFit="cover"
                          />
                        </View>
                      );
                    }

                    const item = entry as Order["items"][number];
                    const imageUri =
                      item.product?.images?.[0] ||
                      "https://via.placeholder.com/64x64/f9fafb/9ca3af?text=SP";
                    return (
                      <View key={`preview-${index}`} className="mr-3">
                        <View className="relative">
                          <Image
                            source={{ uri: imageUri }}
                            style={{ width: 56, height: 56 }}
                            className="rounded-xl bg-gray-50"
                            contentFit="cover"
                          />
                          {item.quantity > 1 && (
                            <View className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full w-6 h-6 items-center justify-center">
                              <Text className="text-white text-[10px] font-bold">
                                {item.quantity}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  }
                )}
                {remainingCount > 0 && (
                  <View className="w-14 h-14 rounded-xl border border-dashed border-gray-200 items-center justify-center">
                    <Text className="text-xs font-semibold text-gray-500">
                      +{remainingCount}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500">
                  {order.itemCount} mặt hàng
                </Text>
              </View>
              <Text className="text-xl font-bold text-gray-900">
                {formatCurrency(order.total)}
              </Text>
            </View>

            {(order.status === "PENDING" || order.status === "SHIPPED") &&
              order.estimatedDelivery && (
                <View className="flex-row items-center mt-3 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                  <Text className="text-xs text-green-800">
                    Dự kiến giao: {formatDate(order.estimatedDelivery)}
                  </Text>
                </View>
              )}

            <View className="flex-row mt-4">
              {["PLACED", "PENDING"].includes(order.status) && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleCancelOrder(order.id);
                  }}
                  disabled={cancelOrderMutation.isPending}
                  className="flex-1 bg-red-600 rounded-2xl py-3 items-center mr-3 shadow-lg shadow-red-600/20"
                  activeOpacity={0.85}
                  style={{
                    opacity: cancelOrderMutation.isPending ? 0.6 : 1,
                  }}
                >
                  <View className="flex-row items-center">
                    {cancelOrderMutation.isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : null}
                    <Text className="text-white font-semibold text-sm">
                      {cancelOrderMutation.isPending ? "Đang hủy..." : "Hủy đơn"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              {canFeedback && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleOpenFeedback(order);
                  }}
                  className="flex-1 rounded-2xl py-3 items-center mr-3 shadow-lg"
                  style={{ backgroundColor: '#607D8B', shadowColor: '#607D8B' }}
                  activeOpacity={0.85}
                >
                  <View className="flex-row items-center">
                    <Text className="text-white font-semibold text-sm">
                      Đánh giá
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              {canRepurchase && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRepurchase(order);
                  }}
                  className="flex-1 bg-green-700 rounded-2xl py-3 items-center shadow-lg shadow-green-700/20"
                  activeOpacity={0.85}
                  style={{
                    opacity: repurchaseOrderId && repurchaseOrderId !== order.id ? 0.6 : 1,
                  }}
                  disabled={
                    Boolean(repurchaseOrderId) && repurchaseOrderId !== order.id
                  }
                >
                  <View className="flex-row items-center">
                    {repurchaseOrderId === order.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : null}
                    <Text className="text-white font-semibold text-sm">
                      Mua lại
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              {canRepay && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRepay(order);
                  }}
                  className="flex-1 bg-green-700 rounded-2xl py-3 items-center shadow-lg shadow-green-700/20"
                  activeOpacity={0.85}
                  style={{
                    opacity: repayOrderId && repayOrderId !== order.id ? 0.6 : 1,
                  }}
                  disabled={
                    Boolean(repayOrderId) && repayOrderId !== order.id
                  }
                >
                  <View className="flex-row items-center">
                    {repayOrderId === order.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : null}
                    <Text className="text-white font-semibold text-sm">
                      Thanh toán lại
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      cancelOrderMutation.isPending,
      handleCancelOrder,
      handleRepurchase,
      repurchaseOrderId,
      handleRepay,
      repayOrderId,
      handleOpenFeedback,
    ]
  );

  const renderLoadingSkeleton = () => (
    <View className="mx-4 mb-4">
      <View className="bg-white rounded-3xl p-6 shadow-lg shadow-black/5">
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

        <View className="bg-gray-50 rounded-2xl p-4 mb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Skeleton className="w-10 h-10 rounded-full mr-3" />
              <Skeleton className="h-5 w-24 rounded" />
            </View>
            <Skeleton className="h-7 w-20 rounded" />
          </View>
        </View>

        <View className="flex-row space-x-3">
          <Skeleton className="flex-1 h-14 rounded-2xl" />
          <Skeleton className="flex-1 h-14 rounded-2xl" />
        </View>
      </View>
    </View>
  );

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
            <Text
              className={`font-semibold ${isActive ? "text-green-600" : "text-gray-600"
                }`}
            >
              {chip.label}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
          <TextInput
            placeholder="Tìm kiếm theo mã đơn hàng (VD: ORD-30)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-base text-gray-900"
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
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

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

  if (filteredOrders.length === 0 && !ordersLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <View className="bg-white pt-12 pb-6">
          <View className="px-4 mb-4">
            <TouchableOpacity
              onPress={toggleSearch}
              className="bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-gray-600 font-medium">
                  Tìm kiếm đơn hàng
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {renderSearchBar()}

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

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View className="bg-white pt-12 pb-6">
        <View className="px-4 mb-4 flex-row gap-3">
          <TouchableOpacity
            onPress={toggleSearch}
            className="flex-1 bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-medium">
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
            </TouchableOpacity>
          </View>
        )}

        {renderSearchBar()}

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

      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: 400,
          offset: 400 * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
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

      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowFeedbackModal(false);
          setSelectedOrderForFeedback(null);
        }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-8 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Đánh giá sản phẩm
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowFeedbackModal(false);
                  setSelectedOrderForFeedback(null);
                }}
                className="p-2"
              >
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-gray-600 mb-4">
              Chọn sản phẩm bạn muốn đánh giá:
            </Text>

            <FlatList
              data={selectedOrderForFeedback?.items || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const orderDetailId = parseInt(item.id, 10);
                return (
                  <TouchableOpacity
                    onPress={() => handleSelectProductToReview(orderDetailId)}
                    className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{
                        uri: item.product?.images?.[0] || "https://via.placeholder.com/64x64",
                      }}
                      style={{ width: 64, height: 64 }}
                      className="rounded-xl bg-gray-200"
                      contentFit="cover"
                    />
                    <View className="flex-1 ml-4">
                      <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
                        {item.product?.name || "Sản phẩm"}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        Số lượng: {item.quantity}
                      </Text>
                      <Text className="text-sm font-semibold text-green-600 mt-1">
                        {formatCurrency(item.price * item.quantity)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <FeedbackFormModal
        visible={showFeedbackForm}
        onClose={() => {
          setShowFeedbackForm(false);
          setSelectedOrderDetailId(null);
        }}
        onSubmit={handleSubmitFeedback}
        submitting={createFeedbackMutation.isPending}
      />
    </View>
  );
}
