import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PaymentErrorScreenProps {
  error: string;
  onRetry: () => void;
  onGoBack: () => void;
}

export const PaymentErrorScreen = memo<PaymentErrorScreenProps>(
  ({ error, onRetry, onGoBack }) => {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retryButton, styles.cancelButton]}
            onPress={onGoBack}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

PaymentErrorScreen.displayName = "PaymentErrorScreen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#00A86B",
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#888",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});


