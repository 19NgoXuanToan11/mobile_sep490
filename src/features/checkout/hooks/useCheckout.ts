import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import {
  ordersApi,
  addressesApi,
  paymentMethodsApi,
} from "../../../shared/data/api";
import { vnpayApi } from "../../../shared/data/paymentApiService";
import { useToast } from "../../../shared/ui/toast";
import { useAuth, useCart } from "../../../shared/hooks";
import { Address, PaymentMethod } from "../../../types";

interface UseCheckoutOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useCheckout = (options?: UseCheckoutOptions) => {
  const toast = useToast();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>("");

  // Fetch addresses
  const {
    data: addresses = [],
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.getAll().then((res) => res.data),
  });

  // Fetch payment methods (only E_WALLET/VNPay)
  const { data: allPaymentMethods = [], isLoading: isLoadingPaymentMethods } =
    useQuery<PaymentMethod[]>({
      queryKey: ["payment-methods"],
      queryFn: () => paymentMethodsApi.getAll().then((res) => res.data),
    });

  // Filter to show only E_WALLET payment methods (VNPay)
  const paymentMethods = useMemo(
    () => allPaymentMethods.filter((method) => method.type === "E_WALLET"),
    [allPaymentMethods]
  );

  // Auto-select default address
  useMemo(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId]);

  // Get selected address object
  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  // Get selected payment method object
  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((m) => m.id === selectedPaymentMethodId),
    [paymentMethods, selectedPaymentMethodId]
  );

  // Get only selected items for checkout
  const selectedItems = useMemo(
    () => cart.items.filter((item) => item.selected),
    [cart.items]
  );

  // Validation
  const canProceed = useMemo(() => {
    return (
      selectedItems.length > 0 &&
      selectedAddressId !== "" &&
      selectedPaymentMethodId !== ""
    );
  }, [selectedItems.length, selectedAddressId, selectedPaymentMethodId]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddress) {
        throw new Error("Vui lòng chọn địa chỉ giao hàng");
      }

      const fullAddress = `${selectedAddress.customerName} - ${selectedAddress.phoneNumber}\n${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`;

      const orderData = {
        orderItems: selectedItems.map((item) => ({
          productId: Number(item.productId),
          stockQuantity: item.quantity,
        })),
        shippingAddress: fullAddress,
      };

      return await ordersApi.create(orderData);
    },
    onSuccess: async (response) => {
      if (response.success) {
        const { orderId, paymentUrl } = response.data;

        // Check if E_WALLET payment
        if (selectedPaymentMethod?.type === "E_WALLET" && paymentUrl) {
          // Clear cart before redirect
          await clearCart();

          // Open VNPay payment URL
          await Linking.openURL(paymentUrl);

          // Navigate to payment result page (user can return here)
          router.replace(`/(app)/payment-result?orderId=${orderId}`);
        } else {
          // COD payment - create payment record
          await vnpayApi.createOrderPayment(orderId);
          await clearCart();

          toast.success("Đặt hàng thành công", "Đơn hàng của bạn đã được tạo");
          router.replace("/(app)/orders" as any);
        }

        options?.onSuccess?.();
      } else {
        throw new Error(response.message || "Không thể tạo đơn hàng");
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Đã xảy ra lỗi khi tạo đơn hàng";
      toast.error("Lỗi", errorMessage);
      options?.onError?.(errorMessage);
    },
  });

  // Place order handler
  const placeOrder = useCallback(() => {
    if (!canProceed) {
      if (cart.items.length === 0) {
        toast.error("Giỏ hàng trống", "Vui lòng thêm sản phẩm vào giỏ hàng");
        return;
      }
      if (!selectedAddressId) {
        toast.error("Thiếu địa chỉ", "Vui lòng chọn địa chỉ giao hàng");
        return;
      }
      if (!selectedPaymentMethodId) {
        toast.error(
          "Thiếu phương thức thanh toán",
          "Vui lòng chọn phương thức thanh toán"
        );
        return;
      }
      return;
    }

    createOrderMutation.mutate();
  }, [
    canProceed,
    cart.items.length,
    selectedAddressId,
    selectedPaymentMethodId,
    createOrderMutation,
    toast,
  ]);

  return {
    // Data
    addresses,
    paymentMethods,
    selectedAddress,
    selectedPaymentMethod,
    cart,
    selectedItems, // Only items that are selected for checkout

    // States
    selectedAddressId,
    selectedPaymentMethodId,
    setSelectedAddressId,
    setSelectedPaymentMethodId,

    // Loading
    isLoading:
      isLoadingAddresses ||
      isLoadingPaymentMethods ||
      createOrderMutation.isPending,
    isPlacingOrder: createOrderMutation.isPending,

    // Validation
    canProceed,

    // Actions
    placeOrder,
    refetchAddresses,
  };
};
