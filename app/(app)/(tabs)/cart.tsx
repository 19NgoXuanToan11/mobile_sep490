import React from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  Button,
  Card,
  QuantityStepper,
  EmptyState,
} from "../../../src/shared/ui";
import { useCart, useLocalization } from "../../../src/shared/hooks";
import { formatCurrency } from "../../../src/shared/lib/utils";
import { CartItem } from "../../../src/types";

export default function CartScreen() {
  const { t } = useLocalization();
  const { cart, updateQuantity, removeItem } = useCart();

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <Card className="mx-4 mb-4" padding="md">
      <View className="flex-row space-x-4">
        <Image
          source={{ uri: item.product.images[0] }}
          style={{ width: 80, height: 80 }}
          className="rounded-md"
        />

        <View className="flex-1 space-y-2">
          <View className="flex-row items-start justify-between">
            <Text
              className="flex-1 font-semibold text-neutral-900"
              numberOfLines={2}
            >
              {item.product.name}
            </Text>
            <Button
              title="Remove"
              variant="ghost"
              size="sm"
              onPress={() => removeItem(item.id)}
            />
          </View>

          <Text className="text-sm text-neutral-600">
            {formatCurrency(item.price)} / {item.product.unit}
          </Text>

          <View className="flex-row items-center justify-between">
            <QuantityStepper
              value={item.quantity}
              onValueChange={(quantity) => updateQuantity(item.id, quantity)}
              min={1}
              max={item.product.stock}
              size="sm"
            />

            <Text className="font-bold text-primary-600">
              {formatCurrency(item.subtotal)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  if (cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <EmptyState
          icon="bag-outline"
          title={t("cart.empty")}
          description={t("cart.emptyDescription")}
          actionLabel={t("cart.browseProducts")}
          onActionPress={() => router.push("/catalog")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
      />

      {/* Cart Summary */}
      <View className="border-t border-neutral-200 p-4 space-y-4">
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-neutral-600">{t("cart.subtotal")}</Text>
            <Text className="font-medium">{formatCurrency(cart.subtotal)}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-neutral-600">{t("cart.shipping")}</Text>
            <Text className="font-medium">
              {formatCurrency(cart.shippingFee)}
            </Text>
          </View>

          <View className="flex-row justify-between pt-2 border-t border-neutral-200">
            <Text className="text-lg font-semibold">{t("cart.total")}</Text>
            <Text className="text-lg font-bold text-primary-600">
              {formatCurrency(cart.total)}
            </Text>
          </View>
        </View>

        <Button
          title={t("cart.checkout")}
          onPress={() => router.push("/(app)/checkout")}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
