import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Button } from "../../../src/shared/ui";
import { useOrderDetail } from "../../../src/features/order/hooks/useOrderDetail";
import { useOrderStatusUpdates } from "../../../src/features/order/hooks/useOrderStatusUpdates";
import {
  OrderHeaderCard,
  OrderItemCard,
  ShippingAddressCard,
} from "../../../src/features/order/components";
import type { Order } from "../../../src/types";

export default function OrderDetailScreen() {
  const { id, status: statusParam } = useLocalSearchParams<{ id: string; status?: Order["status"] }>();
  const { order, isLoading, error, refreshing, onRefresh } = useOrderDetail(id);
  useOrderStatusUpdates({ orderId: id });
  const displayStatus = (statusParam as Order["status"]) || order?.status;
  const orderForDisplay = order ? { ...order, status: displayStatus || order.status } : order;

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
        <OrderHeaderCard order={orderForDisplay!} />

        <View className="mx-4 mt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Sản phẩm</Text>
          {order.items.map((item) => (
            <OrderItemCard key={item.id} item={item} />
          ))}
        </View>

        <View className="mx-4 mt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Địa chỉ giao hàng</Text>
          <ShippingAddressCard address={order.shippingAddress} />
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

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

