import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
interface StickyCTAProps {
    isEnabled: boolean;
    isLoading: boolean;
    onPress: () => void;
    disabledMessage?: string;
}
export const StickyCTA = memo<StickyCTAProps>(
    ({ isEnabled, isLoading, onPress, disabledMessage }) => {
        const insets = useSafeAreaInsets();
        if (!isEnabled) {
            return (
                <View
                    style={[
                        styles.container,
                        { paddingBottom: Math.max(insets.bottom, 16) },
                    ]}
                >
                    <View style={styles.disabledBar}>
                        <Text style={styles.disabledText}>
                            {disabledMessage || "Chọn phương thức thanh toán để tiếp tục"}
                        </Text>
                    </View>
                </View>
            );
        }
        return (
            <View
                style={[
                    styles.container,
                    { paddingBottom: Math.max(insets.bottom, 16) },
                ]}
            >
                <TouchableOpacity
                    style={styles.button}
                    onPress={onPress}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#00A86B", "#009E60"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Đặt hàng</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }
);
StickyCTA.displayName = "StickyCTA";
const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E5EA",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    disabledBar: {
        backgroundColor: "#F2F2F7",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    disabledText: {
        fontSize: 15,
        color: "#8E8E93",
        fontWeight: "500",
        textAlign: "center",
    },
    button: {
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#00A86B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    gradient: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
