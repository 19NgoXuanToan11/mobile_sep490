import React, { useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StatusBar,
  Alert,
  ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { EmptyState } from "../../../src/shared/ui";
import { useCart, useAuth } from "../../../src/shared/hooks";
import { CartItem } from "../../../src/types";
import {
  CartItemCard,
  BottomActionSheet,
  CartHeader,
  CartSkeleton,
} from "../../../src/features/cart/components";

export default function CartScreen() {
  const { cart, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();

  // Memoized handlers to prevent re-renders
  const handleRemoveItem = useCallback(
    (itemId: string, itemName: string) => {
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
    },
    [removeItem]
  );

  const handleClearCart = useCallback(() => {
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
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
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
  }, [isAuthenticated]);

  const handleAddMore = useCallback(() => {
    router.push("/(app)/(tabs)/catalog");
  }, []);

  // Memoized render function with stable reference
  const renderCartItem = useCallback(
    ({ item }: ListRenderItemInfo<CartItem>) => (
      <CartItemCard
        item={item}
        onUpdateQuantity={updateQuantity}
        onRemove={handleRemoveItem}
      />
    ),
    [updateQuantity, handleRemoveItem]
  );

  // Stable keyExtractor
  const keyExtractor = useCallback((item: CartItem) => item.id, []);

  // Memoized getItemLayout for better performance
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 180, // Approximate item height
      offset: 180 * index,
      index,
    }),
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <CartSkeleton />
      </SafeAreaView>
    );
  }

  // Empty state
  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon="basket-outline"
            title="Giỏ hàng trống"
            description="Thêm những sản phẩm nông sản tươi ngon vào giỏ hàng để bắt đầu mua sắm"
            actionLabel="Khám phá sản phẩm"
            onActionPress={handleAddMore}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <CartHeader
        itemCount={cart.items.length}
        onClearCart={handleClearCart}
        onAddMore={handleAddMore}
      />

      {/* Cart Items List */}
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 250,
        }}
        // Performance optimizations
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />

      {/* Bottom Action Sheet */}
      <BottomActionSheet
        itemCount={cart.itemCount}
        subtotal={cart.subtotal}
        total={cart.total}
        onCheckout={handleCheckout}
        isAuthenticated={isAuthenticated}
      />
    </SafeAreaView>
  );
}
