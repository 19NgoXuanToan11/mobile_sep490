import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, Badge, EmptyState } from "../../../src/shared/ui";
import { ordersApi } from "../../../src/shared/data/api";
import { useLocalization } from "../../../src/shared/hooks";
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
} from "../../../src/shared/lib/utils";
import { OrderStatus } from "../../../src/types";

const StatusTimeline: React.FC<{
  statusHistory: OrderStatus[];
  currentStatus: string;
}> = ({ statusHistory, currentStatus }) => {
  const getStatusInfo = (status: OrderStatus["status"]) => {
    switch (status) {
      case "PLACED":
        return {
          text: "Đã đặt hàng",
          icon: "receipt-outline",
          color: "#f59e0b",
        };
      case "CONFIRMED":
        return {
          text: "Xác nhận",
          icon: "checkmark-done-outline",
          color: "#3b82f6",
        };
      case "PACKED":
        return { text: "Đóng gói", icon: "cube-outline", color: "#8b5cf6" };
      case "SHIPPED":
        return { text: "Đang giao", icon: "car-outline", color: "#06b6d4" };
      case "DELIVERED":
        return {
          text: "Đã giao",
          icon: "checkmark-circle-outline",
          color: "#22c55e",
        };
      case "CANCELLED":
        return {
          text: "Đã hủy",
          icon: "close-circle-outline",
          color: "#ef4444",
        };
      default:
        return { text: status, icon: "ellipse-outline", color: "#6b7280" };
    }
  };

  const statusOrder = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-neutral-900">
        Theo Dõi Đơn Hàng
      </Text>

      <View className="space-y-4">
        {statusHistory.map((status, index) => {
          const statusInfo = getStatusInfo(status.status);
          const isActive = index === 0; // Latest status is active
          const isCompleted =
            statusOrder.indexOf(status.status) <= currentIndex;

          return (
            <View key={status.id} className="flex-row items-start space-x-4">
              <View className="relative items-center">
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
                    isActive
                      ? "border-primary-500 bg-primary-50"
                      : isCompleted
                      ? "border-primary-300 bg-primary-100"
                      : "border-neutral-200 bg-neutral-50"
                  }`}
                >
                  <Ionicons
                    name={statusInfo.icon as any}
                    size={24}
                    color={isActive || isCompleted ? "#00623A" : "#9ca3af"}
                  />
                </View>

                {index < statusHistory.length - 1 && (
                  <View
                    className={`absolute top-12 w-0.5 h-8 ${
                      isCompleted ? "bg-primary-300" : "bg-neutral-200"
                    }`}
                  />
                )}
              </View>

              <View className="flex-1 space-y-2">
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`font-semibold text-base ${
                      isActive ? "text-primary-600" : "text-neutral-900"
                    }`}
                  >
                    {statusInfo.text}
                  </Text>
                  <Text className="text-sm text-neutral-500">
                    {formatDate(status.timestamp)}
                  </Text>
                </View>

                <Text className="text-sm text-neutral-600 leading-5">
                  {status.description}
                </Text>

                {isActive && (
                  <View className="bg-primary-50 p-3 rounded-xl">
                    <View className="flex-row items-center space-x-2">
                      <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color="#00623A"
                      />
                      <Text className="text-sm text-primary-700 font-medium flex-1">
                        {status.status === "SHIPPED"
                          ? "Đơn hàng đang trên đường giao đến bạn"
                          : status.status === "PACKED"
                          ? "Đơn hàng đang được chuẩn bị"
                          : status.status === "CONFIRMED"
                          ? "Đơn hàng đã được xác nhận"
                          : "Cảm ơn bạn đã đặt hàng"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const TrackingMap: React.FC<{ trackingNumber?: string; status: string }> = ({
  trackingNumber,
  status,
}) => {
  return (
    <Card variant="elevated" padding="lg">
      <View className="space-y-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="location-outline" size={20} color="#00623A" />
            <Text className="text-lg font-semibold text-neutral-900">
              Theo Dõi Realtime
            </Text>
          </View>
          {trackingNumber && (
            <Badge text={`#${trackingNumber}`} variant="outline" size="sm" />
          )}
        </View>

        {/* Map Placeholder */}
        <View className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl items-center justify-center relative overflow-hidden">
          <LinearGradient
            colors={["#f0f9f5", "#dcf2e6"]}
            className="absolute inset-0"
          />

          <View className="items-center space-y-3 z-10">
            <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center">
              <Ionicons name="bicycle" size={32} color="white" />
            </View>
            <View className="items-center space-y-1">
              <Text className="font-semibold text-neutral-900">
                Đang Giao Hàng
              </Text>
              <Text className="text-sm text-neutral-600 text-center">
                Tính năng theo dõi realtime sẽ sớm có mặt
              </Text>
            </View>
          </View>

          {/* Animated circles for effect */}
          <View className="absolute top-4 right-4 w-3 h-3 bg-primary-300 rounded-full opacity-60" />
          <View className="absolute bottom-6 left-6 w-2 h-2 bg-primary-400 rounded-full opacity-40" />
        </View>

        {/* Delivery Status */}
        <View className="bg-primary-50 p-4 rounded-xl">
          <View className="flex-row items-center space-x-3">
            <View className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center">
              <Ionicons
                name={
                  status === "SHIPPED"
                    ? "car-sport"
                    : status === "PACKED"
                    ? "cube"
                    : status === "DELIVERED"
                    ? "checkmark-circle"
                    : "time"
                }
                size={20}
                color="white"
              />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-primary-900">
                {status === "SHIPPED"
                  ? "Đang trên đường giao"
                  : status === "PACKED"
                  ? "Đang chuẩn bị hàng"
                  : status === "DELIVERED"
                  ? "Đã giao thành công"
                  : "Đang xử lý"}
              </Text>
              <Text className="text-sm text-primary-700">
                {status === "SHIPPED"
                  ? "Dự kiến giao: 14:30 - 16:30 hôm nay"
                  : status === "PACKED"
                  ? "Hàng sẽ sớm được giao cho đơn vị vận chuyển"
                  : status === "DELIVERED"
                  ? "Cảm ơn bạn đã tin tưởng chúng tôi!"
                  : "Chúng tôi đang xử lý đơn hàng của bạn"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { t } = useLocalization();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getById(orderId!).then((res) => res.data),
    enabled: !!orderId,
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PLACED":
        return { text: "Đã đặt hàng", color: "#f59e0b", bgColor: "#fef3c7" };
      case "CONFIRMED":
        return { text: "Xác nhận", color: "#3b82f6", bgColor: "#dbeafe" };
      case "PACKED":
        return { text: "Đóng gói", color: "#8b5cf6", bgColor: "#ede9fe" };
      case "SHIPPED":
        return { text: "Đang giao", color: "#06b6d4", bgColor: "#cffafe" };
      case "DELIVERED":
        return { text: "Đã giao", color: "#22c55e", bgColor: "#dcfce7" };
      case "CANCELLED":
        return { text: "Đã hủy", color: "#ef4444", bgColor: "#fee2e2" };
      default:
        return { text: status, color: "#6b7280", bgColor: "#f3f4f6" };
    }
  };

  const handleCallSupport = () => {
    Alert.alert("Liên hệ hỗ trợ", "Bạn có muốn gọi đến tổng đài hỗ trợ?", [
      { text: "Hủy", style: "cancel" },
      { text: "Gọi ngay", onPress: () => console.log("Calling support...") },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <View className="items-center space-y-4">
          <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center">
            <Ionicons name="time-outline" size={32} color="#00623A" />
          </View>
          <Text className="text-lg font-semibold text-neutral-900">
            Đang tải...
          </Text>
          <Text className="text-neutral-600">Vui lòng chờ trong giây lát</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <EmptyState
          icon="alert-circle-outline"
          title="Không tìm thấy đơn hàng"
          description="Chúng tôi không thể tìm thấy đơn hàng này. Vui lòng kiểm tra lại mã đơn hàng."
          actionLabel="Quay lại"
          onActionPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View className="bg-white shadow-sm border-b border-neutral-100">
        <View className="px-4 py-3 flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-neutral-900">
              Đơn hàng #{order.orderNumber}
            </Text>
            <Text className="text-sm text-neutral-600">
              {formatDate(order.createdAt)}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCallSupport}>
            <Ionicons name="headset-outline" size={24} color="#00623A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="p-4 space-y-6">
          {/* Order Status Header */}
          <Card variant="elevated" padding="lg">
            <View className="items-center space-y-4">
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: statusInfo.bgColor }}
              >
                <Ionicons
                  name={
                    order.status === "DELIVERED"
                      ? "checkmark-circle"
                      : order.status === "SHIPPED"
                      ? "car"
                      : order.status === "PACKED"
                      ? "cube"
                      : order.status === "CONFIRMED"
                      ? "checkmark-done"
                      : "receipt"
                  }
                  size={36}
                  color={statusInfo.color}
                />
              </View>

              <View className="items-center space-y-2">
                <Badge
                  text={statusInfo.text}
                  size="lg"
                  style={{
                    backgroundColor: statusInfo.bgColor,
                  }}
                />

                <Text className="text-2xl font-bold text-primary-600">
                  {formatCurrency(order.total)}
                </Text>

                {order.estimatedDelivery && order.status === "SHIPPED" && (
                  <View className="bg-primary-50 px-4 py-2 rounded-xl">
                    <Text className="text-sm text-primary-700 font-medium">
                      Dự kiến giao: {formatDate(order.estimatedDelivery)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>

          {/* Live Tracking Map */}
          {(order.status === "SHIPPED" ||
            order.status === "PACKED" ||
            order.status === "DELIVERED") && (
            <TrackingMap
              trackingNumber={order.trackingNumber}
              status={order.status}
            />
          )}

          {/* Status Timeline */}
          <Card variant="elevated" padding="lg">
            <StatusTimeline
              statusHistory={order.statusHistory}
              currentStatus={order.status}
            />
          </Card>

          {/* Order Items */}
          <Card variant="elevated" padding="lg">
            <View className="space-y-4">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="basket-outline" size={20} color="#00623A" />
                <Text className="text-lg font-semibold text-neutral-900">
                  Sản Phẩm ({order.itemCount} món)
                </Text>
              </View>

              <View className="space-y-4">
                {order.items.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row space-x-3 p-3 bg-neutral-50 rounded-xl"
                  >
                    <Image
                      source={{ uri: item.product.images[0] }}
                      style={{ width: 60, height: 60 }}
                      className="rounded-xl"
                    />

                    <View className="flex-1 space-y-1">
                      <Text
                        className="font-semibold text-neutral-900"
                        numberOfLines={2}
                      >
                        {item.product.name}
                      </Text>
                      <View className="flex-row items-center space-x-2">
                        <Text className="text-sm text-neutral-600">
                          {item.quantity} × {formatCurrency(item.price)}
                        </Text>
                        {item.product.tags?.includes("organic") && (
                          <Badge text="Hữu cơ" variant="success" size="sm" />
                        )}
                      </View>
                      {item.product.origin && (
                        <View className="flex-row items-center space-x-1">
                          <Ionicons
                            name="location-outline"
                            size={12}
                            color="#6b7280"
                          />
                          <Text className="text-xs text-neutral-500">
                            {item.product.origin}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="font-bold text-neutral-900 text-lg">
                      {formatCurrency(item.subtotal)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          {/* Delivery Address */}
          <Card variant="elevated" padding="lg">
            <View className="space-y-4">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="location-outline" size={20} color="#00623A" />
                <Text className="text-lg font-semibold text-neutral-900">
                  Địa Chỉ Giao Hàng
                </Text>
              </View>

              <View className="bg-neutral-50 p-4 rounded-xl space-y-2">
                <Text className="font-semibold text-neutral-900">
                  {order.shippingAddress.name}
                </Text>
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="call-outline" size={14} color="#6b7280" />
                  <Text className="text-neutral-700">
                    {order.shippingAddress.phone}
                  </Text>
                </View>
                <View className="flex-row items-start space-x-1">
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="#6b7280"
                    className="mt-0.5"
                  />
                  <Text className="text-neutral-700 leading-5 flex-1">
                    {order.shippingAddress.street}, {order.shippingAddress.ward}
                    , {order.shippingAddress.district},{" "}
                    {order.shippingAddress.city}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Payment & Summary */}
          <Card variant="elevated" padding="lg">
            <View className="space-y-4">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="card-outline" size={20} color="#00623A" />
                <Text className="text-lg font-semibold text-neutral-900">
                  Thanh Toán & Chi Tiết
                </Text>
              </View>

              {/* Payment Method */}
              <View className="bg-neutral-50 p-4 rounded-xl">
                <View className="flex-row items-center space-x-3">
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                    <Ionicons
                      name={
                        order.paymentMethod.type === "COD"
                          ? "cash-outline"
                          : "card-outline"
                      }
                      size={20}
                      color="#00623A"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-neutral-900">
                      {order.paymentMethod.name}
                    </Text>
                    <Text className="text-sm text-neutral-600">
                      {order.paymentMethod.description}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Order Summary */}
              <View className="space-y-3 pt-2 border-t border-neutral-200">
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Tạm tính</Text>
                  <Text className="font-medium">
                    {formatCurrency(order.subtotal)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Phí giao hàng</Text>
                  <Text className="font-medium">
                    {order.shippingFee === 0 ? (
                      <Text className="text-success-600">Miễn phí</Text>
                    ) : (
                      formatCurrency(order.shippingFee)
                    )}
                  </Text>
                </View>
                {order.discount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600">Giảm giá</Text>
                    <Text className="text-success-600 font-medium">
                      -{formatCurrency(order.discount)}
                    </Text>
                  </View>
                )}
                <View className="border-t border-neutral-200 pt-3">
                  <View className="flex-row justify-between">
                    <Text className="text-lg font-semibold text-neutral-900">
                      Tổng cộng
                    </Text>
                    <Text className="text-lg font-bold text-primary-600">
                      {formatCurrency(order.total)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200">
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,1)"]}
          className="px-4 py-4"
        >
          <View className="flex-row space-x-3">
            {order.status === "DELIVERED" && (
              <TouchableOpacity
                onPress={() => router.push("/(app)/(tabs)/catalog")}
                className="flex-1 bg-white border border-primary-500 rounded-xl py-3 items-center"
              >
                <Text className="text-primary-600 font-semibold">Mua lại</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleCallSupport}
              className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
            >
              <View className="flex-row items-center space-x-2">
                <Ionicons name="headset-outline" size={18} color="white" />
                <Text className="text-white font-semibold">Hỗ trợ</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}
