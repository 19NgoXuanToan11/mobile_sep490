import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ActivityIndicator } from "react-native";

interface PaymentLoadingIndicatorProps {
  loadingTime: number;
  onRetry: () => void;
  renderExternalBrowserButton: () => React.ReactNode;
}

export const PaymentLoadingIndicator = memo<PaymentLoadingIndicatorProps>(
  ({ loadingTime, onRetry, renderExternalBrowserButton }) => {
    const getLoadingMessage = (): { message: string; subMessage: string } => {
      if (loadingTime > 15) {
        return {
          message: "Vẫn đang kết nối...",
          subMessage: "Vui lòng thử lại hoặc mở trình duyệt",
        };
      }
      if (loadingTime > 5) {
        return {
          message: "Đang tải trang thanh toán...",
          subMessage: "Có thể mất nhiều thời gian hơn dự kiến",
        };
      }
      return {
        message: "Đang kết nối đến cổng thanh toán...",
        subMessage: "Vui lòng đợi trong giây lát",
      };
    };

    const { message, subMessage } = getLoadingMessage();

    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={styles.loadingText}>{message}</Text>
        <Text style={styles.loadingSubText}>{subMessage}</Text>
        <Text style={styles.loadingTime}>{loadingTime} giây</Text>
        {loadingTime > 5 && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
            {renderExternalBrowserButton()}
          </View>
        )}
      </View>
    );
  }
);

PaymentLoadingIndicator.displayName = "PaymentLoadingIndicator";

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#00A86B",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingSubText: {
    marginTop: 5,
    color: "#00A86B",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingTime: {
    marginTop: 5,
    color: "#00A86B",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#00A86B",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});


