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
          {paymentMethods.map((method) => (
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
                    {method.type === "COD" && (
                      <View className="flex-row items-center space-x-1 mt-1.5">
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={12}
                          color="#22c55e"
                        />
                        <Text className="text-xs text-success-600">
                          Thanh toán an toàn
                        </Text>
                      </View>
                    )}
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

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: async (response) => {
      if (response.success) {
        const orderId = response.data.id;

        // Check if using VNPAY payment
        const paymentMethod = paymentMethods.find(
          (m) => m.id === watchedPaymentMethodId
        );

        if (paymentMethod?.type === "E_WALLET") {
          // Process VNPAY payment
          try {
            const paymentResponse = await vnpayApi.createPaymentUrl({
              orderId: Number(orderId),
              amount: cart.total,
              orderDescription: `Thanh toán đơn hàng #${orderId}`,
              name: user?.name ?? "Customer",
            });

            if (paymentResponse.success && paymentResponse.data?.paymentUrl) {
              // Open VNPAY payment URL
              await Linking.openURL(paymentResponse.data.paymentUrl);

              // Navigate to payment result page
              toast.info("Chuyển sang VNPAY", "Vui lòng hoàn tất thanh toán");
              router.replace(`/(app)/payment-result?orderId=${orderId}`);
            } else {
              toast.error(
                "Lỗi thanh toán",
                "Không thể tạo liên kết thanh toán"
              );
            }
          } catch (error) {
            console.error("Payment error:", error);
            toast.error("Lỗi thanh toán", "Vui lòng thử lại sau");
          }
        } else {
          // COD payment - go directly to order tracking
          clearCart();
          toast.success("Đặt hàng thành công", "Đơn hàng của bạn đã được tạo");
          router.replace(`/(app)/track/${orderId}`);
        }
      }
    },
    onError: () => {
      toast.error("Đặt hàng thất bại", "Vui lòng thử lại");
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
      paymentMethodId: paymentMethods[0]?.id || "",
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

  React.useEffect(() => {
    if (paymentMethods.length > 0 && !watchedPaymentMethodId) {
      setValue("paymentMethodId", paymentMethods[0].id);
    }
  }, [paymentMethods, watchedPaymentMethodId, setValue]);

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

    Alert.alert(
      "Xác nhận đặt hàng",
      `Bạn có chắc muốn đặt hàng với tổng tiền ${formatCurrency(cart.total)}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đặt hàng",
          onPress: () =>
            createOrderMutation.mutate({
              ...data,
            } as any),
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
                    {cart.items.map((item) => (
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
                      <View className="flex-row justify-between items-center">
                        <Text className="text-neutral-600 text-base">
                          Phí giao hàng
                        </Text>
                        <View className="items-end">
                          {cart.shippingFee === 0 ? (
                            <Text className="text-success-600 font-medium text-base">
                              Miễn phí
                            </Text>
                          ) : (
                            <Text className="font-medium text-neutral-900 text-base">
                              {formatCurrency(cart.shippingFee)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View className="flex-row justify-between items-center pt-3 border-t border-neutral-200">
                        <Text className="text-lg font-semibold text-neutral-900">
                          Tổng cộng
                        </Text>
                        <Text className="text-xl font-bold text-primary-600">
                          {formatCurrency(cart.total)}
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
                  <View className="space-y-4">
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
                          leftIcon="location-outline"
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
              disabled={!isValid || createOrderMutation.isPending}
              className={`rounded-xl py-4 items-center justify-center ${
                !isValid || createOrderMutation.isPending
                  ? "bg-neutral-300"
                  : "bg-primary-500"
              }`}
              style={{
                shadowColor: "#00623A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: createOrderMutation.isPending ? 0 : 0.3,
                shadowRadius: 8,
                elevation: createOrderMutation.isPending ? 0 : 6,
              }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center space-x-2">
                {createOrderMutation.isPending ? (
                  <>
                    <View className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-600 rounded-full animate-spin" />
                    <Text className="text-neutral-500 font-semibold text-lg">
                      Đang xử lý...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-semibold text-lg">
                      Đặt hàng
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
