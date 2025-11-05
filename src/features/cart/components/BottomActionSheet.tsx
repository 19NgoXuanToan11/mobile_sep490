import React, { useCallback, useRef, useState } from "react";
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency } from "../../../shared/lib/utils";

interface BottomActionSheetProps {
    itemCount: number;
    subtotal: number;
    total: number;
    onCheckout: () => void;
    isAuthenticated: boolean;
}

export const BottomActionSheet = React.memo<BottomActionSheetProps>(
    ({ itemCount, subtotal, total, onCheckout, isAuthenticated }) => {
        const [isLoading, setIsLoading] = useState(false);
        const scaleAnim = useRef(new Animated.Value(1)).current;

        const handleCheckout = useCallback(async () => {
            setIsLoading(true);
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.98,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 120,
                    useNativeDriver: true,
                }),
            ]).start();

            // Small delay for visual feedback
            setTimeout(() => {
                setIsLoading(false);
                onCheckout();
            }, 150);
        }, [onCheckout, scaleAnim]);

        return (
            <View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    paddingBottom: 80,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
                    {/* Price Breakdown */}
                    <View style={{ gap: 12 }}>
                        {/* Subtotal */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: "#6B7280",
                                }}
                            >
                                Tạm tính ({itemCount} món)
                            </Text>
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontWeight: "500",
                                    color: "#111827",
                                }}
                            >
                                {formatCurrency(subtotal)}
                            </Text>
                        </View>

                        {/* Divider */}
                        <View
                            style={{
                                height: 1,
                                backgroundColor: "#E5E7EB",
                                marginVertical: 4,
                            }}
                        />

                        {/* Total */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: "600",
                                    color: "#111827",
                                }}
                            >
                                Tổng thanh toán
                            </Text>
                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: "700",
                                    color: "#00A86B",
                                }}
                            >
                                {formatCurrency(total)}
                            </Text>
                        </View>
                    </View>

                    {/* Checkout Button */}
                    <Animated.View
                        style={{
                            marginTop: 20,
                            transform: [{ scale: scaleAnim }],
                        }}
                    >
                        <Pressable
                            onPress={handleCheckout}
                            disabled={isLoading}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.9 : 1,
                            })}
                        >
                            <LinearGradient
                                colors={["#00A86B", "#009E60"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    height: 52,
                                    borderRadius: 26,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    shadowColor: "#00A86B",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                {isLoading && (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                )}
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: "600",
                                        color: "#FFFFFF",
                                    }}
                                >
                                    {isAuthenticated ? "Đặt hàng" : "Đăng nhập để thanh toán"}
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        );
    }
);

BottomActionSheet.displayName = "BottomActionSheet";

