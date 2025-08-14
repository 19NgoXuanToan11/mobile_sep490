import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Card, Badge, EmptyState } from "../../../src/shared/ui";
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

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.getAll().then((res) => res.data),
  });

  const renderOrder = ({ item: order }: { item: Order }) => (
    <Card
      className="mx-4 mb-4"
      padding="md"
      onPress={() => router.push(`/(app)/track/${order.id}`)}
    >
      <View className="space-y-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-neutral-900">
            {t("orders.orderNumber", { number: order.orderNumber })}
          </Text>
          <Badge
            text={t(`orderStatus.${order.status}`)}
            className={getOrderStatusColor(order.status)}
          />
        </View>

        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-neutral-600">{t("orders.date")}</Text>
            <Text className="text-sm text-neutral-900">
              {formatDate(order.createdAt)}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-sm text-neutral-600">
              {t("orders.items")}
            </Text>
            <Text className="text-sm text-neutral-900">
              {t("cart.itemCount", { count: order.itemCount })}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-sm text-neutral-600">
              {t("orders.total")}
            </Text>
            <Text className="text-sm font-semibold text-primary-600">
              {formatCurrency(order.total)}
            </Text>
          </View>
        </View>

        {order.status === "SHIPPED" && order.estimatedDelivery && (
          <View className="bg-blue-50 p-3 rounded-md">
            <Text className="text-sm text-blue-800">
              {t("orders.estimated")}: {formatDate(order.estimatedDelivery)}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  if (orders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <EmptyState
          icon="receipt-outline"
          title={t("orders.empty")}
          description={t("orders.emptyDescription")}
          actionLabel={t("cart.browseProducts")}
          onActionPress={() => router.push("/catalog")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </SafeAreaView>
  );
}
