import React from "react";
import { View, Text, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../../src/shared/ui";
import { usePaymentResult } from "../../src/features/payment/hooks/usePaymentResult";
import { PaymentResultContent } from "../../src/features/payment/components/PaymentResultContent";

export default function PaymentResultScreen() {
  const params = useLocalSearchParams<{
    orderId: string;
    success?: string;
    amount?: string;
    code?: string;
    message?: string;
  }>();

  const {
    paymentStatus,
    orderDetails,
    orderData,
    amount,
    orderId,
    handleGoHome,
    handleRetry,
    handleGoToOrders,
  } = usePaymentResult(params);

  if (!orderId) {
    return (
      <SafeAreaView
        className="flex-1 bg-neutral-50 items-center justify-center"
        edges={["bottom", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
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
    <SafeAreaView
      className="flex-1 bg-neutral-50"
      edges={["bottom", "left", "right"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View className="flex-1 px-4 py-6 justify-center">
        <Card variant="elevated" padding="xl">
          <View className="items-center space-y-6">
            <PaymentResultContent
              paymentStatus={paymentStatus}
              orderId={orderId}
              amount={amount}
              orderData={orderData}
              onGoHome={handleGoHome}
              onGoToOrders={handleGoToOrders}
              onRetry={handleRetry}
            />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}
