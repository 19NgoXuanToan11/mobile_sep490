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
    <Card className="mx-4 mb-4" padding="none" variant="elevated">
      <View className="p-4 space-y-4">
        {/* Top Row: Badge + Total Price */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row space-x-2">
            {item.product.tags?.includes("organic") && (
              <Badge text="Organic" variant="success" size="sm" />
            )}
            {item.product.certifications?.includes("VietGAP") && (
              <Badge text="VietGAP" variant="secondary" size="sm" />
            )}
          </View>

          <Text className="font-bold text-primary-600 text-lg">
            {formatCurrency(item.subtotal)}
          </Text>
        </View>

        {/* Main Content Row */}
        <View className="flex-row space-x-4">
          {/* Product Image with Quantity Badge */}
          <View className="relative">
            <Image
              source={{ uri: item.product.images[0] }}
              style={{ width: 80, height: 80 }}
              className="rounded-xl"
              contentFit="cover"
            />
            <View className="absolute -top-2 -right-2 bg-primary-500 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {item.quantity}
              </Text>
            </View>
          </View>

          {/* Product Info */}
          <View className="flex-1 space-y-3">
            <View className="space-y-1">
              <Text
                className="font-semibold text-neutral-900 text-base leading-5"
                numberOfLines={2}
              >
                {item.product.name}
              </Text>

              <View className="flex-row items-center space-x-2 flex-wrap">
                <Text className="text-sm text-neutral-600">
                  {formatCurrency(item.price)} / {item.product.unit}
                </Text>
                {item.product.origin && (
                  <>
                    <Text className="text-neutral-400">•</Text>
                    <View className="flex-row items-center space-x-1">
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color="#6b7280"
                      />
                      <Text
                        className="text-xs text-neutral-600"
                        numberOfLines={1}
                      >
                        {item.product.origin}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Quantity Controls + Stock */}
            <View className="flex-row items-center justify-between">
              <QuantityStepper
                value={item.quantity}
                onValueChange={(quantity) => updateQuantity(item.id, quantity)}
                min={1}
                max={item.product.stock}
                size="sm"
              />

              <Text className="text-xs text-neutral-500">
                Còn {item.product.stock} {item.product.unit}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center space-x-4">
              <TouchableOpacity
                onPress={() => handleSaveForLater(item.id)}
                className="flex-row items-center space-x-1"
                activeOpacity={0.7}
              >
                <Ionicons name="heart-outline" size={16} color="#6b7280" />
                <Text className="text-sm text-neutral-600">Lưu sau</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id, item.product.name)}
                className="flex-row items-center space-x-1"
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                <Text className="text-sm text-red-500">Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        <View className="bg-primary-50 p-3 rounded-xl">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="time-outline" size={16} color="#00623A" />
            <Text className="text-sm text-primary-700 font-medium">
              Giao trong 2-4 giờ (nông sản tươi)
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  if (cart.items.length === 0) {
    return (
      <View className="flex-1 bg-neutral-50">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <View className="flex-1 justify-center pt-12">
          <EmptyState
            icon="basket-outline"
            title="Giỏ hàng trống"
            description="Thêm những sản phẩm nông sản tươi ngon vào giỏ hàng để bắt đầu mua sắm"
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

      {/* Quick Add Items - Edge to Edge */}
      {cart.items.length > 0 && (
        <View className="bg-white border-b border-neutral-100 pt-12">
          <View className="px-4 pb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              {cart.itemCount} món trong giỏ
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/(tabs)/catalog")}
              className="flex-row items-center space-x-1"
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
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 120 }}
        ListFooterComponent={() => (
          <View className="px-4 space-y-4">
            {/* Promo Code Section */}
            <Card variant="elevated" padding="lg">
              <View className="space-y-4">
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

            {/* Delivery Info */}
            <Card variant="fresh" padding="lg">
              <View className="flex-row items-center space-x-3">
                <View className="w-12 h-12 bg-primary-500 rounded-xl items-center justify-center">
                  <Ionicons name="bicycle" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-neutral-900">
                    Giao hàng tận nơi
                  </Text>
                  <Text className="text-sm text-neutral-600">
                    Miễn phí giao hàng cho đơn từ 200.000đ
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold text-primary-600">
                    2-4h
                  </Text>
                  <Text className="text-xs text-neutral-600">dự kiến</Text>
                </View>
              </View>
            </Card>
          </View>
        )}
      />

      {/* Bottom Cart Summary */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200">
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,1)"]}
          className="px-4 py-4"
        >
          <View className="space-y-4">
            {/* Price Breakdown */}
            <View className="space-y-2">
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
                <Text className="font-medium">
                  {cart.shippingFee === 0 ? (
                    <Text className="text-success-600">Miễn phí</Text>
                  ) : (
                    formatCurrency(cart.shippingFee)
                  )}
                </Text>
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
              className="bg-primary-500 rounded-xl py-4 items-center justify-center"
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
                  Đặt hàng • {formatCurrency(finalTotal)}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
