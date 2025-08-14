import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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
  const { t } = useLocalization();

  return (
    <View className="space-y-3">
      <Text className="text-lg font-semibold text-neutral-900">
        {t("checkout.shippingAddress")}
      </Text>

      {addresses.map((address) => (
        <TouchableOpacity
          key={address.id}
          onPress={() => onSelect(address.id)}
          className={`border rounded-lg p-4 ${
            selectedId === address.id
              ? "border-primary-500 bg-primary-50"
              : "border-neutral-200 bg-white"
          }`}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 space-y-1">
              <View className="flex-row items-center space-x-2">
                <Text className="font-semibold text-neutral-900">
                  {address.name}
                </Text>
                {address.isDefault && (
                  <Badge text="Default" size="sm" variant="secondary" />
                )}
                <Badge text={address.type} size="sm" variant="outline" />
              </View>

              <Text className="text-sm text-neutral-600">{address.phone}</Text>

              <Text className="text-sm text-neutral-700">
                {address.street}, {address.ward}, {address.district},{" "}
                {address.city}
              </Text>
            </View>

            <View className="ml-3">
              <Ionicons
                name={
                  selectedId === address.id
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color={selectedId === address.id ? "#22c55e" : "#d1d5db"}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const PaymentMethodSelector: React.FC<{
  paymentMethods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ paymentMethods, selectedId, onSelect }) => {
  const { t } = useLocalization();

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

  return (
    <View className="space-y-3">
      <Text className="text-lg font-semibold text-neutral-900">
        {t("checkout.paymentMethod")}
      </Text>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          onPress={() => onSelect(method.id)}
          className={`border rounded-lg p-4 ${
            selectedId === method.id
              ? "border-primary-500 bg-primary-50"
              : "border-neutral-200 bg-white"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                <Ionicons
                  name={getPaymentIcon(method.type)}
                  size={20}
                  color="#6b7280"
                />
              </View>

              <View>
                <Text className="font-medium text-neutral-900">
                  {method.name}
                </Text>
                <Text className="text-sm text-neutral-600">
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
              color={selectedId === method.id ? "#22c55e" : "#d1d5db"}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function CheckoutScreen() {
  const { t } = useLocalization();
  const toast = useToast();
  const { cart, clearCart } = useCart();

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
    createOrderMutation.mutate(data);
  };

  if (cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-neutral-600">Your cart is empty</Text>
        <Button
          title="Browse Products"
          onPress={() => router.push("/catalog")}
          className="mt-4"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="p-4 space-y-6">
            {/* Order Summary */}
            <Card padding="md">
              <Text className="text-lg font-semibold text-neutral-900 mb-4">
                {t("checkout.orderSummary")}
              </Text>

              <View className="space-y-3">
                {cart.items.map((item) => (
                  <View key={item.id} className="flex-row space-x-3">
                    <Image
                      source={{ uri: item.product.images[0] }}
                      style={{ width: 50, height: 50 }}
                      className="rounded-md"
                    />

                    <View className="flex-1">
                      <Text
                        className="font-medium text-neutral-900"
                        numberOfLines={1}
                      >
                        {item.product.name}
                      </Text>
                      <Text className="text-sm text-neutral-600">
                        {item.quantity} × {formatCurrency(item.price)}
                      </Text>
                    </View>

                    <Text className="font-semibold text-neutral-900">
                      {formatCurrency(item.subtotal)}
                    </Text>
                  </View>
                ))}

                <View className="border-t border-neutral-200 pt-3 space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600">Subtotal</Text>
                    <Text>{formatCurrency(cart.subtotal)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600">Shipping</Text>
                    <Text>{formatCurrency(cart.shippingFee)}</Text>
                  </View>
                  <View className="flex-row justify-between font-semibold">
                    <Text className="text-lg font-semibold">Total</Text>
                    <Text className="text-lg font-bold text-primary-600">
                      {formatCurrency(cart.total)}
                    </Text>
                  </View>
                </View>
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
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-neutral-900">
                {t("checkout.notes")}
              </Text>

              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={t("checkout.notesPlaceholder")}
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                    className="min-h-[80px]"
                  />
                )}
              />
            </View>
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View className="border-t border-neutral-200 p-4">
          <Button
            title={t("checkout.placeOrder")}
            onPress={handleSubmit(onSubmit)}
            loading={createOrderMutation.isPending}
            disabled={!isValid || createOrderMutation.isPending}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
