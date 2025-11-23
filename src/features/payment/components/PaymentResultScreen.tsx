import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../../../shared/ui";
import { formatCurrency } from "../../../shared/lib/utils";

interface PaymentResult {
  status: "success" | "failed";
  orderId: string;
  amount?: string;
  code?: string;
  message?: string;
}

interface PaymentResultScreenProps {
  paymentResult: PaymentResult;
  orderTotal?: number;
  onGoHome: () => void;
  onGoToOrders: () => void;
}

export const PaymentResultScreen = memo<PaymentResultScreenProps>(
  ({ paymentResult, orderTotal, onGoHome, onGoToOrders }) => {
    const isSuccess = paymentResult.status === "success";

    return (
      <View style={styles.container}>
        <Card variant="elevated" padding="xl">
          <View style={styles.content}>
            {isSuccess ? (
              <>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>Thanh toán thành công!</Text>
                  <Text style={styles.subtitle}>
                    Đơn hàng của bạn đã được xử lý thành công
                  </Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    Mã đơn hàng: #{paymentResult.orderId}
                  </Text>
                  {paymentResult.amount && (
                    <Text style={styles.infoText}>
                      Số tiền: {formatCurrency(Number(paymentResult.amount))}
                    </Text>
                  )}
                </View>
                <View style={styles.buttonsContainer}>
                  <Button
                    title="Xem đơn hàng của tôi"
                    onPress={onGoToOrders}
                    size="lg"
                    variant="primary"
                  />
                  <Button
                    title="Tiếp tục mua sắm"
                    onPress={onGoHome}
                    size="lg"
                    variant="outline"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.failedIconContainer}>
                  <Ionicons name="close-circle" size={48} color="#ef4444" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.titleFailed}>Thanh toán thất bại</Text>
                  <Text style={styles.subtitle}>
                    Có lỗi xảy ra trong quá trình thanh toán
                  </Text>
                </View>
                <View style={styles.infoContainerFailed}>
                  <View style={styles.infoRow}>
                    <Ionicons name="cube-outline" size={18} color="#9ca3af" />
                    <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
                    <Text style={styles.infoValue}>#{paymentResult.orderId}</Text>
                  </View>
                  {((paymentResult.amount && Number(paymentResult.amount) > 0) ||
                    orderTotal) && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số tiền:</Text>
                        <Text style={[styles.infoValue, { color: "#16a34a" }]}>
                          {paymentResult.amount
                            ? formatCurrency(Number(paymentResult.amount))
                            : orderTotal
                              ? formatCurrency(orderTotal)
                              : ""}
                        </Text>
                      </View>
                    )}
                </View>
                <View style={styles.buttonsContainer}>
                  <Button
                    title="Đơn hàng của tôi"
                    onPress={onGoToOrders}
                    size="lg"
                    variant="primary"
                  />
                  <Button
                    title="Trang chủ"
                    onPress={onGoHome}
                    size="lg"
                    variant="outline"
                  />
                </View>
              </>
            )}
          </View>
        </Card>
      </View>
    );
  }
);

PaymentResultScreen.displayName = "PaymentResultScreen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  content: {
    alignItems: "center",
    gap: 24,
    width: "100%",
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  failedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#171717",
    textAlign: "center",
  },
  titleFailed: {
    fontSize: 20,
    fontWeight: "600",
    color: "#dc2626",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#525252",
    textAlign: "center",
  },
  infoContainer: {
    backgroundColor: "#dcfce7",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    gap: 8,
  },
  infoContainerFailed: {
    width: "100%",
    marginTop: 20,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#166534",
    textAlign: "center",
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#171717",
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
});


