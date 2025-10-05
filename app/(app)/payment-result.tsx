import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { Card, Button } from "../../src/shared/ui";
import { vnpayApi } from "../../src/shared/data/paymentApiService";
import { formatCurrency } from "../../src/shared/lib/utils";
import { useCart } from "../../src/shared/hooks";

export default function PaymentResultScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "SUCCESS" | "FAILED" | "PENDING"
  >("PENDING");
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    checkPaymentStatus();
  }, [orderId]);

  const checkPaymentStatus = async () => {
    if (!orderId) {
      setLoading(false);
      setPaymentStatus("FAILED");
      return;
    }

    try {
      setLoading(true);
      const response = await vnpayApi.getPaymentByOrderId(Number(orderId));

      if (response.success && response.data) {
        setPaymentData(response.data);

        // Check payment status
        const status = response.data.status?.toUpperCase();
        if (
          status === "SUCCESS" ||
          status === "PAID" ||
          status === "COMPLETED"
        ) {
          setPaymentStatus("SUCCESS");
          // Clear cart on successful payment
          await clearCart();
        } else if (status === "FAILED" || status === "CANCELLED") {
          setPaymentStatus("FAILED");
        } else {
          setPaymentStatus("PENDING");
        }
      } else {
        setPaymentStatus("PENDING");
      }
    } catch (error) {
      console.error("Check payment status error:", error);
      setPaymentStatus("FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId) return;

    try {
      const response = await vnpayApi.createPaymentUrl({
        orderId: Number(orderId),
        amount: paymentData?.amount ?? 0,
        orderDescription: `Thanh toán đơn hàng #${orderId}`,
        name: "Customer",
      });

      if (response.success && response.data?.paymentUrl) {
        // Open VNPAY payment URL
        await Linking.openURL(response.data.paymentUrl);
      }
    } catch (error) {
      console.error("Retry payment error:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <ActivityIndicator size="large" color="#00623A" />
        <Text className="mt-4 text-neutral-600">
          Đang kiểm tra thanh toán...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View className="flex-1 items-center justify-center px-6">
        {/* Status Icon */}
        <View
          className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
            paymentStatus === "SUCCESS"
              ? "bg-success-100"
              : paymentStatus === "FAILED"
              ? "bg-red-100"
              : "bg-warning-100"
          }`}
        >
          <Ionicons
            name={
              paymentStatus === "SUCCESS"
                ? "checkmark-circle"
                : paymentStatus === "FAILED"
                ? "close-circle"
                : "time"
            }
            size={80}
            color={
              paymentStatus === "SUCCESS"
                ? "#16a34a"
                : paymentStatus === "FAILED"
                ? "#ef4444"
                : "#f59e0b"
            }
          />
        </View>

        {/* Status Text */}
        <Text className="text-2xl font-bold text-neutral-900 mb-3 text-center">
          {paymentStatus === "SUCCESS"
            ? "Thanh toán thành công!"
            : paymentStatus === "FAILED"
            ? "Thanh toán thất bại"
            : "Đang chờ thanh toán"}
        </Text>

        <Text className="text-neutral-600 text-center mb-6 px-4">
          {paymentStatus === "SUCCESS"
            ? "Đơn hàng của bạn đã được thanh toán thành công. Chúng tôi sẽ xử lý và giao hàng sớm nhất."
            : paymentStatus === "FAILED"
            ? "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
            : "Đơn hàng của bạn đang chờ xác nhận thanh toán."}
        </Text>

        {/* Payment Details */}
        {paymentData && (
          <Card variant="elevated" padding="lg" className="w-full mb-6">
            <View className="space-y-4">
              <View className="flex-row items-center justify-between pb-4 border-b border-neutral-200">
                <Text className="text-lg font-semibold text-neutral-900">
                  Chi tiết thanh toán
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-neutral-600">Mã đơn hàng</Text>
                <Text className="font-semibold text-neutral-900">
                  #{orderId}
                </Text>
              </View>

              {paymentData.amount && (
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Số tiền</Text>
                  <Text className="font-semibold text-neutral-900">
                    {formatCurrency(paymentData.amount)}
                  </Text>
                </View>
              )}

              {paymentData.transactionNo && (
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Mã giao dịch</Text>
                  <Text className="font-semibold text-neutral-900 text-right flex-1 ml-2">
                    {paymentData.transactionNo}
                  </Text>
                </View>
              )}

              {paymentData.bankCode && (
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Ngân hàng</Text>
                  <Text className="font-semibold text-neutral-900">
                    {paymentData.bankCode}
                  </Text>
                </View>
              )}

              {paymentData.payDate && (
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">Thời gian</Text>
                  <Text className="font-semibold text-neutral-900">
                    {new Date(paymentData.payDate).toLocaleString("vi-VN")}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View className="w-full space-y-3">
          {paymentStatus === "SUCCESS" && (
            <>
              <Button
                title="Xem đơn hàng"
                onPress={() => router.push(`/(app)/track/${orderId}`)}
                size="lg"
                variant="primary"
              />
              <Button
                title="Tiếp tục mua sắm"
                onPress={() => router.push("/(app)/(tabs)/catalog")}
                size="lg"
                variant="outline"
              />
            </>
          )}

          {paymentStatus === "FAILED" && (
            <>
              <Button
                title="Thử lại"
                onPress={handleRetryPayment}
                size="lg"
                variant="primary"
              />
              <Button
                title="Về trang chủ"
                onPress={() => router.push("/(app)/(tabs)/home")}
                size="lg"
                variant="outline"
              />
            </>
          )}

          {paymentStatus === "PENDING" && (
            <>
              <Button
                title="Kiểm tra lại"
                onPress={checkPaymentStatus}
                size="lg"
                variant="primary"
              />
              <Button
                title="Xem đơn hàng"
                onPress={() => router.push(`/(app)/track/${orderId}`)}
                size="lg"
                variant="outline"
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
