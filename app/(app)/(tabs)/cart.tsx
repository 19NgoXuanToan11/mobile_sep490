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
  Input,
} from "../../../src/shared/ui";
import { useCart, useLocalization } from "../../../src/shared/hooks";
import { formatCurrency } from "../../../src/shared/lib/utils";
import { CartItem } from "../../../src/types";

export default function CartScreen() {
  const { t } = useLocalization();
  const { cart, updateQuantity, removeItem } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<string[]>([]);

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

  const handleSaveForLater = (itemId: string) => {
    setSavedItems((prev) => [...prev, itemId]);
    removeItem(itemId);
  };

  const handleApplyPromo = () => {
    // Mock promo code validation
    if (promoCode.toLowerCase() === "fresh20") {
      setAppliedPromo(promoCode);
      setPromoCode("");
      Alert.alert("Thành công", "Mã giảm giá đã được áp dụng!");
    } else if (promoCode.toLowerCase() === "organic10") {
      setAppliedPromo(promoCode);
      setPromoCode("");
      Alert.alert("Thành công", "Mã giảm giá đã được áp dụng!");
    } else {
      Alert.alert("Lỗi", "Mã giảm giá không hợp lệ");
    }
  };

  const getDiscountAmount = () => {
    if (appliedPromo === "fresh20") return cart.subtotal * 0.2;
    if (appliedPromo === "organic10") return cart.subtotal * 0.1;
    return 0;
  };

  const discountAmount = getDiscountAmount();
  const finalTotal = cart.total - discountAmount;

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
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={() => handleSaveForLater(item.id)}
              className="flex-row items-center space-x-1.5 px-3 py-2 rounded-full bg-white/80"
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={16} color="#6b7280" />
              <Text className="text-sm text-neutral-600 font-medium">
                Lưu sau
              </Text>
            </TouchableOpacity>

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
      )}

      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: 240 }}
        ListFooterComponent={() => (
          <View className="px-4 space-y-5 pb-8">
            {/* Promo Code Section */}
            <Card variant="elevated" padding="lg" className="mb-4">
              <View className="space-y-5">
                <View className="flex-row items-center space-x-2">
                  <Ionicons name="pricetag-outline" size={20} color="#00623A" />
                  <Text className="text-lg font-semibold text-neutral-900">
                    Mã Giảm Giá
                  </Text>
                </View>

                {appliedPromo ? (
                  <View className="flex-row items-center justify-between bg-success-50 p-3 rounded-xl">
                    <View className="flex-row items-center space-x-2">
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#16a34a"
                      />
                      <Text className="text-success-700 font-medium">
                        Đã áp dụng: {appliedPromo.toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setAppliedPromo(null)}>
                      <Text className="text-success-600">Hủy</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <Input
                        placeholder="Nhập mã giảm giá"
                        value={promoCode}
                        onChangeText={setPromoCode}
                        leftIcon="pricetag-outline"
                      />
                    </View>
                    <Button
                      title="Áp dụng"
                      onPress={handleApplyPromo}
                      variant="outline"
                      size="md"
                      disabled={!promoCode.trim()}
                    />
                  </View>
                )}

                {/* Promo suggestions */}
                {!appliedPromo && (
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() => setPromoCode("FRESH20")}
                      className="bg-primary-50 px-3 py-1 rounded-full"
                    >
                      <Text className="text-primary-600 text-sm font-medium">
                        FRESH20
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setPromoCode("ORGANIC10")}
                      className="bg-organic-50 px-3 py-1 rounded-full"
                    >
                      <Text className="text-organic-600 text-sm font-medium">
                        ORGANIC10
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Card>
          </View>
        )}
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

              {appliedPromo && (
                <View className="flex-row justify-between">
                  <Text className="text-success-600">
                    Giảm giá ({appliedPromo})
                  </Text>
                  <Text className="font-medium text-success-600">
                    -{formatCurrency(discountAmount)}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between">
                <Text className="text-neutral-600">Phí giao hàng</Text>
                {cart.shippingFee === 0 ? (
                  <Text className="font-medium text-success-600">Miễn phí</Text>
                ) : (
                  <Text className="font-medium">
                    {formatCurrency(cart.shippingFee)}
                  </Text>
                )}
              </View>

              <View className="flex-row justify-between pt-2 border-t border-neutral-200">
                <Text className="text-lg font-semibold">Tổng thanh toán</Text>
                <Text className="text-lg font-bold text-primary-600">
                  {formatCurrency(finalTotal)}
                </Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              onPress={() => router.push("/(app)/checkout")}
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
                  Đặt hàng
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}
