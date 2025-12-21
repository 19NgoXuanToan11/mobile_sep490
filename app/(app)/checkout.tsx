import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/shared/hooks";
import { useToast } from "../../src/shared/ui/toast";
import { useCheckout } from "../../src/features/checkout/hooks/useCheckout";
import {
  OrderSummaryCard,
  AddressRadioCard,
  PaymentMethodCard,
  StickyCTA,
} from "../../src/features/checkout/components";

export default function CheckoutScreen() {
  const toast = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const {
    addresses,
    paymentMethods,
    cart,
    selectedItems,

    selectedAddressId,
    selectedPaymentMethodId,
    setSelectedAddressId,
    setSelectedPaymentMethodId,

    isLoading,
    isPlacingOrder,

    canProceed,

    placeOrder,
    refetchAddresses,
  } = useCheckout();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast.info(
        "Yêu cầu đăng nhập",
        "Vui lòng đăng nhập để tiếp tục thanh toán"
      );
      router.replace("/(public)/auth/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    refetchAddresses();
  }, []);

  if (isAuthLoading || isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#00A86B" />
      </SafeAreaView>
    );
  }

  const getDisabledMessage = (): string | undefined => {
    if (cart.items.length === 0) {
      return "Giỏ hàng trống";
    }
    if (!selectedAddressId) {
      return "Vui lòng chọn địa chỉ giao hàng";
    }
    if (!selectedPaymentMethodId) {
      return "Chọn phương thức thanh toán để đặt hàng";
    }
    return undefined;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary Section */}
        <OrderSummaryCard
          items={selectedItems}
          subtotal={cart.subtotal}
          total={cart.total}
        />

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Địa Chỉ Giao Hàng</Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/address/add")}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Thêm mới</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Chưa có địa chỉ giao hàng
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(app)/address/add")}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateButtonText}>Thêm địa chỉ</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.sectionContent}>
              {addresses.map((address) => (
                <AddressRadioCard
                  key={address.id}
                  address={address}
                  isSelected={selectedAddressId === address.id}
                  onSelect={() => setSelectedAddressId(address.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phương Thức Thanh Toán</Text>
          </View>

          <View style={styles.sectionContent}>
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                isSelected={selectedPaymentMethodId === method.id}
                onSelect={() => setSelectedPaymentMethodId(method.id)}
              />
            ))}
          </View>
        </View>

        {/* Bottom spacing for sticky CTA */}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <StickyCTA
        isEnabled={canProceed}
        isLoading={isPlacingOrder}
        onPress={placeOrder}
        disabledMessage={getDisabledMessage()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#00A86B",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00A86B",
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 40,
    marginHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 16,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  securityNote: {
    backgroundColor: "#F0FDF7",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: "row",
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: "#3A3A3C",
    lineHeight: 20,
  },
});
