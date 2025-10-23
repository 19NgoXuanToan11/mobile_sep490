import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, Input, Badge } from "../../src/shared/ui";
import {
  addressesApi,
  paymentMethodsApi,
  ordersApi,
} from "../../src/shared/data/api";
import { vnpayApi } from "../../src/shared/data/paymentApiService";
import { useCart, useLocalization, useAuth } from "../../src/shared/hooks";
import { useToast } from "../../src/shared/ui/toast";
import { formatCurrency } from "../../src/shared/lib/utils";
import { CartItem } from "../../src/types";
import { Address, PaymentMethod, CheckoutFormData } from "../../src/types";
import * as Linking from "expo-linking";

const checkoutSchema = z.object({
  addressId: z.string().optional(),
  paymentMethodId: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
  notes: z.string().optional(),
  manualAddress: z.string().optional(),
});

const AddressSelector: React.FC<{
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ addresses, selectedId, onSelect }) => {
  return (
    <Card variant="elevated" padding="lg">
      <View className="space-y-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="location-outline" size={20} color="#00623A" />
            <Text className="text-lg font-semibold text-neutral-900">
              Địa Chỉ Giao Hàng
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(app)/address/add")}>
            <Text className="text-primary-600 font-medium">Thêm mới</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-3">
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              onPress={() => onSelect(address.id)}
              className={`border-2 rounded-xl p-4 ${
                selectedId === address.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 bg-white"
              }`}
              style={{
                shadowColor: selectedId === address.id ? "#00623A" : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: selectedId === address.id ? 0.15 : 0.05,
                shadowRadius: 4,
                elevation: selectedId === address.id ? 4 : 2,
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3 space-y-2">
                  <View className="flex-row items-center flex-wrap gap-2">
                    <Text className="font-semibold text-neutral-900 text-base">
                      {address.name}
                    </Text>
                    {address.isDefault && (
                      <Badge text="Mặc định" size="sm" variant="success" />
                    )}
                    <Badge
                      text={
                        address.type === "HOME"
                          ? "Nhà"
                          : address.type === "OFFICE"
                          ? "Văn phòng"
                          : "Khác"
                      }
                      size="sm"
                      variant="outline"
                    />
                  </View>

                  <View className="flex-row items-center space-x-1">
                    <Ionicons name="call-outline" size={14} color="#6b7280" />
                    <Text className="text-sm text-neutral-600">
                      {address.phone}
                    </Text>
                  </View>

                  <View className="flex-row items-start space-x-1">
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#6b7280"
                      className="mt-0.5"
                    />
                    <Text className="text-sm text-neutral-700 leading-5 flex-1">
                      {address.street}, {address.ward}, {address.district},{" "}
                      {address.city}
                    </Text>
                  </View>
                </View>

                <View className="ml-2">
                  <Ionicons
                    name={
                      selectedId === address.id
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color={selectedId === address.id ? "#00623A" : "#d1d5db"}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Card>
  );
};

const PaymentMethodSelector: React.FC<{
  paymentMethods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ paymentMethods, selectedId, onSelect }) => {
  const getPaymentIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "COD":
        return "cash-outline";
      case "BANK_TRANSFER":
        return "card-outline";
      case "CREDIT_CARD":
        return "card-outline";
      case "E_WALLET":
        return "phone-portrait-outline";
      default:
        return "card-outline";
    }
  };

  const getPaymentColor = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "COD":
        return "#22c55e";
      case "BANK_TRANSFER":
        return "#3b82f6";
      case "CREDIT_CARD":
        return "#8b5cf6";
      case "E_WALLET":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <View className="space-y-5">
        <View className="flex-row items-center space-x-2">
          <Ionicons name="wallet-outline" size={20} color="#00623A" />
          <Text className="text-lg font-semibold text-neutral-900">
            Phương Thức Thanh Toán
          </Text>
        </View>

        <View className="space-y-3">
          {/* Placeholder option khi chưa chọn */}
          {!selectedId && (
            <View className="border-2 border-dashed border-neutral-300 rounded-xl p-4 bg-neutral-50">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-3 flex-1">
                  <View className="w-10 h-10 rounded-lg items-center justify-center bg-neutral-100">
                    <Ionicons name="help-outline" size={20} color="#9ca3af" />
                  </View>

                  <View className="flex-1 pr-3">
                    <Text className="font-medium text-neutral-500 text-base">
                      Chọn phương thức thanh toán
                    </Text>
                    <Text className="text-sm text-neutral-400 leading-5 mt-0.5">
                      Vui lòng chọn một phương thức bên dưới
                    </Text>
                  </View>
                </View>

                <Ionicons name="radio-button-off" size={24} color="#d1d5db" />
              </View>
            </View>
          )}

          {paymentMethods
            .filter((method) => method.type !== "COD")
            .map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => onSelect(method.id)}
                className={`border-2 rounded-xl p-4 ${
                  selectedId === method.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 bg-white"
                }`}
                style={{
                  shadowColor: selectedId === method.id ? "#00623A" : "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedId === method.id ? 0.15 : 0.05,
                  shadowRadius: 4,
                  elevation: selectedId === method.id ? 4 : 2,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3 flex-1">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center"
                      style={{
                        backgroundColor: `${getPaymentColor(method.type)}15`,
                      }}
                    >
                      <Ionicons
                        name={getPaymentIcon(method.type)}
                        size={20}
                        color={getPaymentColor(method.type)}
                      />
                    </View>

                    <View className="flex-1 pr-3">
                      <Text className="font-semibold text-neutral-900 text-base">
                        {method.name}
                      </Text>
                      <Text className="text-sm text-neutral-600 leading-5 mt-0.5">
                        {method.description}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name={
                      selectedId === method.id
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color={selectedId === method.id ? "#00623A" : "#d1d5db"}
                  />
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </Card>
  );
};

export default function CheckoutScreen() {
  const { t } = useLocalization();
  const toast = useToast();
  const { cart, clearCart } = useCart();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState("asap");
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<
    (CheckoutFormData & { manualAddress?: string }) | null
  >(null);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  // Chuyển hướng đến trang đăng nhập nếu chưa xác thực
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.info(
        "Yêu cầu đăng nhập",
        "Vui lòng đăng nhập hoặc đăng ký để tiếp tục thanh toán"
      );
      router.replace("/(public)/auth/login");
    }
  }, [isAuthenticated, isLoading]);

  const deliveryTimeOptions = [
    { id: "asap", label: "Giao ngay (2-4 giờ)", time: "2-4 giờ", price: 0 },
    { id: "morning", label: "Sáng mai (7h-11h)", time: "7h-11h", price: 0 },
    {
      id: "afternoon",
      label: "Chiều mai (14h-18h)",
      time: "14h-18h",
      price: 0,
    },
    { id: "evening", label: "Tối mai (18h-21h)", time: "18h-21h", price: 0 },
  ];

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.getAll().then((res) => res.data),
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => paymentMethodsApi.getAll().then((res) => res.data),
  });

  // Step 1: Create Order
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      orderItems: Array<{ productId: number; stockQuantity: number }>;
      shippingAddress: string;
    }) => {
      return await ordersApi.create(orderData);
    },
    onSuccess: async (response) => {
      console.log("🎯 Create Order Response:", response);

      if (response.success) {
        const { orderId, totalPrice, paymentUrl } = response.data;
        setCreatedOrderId(orderId);

        toast.success("Tạo đơn hàng thành công", `Mã đơn hàng: #${orderId}`);
        console.log("✅ Order created successfully:", {
          orderId,
          totalPrice,
          paymentUrl,
        });

        // Check payment method
        const paymentMethod = paymentMethods.find(
          (m) => m.id === watchedPaymentMethodId
        );
        console.log("💳 Selected payment method:", paymentMethod);

        if (paymentMethod?.type === "E_WALLET") {
          // Nếu đã có paymentUrl từ API tạo đơn hàng, redirect luôn
          if (paymentUrl) {
            console.log("🔗 Using paymentUrl from order creation:", paymentUrl);

            // Clear cart trước khi redirect
            await clearCart();

            // Redirect đến paymentUrl từ backend
            toast.info(
              "Chuyển hướng thanh toán",
              "Đang chuyển đến trang thanh toán VNPay..."
            );

            console.log("🚀 Opening payment URL:", paymentUrl);
            await Linking.openURL(paymentUrl);

            // Navigate to payment result page để user có thể quay lại
            console.log("📱 Navigating to payment-result screen");
            router.replace(`/(app)/payment-result?orderId=${orderId}`);
            return;
          }

          // Fallback: Nếu không có paymentUrl, tạo mới (trường hợp cũ)
          console.log("⚠️ No paymentUrl from order, creating new payment URL");
          createPaymentUrlMutation.mutate({
            orderId,
            amount: totalPrice,
            orderDescription: `Thanh toán đơn hàng #${orderId}`,
            name: user?.name ?? "Customer",
            source: "mobile", // Add mobile source parameter
          });
        } else {
          // COD payment - create payment record and finish
          console.log("💰 Processing COD payment");
          createOrderPaymentMutation.mutate(orderId);
        }
      } else {
        console.error("❌ Order creation failed:", response);
        toast.error(
          "Tạo đơn hàng thất bại",
          response.message || "Vui lòng thử lại sau"
        );
        setPendingOrderData(null);
      }
    },
    onError: (error: any) => {
      console.error("Create order error:", error);
      toast.error(
        "Tạo đơn hàng thất bại",
        error?.message || "Vui lòng kiểm tra thông tin và thử lại"
      );
      setPendingOrderData(null);
    },
  });

  // Step 2: Create VNPAY Payment URL (Fallback)
  const createPaymentUrlMutation = useMutation({
    mutationFn: async (paymentData: {
      orderId: number;
      amount: number;
      orderDescription: string;
      name: string;
      source?: string;
    }) => {
      return await ordersApi.createPaymentUrl(paymentData);
    },
    onSuccess: async (response) => {
      console.log("🔗 Create Payment URL Response:", response);

      if (response.success && response.data?.paymentUrl) {
        console.log("✅ Payment URL created:", response.data.paymentUrl);

        // Clear cart trước khi redirect
        await clearCart();

        // Redirect đến paymentUrl
        toast.info(
          "Chuyển hướng thanh toán",
          "Đang chuyển đến trang thanh toán VNPay..."
        );

        console.log(
          "🚀 Opening fallback payment URL:",
          response.data.paymentUrl
        );
        await Linking.openURL(response.data.paymentUrl);

        // Navigate to payment result page để user quay lại sau khi thanh toán
        console.log("📱 Navigating to payment-result screen (fallback)");
        router.replace(`/(app)/payment-result?orderId=${createdOrderId}`);
      } else {
        console.error("❌ Payment URL creation failed:", response);
        toast.error(
          "Lỗi thanh toán",
          response.message || "Không thể tạo liên kết thanh toán"
        );
      }
    },
    onError: (error: any) => {
      console.error("Create payment URL error:", error);
      toast.error(
        "Lỗi thanh toán",
        "Không thể tạo liên kết thanh toán. Vui lòng thử lại."
      );
    },
  });

  // Step 3: Create Order Payment Record
  const createOrderPaymentMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await ordersApi.createOrderPayment(orderId);
    },
    onSuccess: async (response) => {
      if (response.success) {
        // Success - clear cart and redirect
        await clearCart();
        toast.success(
          "Đặt hàng thành công",
          "Đơn hàng đã được xử lý thành công"
        );
        router.replace(`/(app)/(tabs)/orders`);

        // Reset states
        setPendingOrderData(null);
        setCreatedOrderId(null);
      } else {
        toast.error("Lỗi thanh toán", "Không thể lưu thông tin thanh toán");
      }
    },
    onError: (error: any) => {
      console.error("Create order payment error:", error);
      toast.error("Lỗi thanh toán", "Không thể hoàn tất đơn hàng");
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CheckoutFormData & { manualAddress?: string }>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      addressId: addresses.find((a) => a.isDefault)?.id || "",
      paymentMethodId: "", // Không set default, yêu cầu user phải chọn
      notes: "",
      manualAddress: "",
    },
  });

  const watchedAddressId = watch("addressId");
  const watchedPaymentMethodId = watch("paymentMethodId");
  const watchedManualAddress = watch("manualAddress");

  // Set default values when data loads
  React.useEffect(() => {
    if (addresses.length > 0 && !watchedAddressId && !useManualAddress) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      setValue("addressId", defaultAddress.id);
    }
  }, [addresses, watchedAddressId, setValue, useManualAddress]);

  // Removed auto-selection of payment method to require user selection

  // Auto-enable manual address mode if no addresses exist
  React.useEffect(() => {
    if (addresses.length === 0) {
      setUseManualAddress(true);
    }
  }, [addresses]);

  const onSubmit = (data: CheckoutFormData & { manualAddress?: string }) => {
    // Validate address
    if (!data.addressId && !data.manualAddress?.trim()) {
      toast.error("Thiếu địa chỉ", "Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    // Validate payment method
    if (!data.paymentMethodId?.trim()) {
      toast.error(
        "Thiếu phương thức thanh toán",
        "Vui lòng chọn phương thức thanh toán"
      );
      return;
    }

    Alert.alert(
      "Xác nhận đặt hàng",
      `Bạn có chắc muốn đặt hàng với tổng tiền ${formatCurrency(
        cart.subtotal
      )}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đặt hàng",
          onPress: () => {
            // Prepare order data
            setPendingOrderData(data);

            // Get shipping address
            let shippingAddress = "";
            if (data.manualAddress?.trim()) {
              shippingAddress = data.manualAddress.trim();
            } else if (data.addressId) {
              const selectedAddress = addresses.find(
                (a) => a.id === data.addressId
              );
              if (selectedAddress) {
                shippingAddress = `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`;
              }
            }

            // Prepare order items for API
            const orderItems = cart.items.map((item: CartItem) => ({
              productId: Number(item.productId), // Use item.productId instead of item.product.id
              stockQuantity: item.quantity,
            }));

            // Start order creation process
            toast.info("Đang tạo đơn hàng", "Vui lòng đợi...");
            createOrderMutation.mutate({
              orderItems,
              shippingAddress,
            });
          },
        },
      ]
    );
  };

  if (cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <View className="items-center space-y-6 px-8">
          <View className="w-24 h-24 bg-neutral-200 rounded-full items-center justify-center">
            <Ionicons name="basket-outline" size={48} color="#9ca3af" />
          </View>
          <Text className="text-xl font-semibold text-neutral-900">
            Giỏ hàng trống
          </Text>
          <Text className="text-neutral-600 text-center">
            Thêm sản phẩm vào giỏ hàng để tiếp tục thanh toán
          </Text>
          <Button
            title="Khám phá sản phẩm"
            onPress={() => router.push("/(app)/(tabs)/catalog")}
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          <View className="p-4">
            {/* Order Summary */}
            <View style={{ marginBottom: 10 }}>
              <Card variant="elevated" padding="lg">
                <View className="space-y-5">
                  <View className="flex-row items-center space-x-2">
                    <Ionicons
                      name="receipt-outline"
                      size={20}
                      color="#00623A"
                    />
                    <Text className="text-lg font-semibold text-neutral-900">
                      Đơn Hàng
                    </Text>
                  </View>

                  <View className="space-y-5">
                    {cart.items.map((item: CartItem) => (
                      <View
                        key={item.id}
                        className="flex-row space-x-3 items-start"
                      >
                        <Image
                          source={{ uri: item.product.images[0] }}
                          style={{ width: 50, height: 50 }}
                          className="rounded-lg"
                        />

                        <View className="flex-1 space-y-1 pr-2">
                          <Text
                            className="font-semibold text-neutral-900 text-sm leading-5"
                            numberOfLines={2}
                          >
                            {item.product.name}
                          </Text>
                          <View className="flex-row items-center space-x-2 flex-wrap">
                            <Text className="text-sm text-neutral-600">
                              {item.quantity} × {formatCurrency(item.price)}
                            </Text>
                          </View>
                        </View>

                        <View className="items-end">
                          <Text className="font-bold text-neutral-900 text-base">
                            {formatCurrency(item.subtotal)}
                          </Text>
                        </View>
                      </View>
                    ))}

                    <View className="border-t border-neutral-200 pt-5 space-y-4">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-neutral-600 text-base">
                          Tạm tính
                        </Text>
                        <Text className="font-medium text-neutral-900 text-base">
                          {formatCurrency(cart.subtotal)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center pt-3 border-t border-neutral-200">
                        <Text className="text-lg font-semibold text-neutral-900">
                          Tổng cộng
                        </Text>
                        <Text className="text-xl font-bold text-primary-600">
                          {formatCurrency(cart.subtotal)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            </View>

            {/* Address Selection */}
            {addresses.length > 0 && !useManualAddress ? (
              <View style={{ marginBottom: 10 }}>
                <AddressSelector
                  addresses={addresses}
                  selectedId={watchedAddressId}
                  onSelect={(id) => setValue("addressId", id)}
                />
                <TouchableOpacity
                  onPress={() => setUseManualAddress(true)}
                  className="mt-3 px-4"
                >
                  <Text className="text-primary-600 font-medium text-center">
                    Hoặc nhập địa chỉ mới
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginBottom: 10 }}>
                <Card variant="elevated" padding="lg">
                  <View style={{ rowGap: 10 }}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center space-x-2">
                        <Ionicons
                          name="location-outline"
                          size={20}
                          color="#00623A"
                        />
                        <Text className="text-lg font-semibold text-neutral-900">
                          Địa Chỉ Giao Hàng
                        </Text>
                      </View>
                      {addresses.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setUseManualAddress(false)}
                        >
                          <Text className="text-primary-600 font-medium">
                            Chọn có sẵn
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <Controller
                      control={control}
                      name="manualAddress"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          placeholder="Nhập địa chỉ giao hàng đầy đủ"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={errors.manualAddress?.message}
                          multiline
                          numberOfLines={3}
                        />
                      )}
                    />
                  </View>
                </Card>
              </View>
            )}

            {/* Payment Method Selection */}
            {paymentMethods.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <PaymentMethodSelector
                  paymentMethods={paymentMethods}
                  selectedId={watchedPaymentMethodId}
                  onSelect={(id) => setValue("paymentMethodId", id)}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Order Button */}
        <View className="absolute bottom-0 left-0 right-0">
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,1)"]}
            className="px-4 py-3 border-t border-neutral-100"
          >
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isValid ||
                createOrderMutation.isPending ||
                createPaymentUrlMutation.isPending ||
                createOrderPaymentMutation.isPending
              }
              className={`rounded-xl py-4 items-center justify-center ${
                !isValid ||
                createOrderMutation.isPending ||
                createPaymentUrlMutation.isPending ||
                createOrderPaymentMutation.isPending
                  ? "bg-neutral-300"
                  : "bg-primary-500"
              }`}
              style={{
                shadowColor: "#00623A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity:
                  createOrderMutation.isPending ||
                  createPaymentUrlMutation.isPending ||
                  createOrderPaymentMutation.isPending
                    ? 0
                    : 0.3,
                shadowRadius: 8,
                elevation:
                  createOrderMutation.isPending ||
                  createPaymentUrlMutation.isPending ||
                  createOrderPaymentMutation.isPending
                    ? 0
                    : 6,
              }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center space-x-2">
                {createOrderMutation.isPending ? (
                  <>
                    <View className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-600 rounded-full animate-spin" />
                    <Text className="text-neutral-500 font-semibold text-lg">
                      Đang tạo đơn hàng...
                    </Text>
                  </>
                ) : createPaymentUrlMutation.isPending ? (
                  <>
                    <View className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-600 rounded-full animate-spin" />
                    <Text className="text-neutral-500 font-semibold text-lg">
                      Đang tạo liên kết thanh toán...
                    </Text>
                  </>
                ) : createOrderPaymentMutation.isPending ? (
                  <>
                    <View className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-600 rounded-full animate-spin" />
                    <Text className="text-neutral-500 font-semibold text-lg">
                      Đang hoàn tất đơn hàng...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      className={`font-semibold text-lg ${
                        !watchedPaymentMethodId
                          ? "text-neutral-500"
                          : "text-white"
                      }`}
                    >
                      {!watchedPaymentMethodId
                        ? "Chọn phương thức thanh toán để tiếp tục"
                        : "Đặt hàng"}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
