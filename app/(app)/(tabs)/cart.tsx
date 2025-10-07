import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Button,
  Card,
  QuantityStepper,
  EmptyState,
  Badge,
} from "../../../src/shared/ui";
import { useCart, useLocalization, useAuth } from "../../../src/shared/hooks";
import { formatCurrency } from "../../../src/shared/lib/utils";
import { CartItem } from "../../../src/types";

export default function CartScreen() {
  const { t } = useLocalization();
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleRemoveItem = (itemId: string, itemName: string) => {
    Alert.alert(
      "Xóa sản phẩm",
      `Bạn có chắc muốn xóa "${itemName}" khỏi giỏ hàng?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: () => removeItem(itemId),
          style: "destructive",
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Xóa tất cả sản phẩm",
      "Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tất cả",
          onPress: () => clearCart(),
          style: "destructive",
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để tiếp tục thanh toán. Giỏ hàng của bạn sẽ được lưu lại.",
        [
          { text: "Huỷ", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => router.push("/(public)/auth/login"),
          },
        ]
      );
      return;
    }
    router.push("/(app)/checkout");
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <Card className="mx-4 mb-3" padding="none" variant="elevated">
      {/* Header Section - Badges and Total Price */}
      <View className="px-5 pt-5 pb-4 border-b border-neutral-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row space-x-2">
            {item.product.tags?.includes("organic") && (
              <Badge text="Hữu cơ" variant="success" size="sm" />
            )}
            {item.product.certifications?.includes("VietGAP") && (
              <Badge text="VietGAP" variant="secondary" size="sm" />
            )}
          </View>
          <Text className="font-bold text-primary-600 text-xl">
            {formatCurrency(item.subtotal)}
          </Text>
        </View>
      </View>

      {/* Main Product Section */}
      <View className="px-5 py-5">
        <View className="flex-row space-x-4">
          {/* Product Image */}
          <View className="relative">
            <Image
              source={{ uri: item.product.images[0] }}
              style={{ width: 90, height: 90 }}
              className="rounded-2xl bg-neutral-100"
              contentFit="cover"
            />
            {/* Quantity Badge */}
            <View className="absolute -top-2 -right-2 bg-primary-500 rounded-full w-7 h-7 items-center justify-center shadow-sm">
              <Text className="text-white text-xs font-bold">
                {item.quantity}
              </Text>
            </View>
          </View>

          {/* Product Details */}
          <View className="flex-1 justify-between">
            {/* Product Name and Price */}
            <View className="space-y-3">
              <Text
                className="font-semibold text-neutral-900 text-lg leading-6"
                numberOfLines={2}
              >
                {item.product.name}
              </Text>

              <Text className="font-medium text-neutral-700 text-base">
                {formatCurrency(item.price)}
                {item.product.unit && !item.product.unit.startsWith("/")
                  ? ` / ${item.product.unit}`
                  : ""}
              </Text>
            </View>

            {/* Location and Stock Info */}
            <View className="space-y-3 mt-3">
              {item.product.origin && (
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                  <Text className="text-sm text-neutral-600" numberOfLines={1}>
                    {item.product.origin}
                  </Text>
                </View>
              )}

              <Text className="text-sm text-neutral-500">
                Còn {item.product.stock} {item.product.unit}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Controls Section */}
      <View className="px-5 py-5 border-t border-neutral-100 bg-neutral-50/30">
        <View className="flex-row items-center justify-between">
          {/* Quantity Controls */}
          <QuantityStepper
            value={item.quantity}
            onValueChange={(quantity) => updateQuantity(item.id, quantity)}
            min={1}
            max={item.product.stock}
            size="md"
          />

          {/* Action Buttons */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => handleRemoveItem(item.id, item.product.name)}
              className="flex-row items-center space-x-1.5 px-3 py-2 rounded-full bg-red-50"
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
              <Text className="text-sm text-red-500 font-medium">Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  if (cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <View className="flex-1 justify-center">
          <EmptyState
            icon="basket-outline"
            title="Giỏ hàng trống"
            description="Thêm những sản phẩm nông sản tươi ngon vào giỏ hàng để bắt đầu mua sắm"
            actionLabel="Khám phá sản phẩm"
            onActionPress={() => router.push("/(app)/(tabs)/catalog")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Quick Add Items - Edge to Edge */}
      {cart.items.length > 0 && (
        <View className="bg-white border-b border-neutral-100">
          <View className="px-4 py-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              {cart.itemCount} món trong giỏ
            </Text>
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity
                onPress={handleClearCart}
                className="flex-row items-center space-x-1"
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text className="text-red-500 font-medium">Xóa tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(app)/(tabs)/catalog")}
                className="flex-row items-center space-x-1"
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#00623A" />
                <Text className="text-primary-600 font-medium">Thêm món</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: 240 }}
      />

      {/* Bottom Cart Summary */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200"
        style={{ paddingBottom: 80 }}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.96)", "rgba(255,255,255,1)"]}
          className="px-4 py-3"
        >
          <View className="space-y-5">
            {/* Price Breakdown */}
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-neutral-600">
                  Tạm tính ({cart.itemCount} món)
                </Text>
                <Text className="font-medium">
                  {formatCurrency(cart.subtotal)}
                </Text>
              </View>

              <View className="flex-row justify-between pt-2 border-t border-neutral-200">
                <Text className="text-lg font-semibold">Tổng thanh toán</Text>
                <Text className="text-lg font-bold text-primary-600">
                  {formatCurrency(cart.subtotal)}
                </Text>
              </View>
            </View>

            {/* Guest Login Banner */}
            {!isAuthenticated && (
              <View className="bg-warning-50 border border-warning-200 rounded-xl p-3 mb-4">
                <View className="flex-row items-center space-x-2">
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#f59e0b"
                  />
                  <Text className="text-warning-700 text-sm flex-1">
                    Bạn cần đăng nhập để thanh toán. Giỏ hàng sẽ được lưu lại.
                  </Text>
                </View>
              </View>
            )}

            {/* Checkout Button */}
            <TouchableOpacity
              onPress={handleCheckout}
              className="bg-primary-500 rounded-xl py-4 items-center justify-center mb-1"
              style={{
                shadowColor: "#00623A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center space-x-2">
                <Text className="text-white font-semibold text-lg">
                  {isAuthenticated ? "Đặt hàng" : "Đăng nhập để thanh toán"}
                </Text>
                {!isAuthenticated && (
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}
