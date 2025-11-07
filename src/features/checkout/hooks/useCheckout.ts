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

  const {
    data: addresses = [],
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.getAll().then((res) => res.data),
  });

  const { data: allPaymentMethods = [], isLoading: isLoadingPaymentMethods } =
    useQuery<PaymentMethod[]>({
      queryKey: ["payment-methods"],
      queryFn: () => paymentMethodsApi.getAll().then((res) => res.data),
    });

  const paymentMethods = useMemo(
    () => allPaymentMethods.filter((method) => method.type === "E_WALLET"),
    [allPaymentMethods]
  );

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

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((m) => m.id === selectedPaymentMethodId),
    [paymentMethods, selectedPaymentMethodId]
  );

  const selectedItems = useMemo(() => cart.items, [cart.items]);

  const canProceed = useMemo(() => {
    return (
      selectedItems.length > 0 &&
      selectedAddressId !== "" &&
      selectedPaymentMethodId !== ""
    );
  }, [selectedItems.length, selectedAddressId, selectedPaymentMethodId]);

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

        if (selectedPaymentMethod?.type === "E_WALLET" && paymentUrl) {
          await clearCart();

          await Linking.openURL(paymentUrl);

          router.replace(`/(app)/payment-result?orderId=${orderId}`);
        } else {
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
    addresses,
    paymentMethods,
    selectedAddress,
    selectedPaymentMethod,
    cart,
    selectedItems,

    selectedAddressId,
    selectedPaymentMethodId,
    setSelectedAddressId,
    setSelectedPaymentMethodId,

    isLoading:
      isLoadingAddresses ||
      isLoadingPaymentMethods ||
      createOrderMutation.isPending,
    isPlacingOrder: createOrderMutation.isPending,

    canProceed,

    placeOrder,
    refetchAddresses,
  };
};
