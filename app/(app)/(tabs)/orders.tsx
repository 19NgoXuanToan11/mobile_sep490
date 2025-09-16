import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Card, Badge, EmptyState, Button } from "../../../src/shared/ui";
import { ordersApi } from "../../../src/shared/data/api";
import { useLocalization } from "../../../src/shared/hooks";
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
} from "../../../src/shared/lib/utils";
import { Order } from "../../../src/types";

export default function OrdersScreen() {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">(
    "all"
  );

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.getAll().then((res) => res.data),
  });

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "PLACED":
        return {
          text: "Đã đặt hàng",
          color: "#f59e0b",
          bgColor: "#fef3c7",
          icon: "receipt-outline",
        };
      case "CONFIRMED":
        return {
          text: "Xác nhận",
          color: "#3b82f6",
          bgColor: "#dbeafe",
          icon: "checkmark-done-outline",
        };
      case "PACKED":
        return {
          text: "Đóng gói",
          color: "#8b5cf6",
          bgColor: "#ede9fe",
          icon: "cube-outline",
        };
      case "SHIPPED":
        return {
          text: "Đang giao",
          color: "#06b6d4",
          bgColor: "#cffafe",
          icon: "car-outline",
        };
      case "DELIVERED":
        return {
          text: "Đã giao",
          color: "#22c55e",
          bgColor: "#dcfce7",
          icon: "checkmark-circle-outline",
        };
      case "CANCELLED":
        return {
          text: "Đã hủy",
          color: "#ef4444",
          bgColor: "#fee2e2",
          icon: "close-circle-outline",
        };
      default:
        return {
          text: status,
          color: "#6b7280",
          bgColor: "#f3f4f6",
          icon: "ellipse-outline",
        };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return ["PLACED", "CONFIRMED", "PACKED", "SHIPPED"].includes(
        order.status
      );
    if (activeTab === "completed")
      return ["DELIVERED", "CANCELLED"].includes(order.status);
    return true;
  });

  const tabs = [
    { id: "all", label: "Tất cả", count: orders.length },
    {
      id: "active",
      label: "Đang xử lý",
      count: orders.filter((o) =>
        ["PLACED", "CONFIRMED", "PACKED", "SHIPPED"].includes(o.status)
      ).length,
    },
    {
      id: "completed",
      label: "Hoàn thành",
      count: orders.filter((o) => ["DELIVERED", "CANCELLED"].includes(o.status))
        .length,
    },
  ];

  const renderOrder = ({ item: order }: { item: Order }) => {
    const statusInfo = getStatusInfo(order.status);

    return (
      <Card
        className="mx-4 mb-4"
        padding="none"
        variant="elevated"
        onPress={() => router.push(`/(app)/track/${order.id}`)}
      >
        <View className="p-4 space-y-4">
          {/* Header - Optimized Layout */}
          <View className="flex-row items-start justify-between">
            {/* Left Section: Icon + Order Info */}
            <View className="flex-1 flex-row items-start space-x-3 pr-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center shadow-sm"
                style={{ backgroundColor: statusInfo.bgColor }}
              >
                <Ionicons
                  name={statusInfo.icon as any}
                  size={20}
                  color={statusInfo.color}
                />
              </View>

              <View className="flex-1 space-y-1">
                <Text
                  className="font-bold text-neutral-900 text-base leading-5"
                  numberOfLines={1}
                >
                  Đơn hàng #{order.orderNumber}
                </Text>
                <Text className="text-sm text-neutral-600">
                  {formatDate(order.createdAt)}
                </Text>
                <Text className="text-xs text-neutral-500">
                  {order.itemCount} món
                </Text>
              </View>
            </View>

            {/* Right Section: Status Badge */}
            <View className="items-end">
              <Badge
                text={statusInfo.text}
                size="sm"
                style={{
                  backgroundColor: statusInfo.bgColor,
                }}
              />
            </View>
          </View>

          {/* Products Preview + Total - Horizontal Layout */}
          <View className="flex-row items-center justify-between">
            {/* Product Images */}
            <View className="flex-row items-center space-x-2 flex-1">
              {order.items.slice(0, 3).map((item, index) => {
                const imageUri = item.product?.images?.[0];
                return (
                  <View key={item.id} className="relative">
                    <Image
                      source={{
                        uri:
                          imageUri ||
                          "https://via.placeholder.com/52x52/f3f4f6/9ca3af?text=No+Image",
                      }}
                      style={{ width: 52, height: 52 }}
                      className="rounded-xl"
                      contentFit="cover"
                    />
                    {item.product?.tags?.includes("organic") && (
                      <View className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full items-center justify-center">
                        <Ionicons name="leaf" size={10} color="white" />
                      </View>
                    )}
                  </View>
                );
              })}
              {order.items.length > 3 && (
                <View className="w-[52px] h-[52px] bg-neutral-100 rounded-xl items-center justify-center">
                  <Text className="text-xs font-semibold text-neutral-600">
                    +{order.items.length - 3}
                  </Text>
                </View>
              )}
            </View>

            {/* Total Price - Right Aligned */}
            <View className="items-end space-y-1 ml-4">
              <Text className="text-xs text-neutral-500">Tổng tiền</Text>
              <Text className="text-lg font-bold text-primary-600">
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>

          {/* Delivery Estimate - Conditional */}
          {order.status === "SHIPPED" && order.estimatedDelivery && (
            <View className="bg-primary-50 px-3 py-2.5 rounded-xl flex-row items-center space-x-2">
              <Ionicons name="time-outline" size={16} color="#00623A" />
              <Text
                className="text-sm text-primary-700 font-medium flex-1"
                numberOfLines={1}
              >
                Dự kiến giao: {formatDate(order.estimatedDelivery)}
              </Text>
            </View>
          )}

          {/* Action Buttons - Responsive */}
          <View className="flex-row space-x-3 pt-1">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/(app)/track/${order.id}`);
              }}
              className="flex-1 bg-primary-500 rounded-xl py-3 items-center shadow-sm"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center space-x-1.5">
                <Ionicons name="eye-outline" size={16} color="white" />
                <Text className="text-white font-semibold text-sm">
                  Theo dõi
                </Text>
              </View>
            </TouchableOpacity>

            {order.status === "DELIVERED" && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  router.push("/(app)/(tabs)/catalog");
                }}
                className="flex-1 bg-white border-2 border-primary-500 rounded-xl py-3 items-center"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center space-x-1.5">
                  <Ionicons name="repeat-outline" size={16} color="#00623A" />
                  <Text className="text-primary-600 font-semibold text-sm">
                    Mua lại
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  if (orders.length === 0) {
    return (
      <View className="flex-1 bg-neutral-50">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <View className="flex-1 justify-center pt-12">
          <EmptyState
            icon="receipt-outline"
            title="Chưa có đơn hàng"
            description="Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm những sản phẩm nông sản tươi ngon!"
            actionLabel="Khám phá sản phẩm"
            onActionPress={() => router.push("/(app)/(tabs)/catalog")}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header with Tabs - Edge to Edge */}
      <View className="bg-white shadow-sm border-b border-neutral-100 pt-12">
        {/* Tabs */}
        <View className="flex-row bg-neutral-50 mx-4 rounded-xl p-1 mb-4">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-lg items-center ${
                activeTab === tab.id ? "bg-white shadow-sm" : ""
              }`}
            >
              <View className="items-center">
                <Text
                  className={`font-medium ${
                    activeTab === tab.id
                      ? "text-primary-600"
                      : "text-neutral-600"
                  }`}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    className={`px-2 py-0.5 rounded-full mt-1 ${
                      activeTab === tab.id ? "bg-primary-100" : "bg-neutral-200"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        activeTab === tab.id
                          ? "text-primary-600"
                          : "text-neutral-600"
                      }`}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filteredOrders.length === 0 ? (
        <View className="flex-1 justify-center">
          <EmptyState
            icon="receipt-outline"
            title={
              activeTab === "active"
                ? "Không có đơn đang xử lý"
                : activeTab === "completed"
                ? "Không có đơn hoàn thành"
                : "Không có đơn hàng"
            }
            description={
              activeTab === "active"
                ? "Bạn không có đơn hàng nào đang được xử lý"
                : activeTab === "completed"
                ? "Bạn không có đơn hàng nào đã hoàn thành"
                : "Hãy bắt đầu mua sắm!"
            }
            actionLabel="Khám phá sản phẩm"
            onActionPress={() => router.push("/(app)/(tabs)/catalog")}
          />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 16,
            paddingBottom: 110,
          }}
        />
      )}
    </View>
  );
}
