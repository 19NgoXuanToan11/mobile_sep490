import React, { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
interface CartHeaderProps {
    itemCount: number;
    onClearCart: () => void;
    onAddMore: () => void;
}
export const CartHeader = React.memo<CartHeaderProps>(
    ({ itemCount, onClearCart, onAddMore }) => {
        return (
            <View
                style={{
                    backgroundColor: "#FFFFFF",
                    borderBottomWidth: 1,
                    borderBottomColor: "#E5E7EB",
                }}
            >
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Item Count */}
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "600",
                                color: "#111827",
                            }}
                            numberOfLines={1}
                        >
                            {itemCount} món
                        </Text>
                    </View>
                    { }
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        { }
                        <Pressable
                            onPress={onClearCart}
                            style={({ pressed }) => ({
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: "#FEE2E2",
                                backgroundColor: pressed ? "#FEE2E2" : "transparent",
                            })}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "500",
                                    color: "#EF4444",
                                }}
                            >
                                Xóa tất cả
                            </Text>
                        </Pressable>
                        { }
                        <Pressable
                            onPress={onAddMore}
                            style={({ pressed }) => ({
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: "#00A86B",
                                backgroundColor: pressed ? "#F0FDF4" : "transparent",
                            })}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#00A86B" />
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "500",
                                    color: "#00A86B",
                                }}
                            >
                                Thêm món
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }
);
CartHeader.displayName = "CartHeader";
