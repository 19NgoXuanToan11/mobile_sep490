import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Button, Card, Badge, EmptyState } from "../../../src/shared/ui";
import { ordersApi } from "../../../src/shared/data/api";
import { useLocalization } from "../../../src/shared/hooks";
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
} from "../../../src/shared/lib/utils";
import { OrderStatus } from "../../../src/types";

const StatusTimeline: React.FC<{ statusHistory: OrderStatus[] }> = ({
  statusHistory,
}) => {
  const { t } = useLocalization();

  const getStatusIcon = (status: OrderStatus["status"]) => {
    switch (status) {
      case "PLACED":
        return "checkmark-circle";
      case "CONFIRMED":
        return "checkmark-done-circle";
      case "PACKED":
        return "cube";
      case "SHIPPED":
        return "car";
      case "DELIVERED":
        return "home";
      case "CANCELLED":
        return "close-circle";
      default:
        return "ellipse";
    }
  };

  const getStatusColor = (status: OrderStatus["status"]) => {
    switch (status) {
      case "DELIVERED":
        return "#22c55e";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  };

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-neutral-900">
        {t("orders.statusHistory")}
      </Text>

      <View className="space-y-4">
        {statusHistory.map((status, index) => (
          <View key={status.id} className="flex-row items-start space-x-4">
            <View className="relative">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: getStatusColor(status.status) + "20",
                }}
              >
                <Ionicons
                  name={getStatusIcon(status.status)}
                  size={20}
                  color={getStatusColor(status.status)}
                />
              </View>

              {index < statusHistory.length - 1 && (
                <View
                  className="absolute top-10 left-5 w-0.5 h-8"
                  style={{ backgroundColor: "#e5e7eb" }}
                />
              )}
            </View>

            <View className="flex-1 space-y-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-medium text-neutral-900">
                  {t(`orderStatus.${status.status}`)}
                </Text>
                <Text className="text-sm text-neutral-500">
                  {formatDate(status.timestamp, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Text className="text-sm text-neutral-600">
                {status.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const TrackingMap: React.FC<{ trackingNumber?: string }> = ({
  trackingNumber,
}) => {
  const { t } = useLocalization();

  return (
    <Card padding="lg">
      <View className="space-y-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-neutral-900">
            Live Tracking
          </Text>
          {trackingNumber && (
            <Badge text={`#${trackingNumber}`} variant="outline" size="sm" />
          )}
        </View>

        {/* Map Placeholder */}
        <View className="h-48 bg-neutral-100 rounded-lg items-center justify-center">
          <View className="items-center space-y-3">
            <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center">
              <Ionicons name="location" size={32} color="#22c55e" />
            </View>
            <View className="items-center space-y-1">
              <Text className="font-medium text-neutral-900">Tracking Map</Text>
              <Text className="text-sm text-neutral-600 text-center">
                Real-time delivery tracking will be available here
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        <View className="bg-blue-50 p-4 rounded-lg">
          <View className="flex-row items-center space-x-2 mb-2">
            <Ionicons name="car-sport" size={16} color="#3b82f6" />
            <Text className="font-medium text-blue-900">Out for Delivery</Text>
          </View>
          <Text className="text-sm text-blue-800">
            Your order is on its way! Estimated arrival: 2:30 PM - 4:30 PM
          </Text>
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-neutral-600">Loading order...</Text>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <EmptyState
          icon="alert-circle-outline"
          title="Order not found"
          description="We couldn't find this order. Please check the order number and try again."
          actionLabel="Back to Orders"
          onActionPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-4 space-y-6">
          {/* Order Header */}
          <Card padding="lg">
            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-neutral-900">
                  Order #{order.orderNumber}
                </Text>
                <Badge
                  text={t(`orderStatus.${order.status}`)}
                  className={getOrderStatusColor(order.status)}
                />
              </View>

              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Order Date</Text>
                  <Text className="text-neutral-900">
                    {formatDate(order.createdAt)}
                  </Text>
                </View>

                {order.estimatedDelivery && (
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600">Estimated Delivery</Text>
                    <Text className="text-neutral-900">
                      {formatDate(order.estimatedDelivery)}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Total Amount</Text>
                  <Text className="text-lg font-bold text-primary-600">
                    {formatCurrency(order.total)}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Live Tracking Map (only show if shipped) */}
          {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
            <TrackingMap trackingNumber={order.trackingNumber} />
          )}

          {/* Status Timeline */}
          <Card padding="lg">
            <StatusTimeline statusHistory={order.statusHistory} />
          </Card>

          {/* Order Items */}
          <Card padding="lg">
            <View className="space-y-4">
              <Text className="text-lg font-semibold text-neutral-900">
                Order Items ({order.itemCount} items)
              </Text>

              <View className="space-y-4">
                {order.items.map((item) => (
                  <View key={item.id} className="flex-row space-x-4">
                    <Image
                      source={{ uri: item.product.images[0] }}
                      style={{ width: 60, height: 60 }}
                      className="rounded-md"
                    />

                    <View className="flex-1 space-y-1">
                      <Text
                        className="font-medium text-neutral-900"
                        numberOfLines={2}
                      >
                        {item.product.name}
                      </Text>
                      <Text className="text-sm text-neutral-600">
                        {item.quantity} × {formatCurrency(item.price)}
                      </Text>
                      <Text className="text-sm text-neutral-500">
                        From: {item.product.origin}
                      </Text>
                    </View>

                    <Text className="font-semibold text-neutral-900">
                      {formatCurrency(item.subtotal)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          {/* Delivery Address */}
          <Card padding="lg">
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-neutral-900">
                {t("orders.shippingAddress")}
              </Text>

              <View className="space-y-1">
                <Text className="font-medium text-neutral-900">
                  {order.shippingAddress.name}
                </Text>
                <Text className="text-neutral-600">
                  {order.shippingAddress.phone}
                </Text>
                <Text className="text-neutral-700">
                  {order.shippingAddress.street}, {order.shippingAddress.ward}
                </Text>
                <Text className="text-neutral-700">
                  {order.shippingAddress.district}, {order.shippingAddress.city}
                </Text>
              </View>
            </View>
          </Card>

          {/* Payment Method */}
          <Card padding="lg">
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-neutral-900">
                {t("orders.paymentMethod")}
              </Text>

              <View className="flex-row items-center space-x-3">
                <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                  <Ionicons
                    name={
                      order.paymentMethod.type === "COD"
                        ? "cash-outline"
                        : "card-outline"
                    }
                    size={20}
                    color="#6b7280"
                  />
                </View>
                <View>
                  <Text className="font-medium text-neutral-900">
                    {order.paymentMethod.name}
                  </Text>
                  <Text className="text-sm text-neutral-600">
                    {order.paymentMethod.description}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Order Summary */}
          <Card padding="lg">
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-neutral-900">
                Order Summary
              </Text>

              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Subtotal</Text>
                  <Text>{formatCurrency(order.subtotal)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Shipping Fee</Text>
                  <Text>{formatCurrency(order.shippingFee)}</Text>
                </View>
                {order.discount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600">Discount</Text>
                    <Text className="text-success-600">
                      -{formatCurrency(order.discount)}
                    </Text>
                  </View>
                )}
                <View className="border-t border-neutral-200 pt-2">
                  <View className="flex-row justify-between">
                    <Text className="text-lg font-semibold">Total</Text>
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

      {/* Action Buttons */}
      <View className="border-t border-neutral-200 p-4 space-y-3">
        {order.status === "DELIVERED" && (
          <Button
            title="Reorder Items"
            onPress={() => {
              // TODO: Implement reorder functionality
              router.push("/catalog");
            }}
            fullWidth
          />
        )}

        <Button
          title="Back to Orders"
          variant="outline"
          onPress={() => router.back()}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
