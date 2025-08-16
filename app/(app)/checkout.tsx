import React, { useState } from "react";
import {
  View,
  Text,
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
import { useCart, useLocalization } from "../../src/shared/hooks";
import { useToast } from "../../src/shared/ui/toast";
import { formatCurrency } from "../../src/shared/lib/utils";
import { Address, PaymentMethod, CheckoutFormData } from "../../src/types";

const checkoutSchema = z.object({
  addressId: z.string().min(1, "Please select a delivery address"),
  paymentMethodId: z.string().min(1, "Please select a payment method"),
  notes: z.string().optional(),
});

const AddressSelector: React.FC<{
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ addresses, selectedId, onSelect }) => {
  return (
    <Card variant="elevated" padding="lg">
      <View className="space-y-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="location-outline" size={20} color="#00623A" />
            <Text className="text-lg font-semibold text-neutral-900">
              Địa Chỉ Giao Hàng
            </Text>
          </View>
          <TouchableOpacity>
            <Text className="text-primary-600 font-medium">Thêm mới</Text>
          </TouchableOpacity>
        </View>

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
              <View className="flex-1 space-y-2">
                <View className="flex-row items-center space-x-2">
                  <Text className="font-semibold text-neutral-900 text-base">
                    {address.name}
                  </Text>
                  {address.isDefault && (
                    <Badge text="Mặc định" size="xs" variant="success" />
                  )}
                  <Badge
                    text={
                      address.type === "HOME"
                        ? "Nhà"
                        : address.type === "OFFICE"
                        ? "Văn phòng"
                        : "Khác"
                    }
                    size="xs"
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

              <View className="ml-3">
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
      <View className="space-y-4">
        <View className="flex-row items-center space-x-2">
          <Ionicons name="wallet-outline" size={20} color="#00623A" />
          <Text className="text-lg font-semibold text-neutral-900">
            Phương Thức Thanh Toán
          </Text>
        </View>

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
              <View className="flex-row items-center space-x-3">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: `${getPaymentColor(method.type)}15`,
                  }}
                >
                  <Ionicons
                    name={getPaymentIcon(method.type)}
                    size={24}
                    color={getPaymentColor(method.type)}
                  />
                </View>

                <View className="flex-1">
                  <Text className="font-semibold text-neutral-900 text-base">
                    {method.name}
                  </Text>
                  <Text className="text-sm text-neutral-600 leading-5">
                    {method.description}
                  </Text>
                  {method.type === "COD" && (
                    <View className="flex-row items-center space-x-1 mt-1">
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
    </Card>
  );
};

export default function CheckoutScreen() {
  const { t } = useLocalization();
  const toast = useToast();
  const { cart, clearCart } = useCart();
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState("asap");

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
    onSuccess: (response) => {
      if (response.success) {
        clearCart();
        toast.success(
          t("checkout.orderPlaced"),
          t("checkout.orderPlacedDescription")
        );
        router.replace(`/(app)/track/${response.data.id}`);
      }
    },
    onError: () => {
      toast.error("Order failed", "Please try again");
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      addressId: addresses.find((a) => a.isDefault)?.id || "",
      paymentMethodId: paymentMethods[0]?.id || "",
      notes: "",
    },
  });

  const watchedAddressId = watch("addressId");
  const watchedPaymentMethodId = watch("paymentMethodId");

  // Set default values when data loads
  React.useEffect(() => {
    if (addresses.length > 0 && !watchedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      setValue("addressId", defaultAddress.id);
    }
  }, [addresses, watchedAddressId, setValue]);

  React.useEffect(() => {
    if (paymentMethods.length > 0 && !watchedPaymentMethodId) {
      setValue("paymentMethodId", paymentMethods[0].id);
    }
  }, [paymentMethods, watchedPaymentMethodId, setValue]);

  const onSubmit = (data: CheckoutFormData) => {
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
              deliveryTime: selectedDeliveryTime,
            }),
        },
      ]
    );
  };

  if (cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <View className="items-center space-y-4 px-8">
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

      {/* Header */}
      <View className="bg-white shadow-sm border-b border-neutral-100">
        <View className="px-4 py-3 flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-neutral-900 flex-1">
            Thanh Toán
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="p-4 space-y-6">
            {/* Order Summary */}
            <Card variant="elevated" padding="lg">
              <View className="space-y-4">
                <View className="flex-row items-center space-x-2">
                  <Ionicons name="receipt-outline" size={20} color="#00623A" />
                  <Text className="text-lg font-semibold text-neutral-900">
                    Đơn Hàng ({cart.itemCount} món)
                  </Text>
                </View>

                <View className="space-y-3">
                  {cart.items.map((item) => (
                    <View key={item.id} className="flex-row space-x-3">
                      <Image
                        source={{ uri: item.product.images[0] }}
                        style={{ width: 60, height: 60 }}
                        className="rounded-xl"
                      />

                      <View className="flex-1 space-y-1">
                        <Text
                          className="font-semibold text-neutral-900"
                          numberOfLines={2}
                        >
                          {item.product.name}
                        </Text>
                        <View className="flex-row items-center space-x-2">
                          <Text className="text-sm text-neutral-600">
                            {item.quantity} × {formatCurrency(item.price)}
                          </Text>
                          {item.product.tags?.includes("organic") && (
                            <Badge text="Organic" variant="success" size="xs" />
                          )}
                        </View>
                      </View>

                      <Text className="font-bold text-neutral-900 text-lg">
                        {formatCurrency(item.subtotal)}
                      </Text>
                    </View>
                  ))}

                  <View className="border-t border-neutral-200 pt-3 space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-600">Tạm tính</Text>
                      <Text className="font-medium">
                        {formatCurrency(cart.subtotal)}
                      </Text>
                    </View>
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
                    <View className="flex-row justify-between pt-2 border-t border-neutral-100">
                      <Text className="text-lg font-semibold text-neutral-900">
                        Tổng cộng
                      </Text>
                      <Text className="text-lg font-bold text-primary-600">
                        {formatCurrency(cart.total)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>

            {/* Delivery Time Selection */}
            <Card variant="elevated" padding="lg">
              <View className="space-y-4">
                <View className="flex-row items-center space-x-2">
                  <Ionicons name="time-outline" size={20} color="#00623A" />
                  <Text className="text-lg font-semibold text-neutral-900">
                    Thời Gian Giao Hàng
                  </Text>
                </View>

                {deliveryTimeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedDeliveryTime(option.id)}
                    className={`border-2 rounded-xl p-4 ${
                      selectedDeliveryTime === option.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="font-semibold text-neutral-900">
                          {option.label}
                        </Text>
                        <Text className="text-sm text-neutral-600">
                          Dự kiến: {option.time}
                        </Text>
                      </View>

                      <View className="flex-row items-center space-x-2">
                        {option.price === 0 && (
                          <Badge text="Miễn phí" variant="success" size="xs" />
                        )}
                        <Ionicons
                          name={
                            selectedDeliveryTime === option.id
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={24}
                          color={
                            selectedDeliveryTime === option.id
                              ? "#00623A"
                              : "#d1d5db"
                          }
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Address Selection */}
            {addresses.length > 0 && (
              <AddressSelector
                addresses={addresses}
                selectedId={watchedAddressId}
                onSelect={(id) => setValue("addressId", id)}
              />
            )}

            {/* Payment Method Selection */}
            {paymentMethods.length > 0 && (
              <PaymentMethodSelector
                paymentMethods={paymentMethods}
                selectedId={watchedPaymentMethodId}
                onSelect={(id) => setValue("paymentMethodId", id)}
              />
            )}

            {/* Order Notes */}
            <Card variant="elevated" padding="lg">
              <View className="space-y-4">
                <View className="flex-row items-center space-x-2">
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#00623A"
                  />
                  <Text className="text-lg font-semibold text-neutral-900">
                    Ghi Chú Đơn Hàng
                  </Text>
                </View>

                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={3}
                      className="min-h-[80px]"
                    />
                  )}
                />
              </View>
            </Card>
          </View>
        </ScrollView>

        {/* Bottom Order Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200">
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,1)"]}
            className="px-4 py-4"
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
              <View className="flex-row items-center space-x-2">
                {createOrderMutation.isPending ? (
                  <Text className="text-neutral-500 font-semibold text-lg">
                    Đang xử lý...
                  </Text>
                ) : (
                  <>
                    <Ionicons name="card-outline" size={20} color="white" />
                    <Text className="text-white font-semibold text-lg">
                      Đặt hàng • {formatCurrency(cart.total)}
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
