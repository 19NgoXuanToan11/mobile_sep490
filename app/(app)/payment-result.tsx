import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card } from "../../src/shared/ui";
import { ordersApi } from "../../src/shared/data/api";
import { useToast } from "../../src/shared/ui/toast";
import { useCart } from "../../src/shared/hooks";
import { formatCurrency } from "../../src/shared/lib/utils";

export default function PaymentResultScreen() {
  const params = useLocalSearchParams<{
    orderId: string;
    success?: string;
    amount?: string;
    message?: string;
  }>();
  const { orderId, success, amount, message } = params;
  const toast = useToast();
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "success" | "failed"
  >("loading");
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Handle deep link parameters from VNPay callback
  useEffect(() => {
    if (success !== undefined) {
      // Direct callback from VNPay via deep link
      if (success === "true") {
        setPaymentStatus("success");
        handlePaymentSuccess();
        toast.success(
          "Thanh toán thành công",
          message || "Giao dịch đã được xử lý thành công"
        );
      } else {
        setPaymentStatus("failed");
        toast.error(
          "Thanh toán thất bại"
        );
      }
    }
  }, [success, message]);

  // Check payment status (only if not from deep link)
  const { data: paymentData, isLoading } = useQuery({
    queryKey: ["payment-status", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID not found");
      return await ordersApi.getPaymentStatus(Number(orderId));
    },
    enabled: !!orderId && success === undefined, // Only poll if not from deep link
    refetchInterval:
      paymentStatus === "loading" && success === undefined ? 3000 : false,
    refetchIntervalInBackground: false,
  });

  // Get order details
  const { data: orderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID not found");
      return await ordersApi.getById(orderId);
    },
    enabled: !!orderId && paymentStatus === "success",
  });

  useEffect(() => {
    // Only process API data if not from deep link
    if (success === undefined && paymentData?.success) {
      const { isSuccess, vnpayResponseCode, isPending } = paymentData.data;

      // 🔥 SỬA: Kiểm tra isPending trước
      if (isPending === true) {
        setPaymentStatus("loading");
      } else if (isSuccess === true) {
        setPaymentStatus("success");
        handlePaymentSuccess();
      } else if (isSuccess === false) {
        setPaymentStatus("failed");
        const errorMessage =
          vnpayResponseCode !== "00"
            ? `Mã lỗi VNPay: ${vnpayResponseCode}`
            : "Giao dịch không thành công";
        toast.error("Thanh toán thất bại", errorMessage);
      } else {
        // Keep loading state để tiếp tục polling
      }
    } else if (success === undefined && paymentData?.success === false) {
      setPaymentStatus("failed");
      toast.error(
        "Lỗi kiểm tra thanh toán",
        paymentData.message || "Vui lòng thử lại"
      );
    }
  }, [paymentData, success]);

  const handlePaymentSuccess = async () => {
    try {
      // Create order payment record
      const paymentResult = await ordersApi.createOrderPayment(orderId);

      if (paymentResult.success) {
        // Clear cart and show success
        await clearCart();
        toast.success(
          "Thanh toán thành công",
          "Đơn hàng đã được xử lý thành công"
        );
        setOrderDetails(paymentResult.data);
      } else {
        toast.error("Lỗi thanh toán", "Không thể hoàn tất đơn hàng");
        setPaymentStatus("failed");
      }
    } catch (error) {
      console.error("Payment success handling error:", error);
      toast.error("Lỗi xử lý thanh toán", "Vui lòng liên hệ hỗ trợ");
      setPaymentStatus("failed");
    }
  };

  const handleRetry = () => {
    router.replace("/(app)/checkout");
  };

  const handleGoToOrders = () => {
    router.replace("/(app)/(tabs)/orders");
  };

  const handleGoHome = () => {
    router.replace("/(app)/(tabs)/home");
  };

  if (!orderId) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center" edges={['bottom', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <Card variant="elevated" padding="lg">
          <View className="items-center space-y-4">
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text className="text-lg font-semibold text-neutral-900">
              Không tìm thấy thông tin đơn hàng
            </Text>
            <Button title="Về trang chủ" onPress={handleGoHome} size="lg" />
          </View>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View className="flex-1 px-4 py-6 justify-center">
        <Card variant="elevated" padding="xl">
          <View className="items-center space-y-6">
            {paymentStatus === "loading" && (
              <>
                <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                </View>
                <View className="items-center space-y-2">
                  <Text className="text-xl font-semibold text-neutral-900">
                    Đang xử lý thanh toán
                  </Text>
                  <Text className="text-neutral-600 text-center">
                    Vui lòng đợi trong khi chúng tôi xác nhận thanh toán của
                    bạn...
                  </Text>
                </View>
                <View className="bg-blue-50 p-4 rounded-lg w-full">
                  <Text className="text-blue-800 text-sm text-center">
                    Mã đơn hàng: #{orderId}
                  </Text>
                </View>
              </>
            )}

            {paymentStatus === "success" && (
              <>
                <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
                  <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                </View>
                <View className="items-center space-y-2">
                  <Text className="text-xl font-semibold text-neutral-900">
                    Thanh toán thành công!
                  </Text>
                  <Text className="text-neutral-600 text-center">
                    Đơn hàng của bạn đã được thanh toán và đang được xử lý
                  </Text>
                </View>
                <View className="bg-green-50 p-4 rounded-lg w-full space-y-2">
                  <Text className="text-green-800 text-sm text-center font-medium">
                    Mã đơn hàng: #{orderId}
                  </Text>
                  {amount && (
                    <Text className="text-green-800 text-sm text-center">
                      Số tiền: {formatCurrency(Number(amount))}
                    </Text>
                  )}
                </View>
                <View className="w-full space-y-3">
                  <Button
                    title="Xem đơn hàng của tôi"
                    onPress={handleGoToOrders}
                    size="lg"
                    variant="primary"
                  />
                  <Button
                    title="Tiếp tục mua sắm"
                    onPress={handleGoHome}
                    size="lg"
                    variant="outline"
                  />
                </View>
              </>
            )}

            {paymentStatus === "failed" && (
              <>
                <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center">
                  <Ionicons name="close-circle" size={48} color="#ef4444" />
                </View>
                <View className="items-center space-y-2">
                  <Text className="text-xl font-semibold text-neutral-900">
                    Thanh toán thất bại
                  </Text>
                  <Text className="text-neutral-600 text-center">
                    Giao dịch của bạn không thành công. Vui lòng thử lại.
                  </Text>
                </View>
                <View className="bg-red-50 p-4 rounded-lg w-full mt-5">
                  <Text className="text-red-800 text-sm text-center">
                    Mã đơn hàng: #{orderId}
                  </Text>
                </View>
                <View className="w-full space-y-3 mt-5">
                  <Button
                    title="Về trang chủ"
                    onPress={handleGoHome}
                    size="lg"
                    variant="outline"
                  />
                </View>
              </>
            )}
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}
