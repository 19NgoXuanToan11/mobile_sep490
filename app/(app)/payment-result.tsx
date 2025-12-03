import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "../../src/shared/ui";
import { ordersApi } from "../../src/shared/data/api";
import { useToast } from "../../src/shared/ui/toast";
import { useCart } from "../../src/shared/hooks";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "../../src/shared/lib/utils";

export default function PaymentResultScreen() {
  const params = useLocalSearchParams<{
    orderId?: string | string[];
    success?: string | string[];
    amount?: string | string[];
    code?: string | string[];
    message?: string | string[];
  }>();

  const getParamValue = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const orderId = getParamValue(params.orderId);
  const success = getParamValue(params.success);
  const amount = getParamValue(params.amount);
  const code = getParamValue(params.code);
  const message = getParamValue(params.message);
  const toast = useToast();
  const { clearCart } = useCart();

  // Initialize payment status based on params to avoid showing loading screen
  // if we already have payment result from deep link
  const getInitialPaymentStatus = (): "loading" | "success" | "failed" => {
    if (success === "true") {
      // If we have success param, start with loading state but will quickly process
      // This prevents showing "failed" state initially
      return "loading";
    } else if (success === "false") {
      // If we have failed param, show failed state immediately
      return "failed";
    }
    // If no success param, we're polling for status
    return "loading";
  };

  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "success" | "failed"
  >(getInitialPaymentStatus());
  const hasProcessedPaymentRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Store message in ref to avoid recreating callback
  const messageRef = useRef(message);
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // Reset processing flags when orderId changes
  useEffect(() => {
    hasProcessedPaymentRef.current = false;
    isProcessingRef.current = false;
  }, [orderId]);

  const handlePaymentSuccess = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isProcessingRef.current || hasProcessedPaymentRef.current) {
      return;
    }

    isProcessingRef.current = true;
    hasProcessedPaymentRef.current = true;

    try {
      // Create order payment record
      const paymentResult = await ordersApi.createOrderPayment(Number(orderId));

      if (paymentResult.success) {
        // Clear cart
        await clearCart();
        // Không hiển thị toast thành công để tránh trùng với UI màn kết quả
        setPaymentStatus("success");
      } else {
        toast.error("Lỗi thanh toán", "Không thể hoàn tất đơn hàng");
        setPaymentStatus("failed");
        hasProcessedPaymentRef.current = false; // Allow retry
      }
    } catch (error) {
      toast.error("Lỗi xử lý thanh toán", "Vui lòng liên hệ hỗ trợ");
      setPaymentStatus("failed");
      hasProcessedPaymentRef.current = false; // Allow retry
    } finally {
      isProcessingRef.current = false;
    }
  }, [orderId, clearCart, toast]);

  // Handle deep link parameters from VNPay callback - only process once
  // This effect runs immediately when component mounts with success param
  useEffect(() => {
    // Only process if we have success param and haven't processed yet
    if (success !== undefined && !hasProcessedPaymentRef.current) {
      if (success === "true") {
        // Process payment success immediately
        // This will quickly change status from "loading" to "success"
        handlePaymentSuccess();
      } else if (success === "false") {
        // Payment failed - already set in initial state
        setPaymentStatus("failed");
        if (!hasProcessedPaymentRef.current) {
          // Không hiển thị toast để tránh trùng với UI màn kết quả
          hasProcessedPaymentRef.current = true; // Prevent duplicate processing
        }
      }
    }
  }, [
    code,
    handlePaymentSuccess,
    message,
    success,
    toast,
  ]);

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

  useEffect(() => {
    // Only process API data if not from deep link and haven't processed yet
    if (
      success === undefined &&
      paymentData?.success &&
      !hasProcessedPaymentRef.current
    ) {
      const { isSuccess, vnpayResponseCode, isPending } = paymentData.data;

      // Check isPending first
      if (isPending === true) {
        setPaymentStatus("loading");
      } else if (isSuccess === true) {
        // Process payment success (only once)
        handlePaymentSuccess();
      } else if (isSuccess === false) {
        setPaymentStatus("failed");
        // Không hiển thị toast để tránh trùng với UI màn kết quả
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
  }, [
    paymentData,
    success,
    handlePaymentSuccess,
    toast,
  ]);

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
                    Vui lòng đợi trong khi chúng tôi xác nhận thanh toán của bạn...
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
                <View className="bg-green-50 p-4 rounded-lg w-full space-y-4">
                  <View className="space-y-2">
                    <Text className="text-green-800 text-sm text-center font-medium">
                      Mã đơn hàng: #{orderId}
                    </Text>
                    {amount && (
                      <Text className="text-green-800 text-sm text-center">
                        Số tiền: {formatCurrency(Number(amount))}
                      </Text>
                    )}
                  </View>
                  <View className="space-y-3">
                    <Button
                      title="Đơn hàng"
                      onPress={handleGoToOrders}
                      size="lg"
                      variant="primary"
                      fullWidth
                    />
                    <Button
                      title="Trang chủ"
                      onPress={handleGoHome}
                      size="lg"
                      variant="outline"
                      fullWidth
                    />
                  </View>
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
                <View className="bg-red-50 p-4 rounded-lg w-full space-y-2">
                  <Text className="text-red-800 text-sm text-center font-medium">
                    Mã đơn hàng: #{orderId}
                  </Text>
                </View>
                <View className="w-full space-y-3 mt-5">
                  <Button
                    title="Trang chủ"
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
