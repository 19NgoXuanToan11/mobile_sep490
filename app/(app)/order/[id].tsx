import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  Button,
  Card,
  Badge,
  Skeleton,
} from "../../../src/shared/ui";
import { ordersApi } from "../../../src/shared/data/api";
import { useAuth } from "../../../src/shared/hooks";
import {
  formatCurrency,
  formatDate,
} from "../../../src/shared/lib/utils";
import { Order } from "../../../src/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Interface for full backend order response
interface FullOrderDetail {
  orderId: number;
  totalPrice: number;
  shippingAddress: string;
  status: number;
  createdAt: string;
  customerId: number;
  customer?: {
    accountId: number;
    email: string;
    role: number;
    status: number;
    createdAt: string;
    updatedAt: string;
  };
  orderDetails?: Array<{
    orderDetailId: number;
    quantity: number;
    unitPrice: number;
    orderId: number;
    productId: number;
    product?: {
      productId: number;
      productName: string;
      images: string;
      price: number;
      stockQuantity: number;
      description: string;
      status: number;
      createdAt: string;
      updatedAt: string;
      categoryId: number;
    };
  }>;
  payments?: Array<any>;
}

// Status info mapping
const getStatusInfo = (status: Order["status"]) => {
  switch (status) {
    case "PLACED":
      return {
        text: "Đã đặt hàng",
        color: "#f59e0b",
        bgColor: "#fffbeb",
        borderColor: "#fbbf24",
        icon: "receipt-outline",
      };
    case "CONFIRMED":
      return {
        text: "Đã xác nhận",
        color: "#047857",
        bgColor: "#ecfdf5",
        borderColor: "#10b981",
        icon: "checkmark-done-outline",
      };
    case "PACKED":
      return {
        text: "Đã đóng gói",
        color: "#8b5cf6",
        bgColor: "#f5f3ff",
        borderColor: "#a78bfa",
        icon: "cube-outline",
      };
    case "SHIPPED":
      return {
        text: "Đang giao hàng",
        color: "#06b6d4",
        bgColor: "#ecfeff",
        borderColor: "#22d3ee",
        icon: "car-outline",
      };
    case "DELIVERED":
      return {
        text: "Đã giao hàng",
        color: "#10b981",
        bgColor: "#ecfdf5",
        borderColor: "#34d399",
        icon: "checkmark-circle-outline",
      };
    case "CANCELLED":
      return {
        text: "Đã hủy",
        color: "#ef4444",
        bgColor: "#fef2f2",
        borderColor: "#f87171",
        icon: "close-circle-outline",
      };
    default:
      return {
        text: status,
        color: "#6b7280",
        bgColor: "#f9fafb",
        borderColor: "#d1d5db",
        icon: "ellipse-outline",
      };
  }
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

  const {
    data: fullOrderResponse,
  } = useQuery({
    queryKey: ["order-full", id],
    queryFn: () => ordersApi.getFullDetailById(id!),
    enabled: !!id,
  });

  const order = orderResponse?.data;
  const fullOrderData: FullOrderDetail | null = fullOrderResponse?.data ?? null;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const statusInfo = order ? getStatusInfo(order.status) : null;

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="mt-4 text-xl font-bold text-gray-900">
            Không tìm thấy đơn hàng
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            Đơn hàng không tồn tại hoặc đã bị xóa
          </Text>
          <Button
            title="Quay lại"
            onPress={() => router.back()}
            className="mt-6"
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Chi tiết đơn hàng</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Order Header Card */}
        <View className="bg-white mx-4 mt-4 rounded-3xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {order.orderNumber}
              </Text>
              <Text className="text-sm text-gray-500">
                Ngày đặt: {formatDate(order.createdAt, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            {statusInfo && (
              <View
                className="px-4 py-2 rounded-full flex-row items-center"
                style={{
                  backgroundColor: statusInfo.bgColor,
                  borderWidth: 1,
                  borderColor: statusInfo.borderColor,
                }}
              >
                <Ionicons
                  name={statusInfo.icon as any}
                  size={18}
                  color={statusInfo.color}
                />
                <Text
                  className="ml-2 font-semibold text-sm"
                  style={{ color: statusInfo.color }}
                >
                  {statusInfo.text}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Sản phẩm</Text>
          {order.items.map((item, index) => (
            <View
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
            >
              <View className="flex-row">
                {item.product.images && item.product.images.length > 0 ? (
                  <Image
                    source={{ uri: item.product.images[0] }}
                    className="w-20 h-20 rounded-xl"
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-xl bg-gray-200 items-center justify-center">
                    <Ionicons name="image-outline" size={32} color="#9ca3af" />
                  </View>
                )}
                <View className="flex-1 ml-4">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {item.product.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mb-2">
                    Số lượng: {item.quantity}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-bold text-green-600">
                      {formatCurrency(item.price)}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Tổng: {formatCurrency(item.subtotal)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Địa chỉ giao hàng</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-start mb-3">
              <Ionicons name="person-outline" size={20} color="#10b981" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {order.shippingAddress.customerName || "Không có tên"}
                </Text>
              </View>
            </View>
            {order.shippingAddress.phoneNumber && (
              <TouchableOpacity
                onPress={() => handleCall(order.shippingAddress.phoneNumber)}
                className="flex-row items-center mb-3"
              >
                <Ionicons name="call-outline" size={20} color="#10b981" />
                <Text className="ml-3 text-base text-blue-600">
                  {order.shippingAddress.phoneNumber}
                </Text>
              </TouchableOpacity>
            )}
            <View className="flex-row items-start">
              <Ionicons name="location-outline" size={20} color="#10b981" />
              <View className="ml-3 flex-1">
                <Text className="text-base text-gray-700 leading-5">
                  {order.shippingAddress.street || "Không có địa chỉ"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {order.trackingNumber && (
          <View className="mx-4 mt-4 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Mã vận đơn</Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-base font-mono text-gray-700">
                {order.trackingNumber}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

