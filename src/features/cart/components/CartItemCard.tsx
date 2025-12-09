import React, { useCallback, useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Pressable,
    TextInput,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, normalizeUnit } from "../../../shared/lib/utils";
import { CartItem } from "../../../types";
interface CartItemCardProps {
    item: CartItem;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemove: (itemId: string, itemName: string) => void;
}
export const CartItemCard = React.memo<CartItemCardProps>(
    ({ item, onUpdateQuantity, onRemove }) => {
        const scaleAnim = useRef(new Animated.Value(1)).current;
        const [inputValue, setInputValue] = useState(item.quantity.toString());

        // Sync input value when item quantity changes externally
        useEffect(() => {
            setInputValue(item.quantity.toString());
        }, [item.quantity]);

        const handlePressIn = useCallback(() => {
            Animated.timing(scaleAnim, {
                toValue: 0.98,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }, [scaleAnim]);
        const handlePressOut = useCallback(() => {
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }).start();
        }, [scaleAnim]);
        const handleIncrement = useCallback(() => {
            if (item.quantity < item.product.stock) {
                onUpdateQuantity(item.id, item.quantity + 1);
            }
        }, [item.id, item.quantity, item.product.stock, onUpdateQuantity]);
        const handleDecrement = useCallback(() => {
            if (item.quantity > 1) {
                onUpdateQuantity(item.id, item.quantity - 1);
            }
        }, [item.id, item.quantity, onUpdateQuantity]);
        const handleRemove = useCallback(() => {
            onRemove(item.id, item.product.name);
        }, [item.id, item.product.name, onRemove]);

        const handleQuantityInputChange = useCallback((text: string) => {
            // Only allow numeric input - remove any non-numeric characters
            const numericValue = text.replace(/[^0-9]/g, '');
            setInputValue(numericValue);
        }, []);

        const handleQuantityBlur = useCallback(() => {
            // When user finishes editing, validate and update quantity
            const numValue = parseInt(inputValue, 10);
            if (isNaN(numValue) || numValue < 1) {
                // If invalid, reset to 1
                setInputValue('1');
                onUpdateQuantity(item.id, 1);
            } else if (numValue > item.product.stock) {
                // If exceeds stock, set to max stock
                setInputValue(item.product.stock.toString());
                onUpdateQuantity(item.id, item.product.stock);
            } else {
                // Valid value, update quantity
                onUpdateQuantity(item.id, numValue);
            }
        }, [inputValue, item.id, item.product.stock, onUpdateQuantity]);

        const canIncrement = item.quantity < item.product.stock;
        const canDecrement = item.quantity > 1;

        const priceText = formatCurrency(item.price);
        const normalizedUnit = normalizeUnit(item.product.unit);
        const unitText = normalizedUnit && !normalizedUnit.startsWith("/")
            ? ` / ${normalizedUnit}`
            : "";
        return (
            <Animated.View
                style={{
                    transform: [{ scale: scaleAnim }],
                    marginHorizontal: 16,
                    marginBottom: 16,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                }}
            >
                { }
                <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                        { }
                        <View style={{ position: "relative" }}>
                            <Image
                                source={{ uri: item.product.images[0] }}
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 10,
                                    backgroundColor: "#F8FAFC",
                                    borderWidth: 1,
                                    borderColor: "#E5E7EB",
                                }}
                                contentFit="contain"
                                transition={150}
                            />
                        </View>
                        { }
                        <View style={{ flex: 1, justifyContent: "space-between" }}>
                            { }
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontWeight: "600",
                                    color: "#111827",
                                    lineHeight: 20,
                                }}
                                numberOfLines={2}
                            >
                                {item.product.name}
                            </Text>
                            { }
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "baseline",
                                    justifyContent: "space-between",
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "600",
                                            color: "#00A86B",
                                        }}
                                    >
                                        {priceText}
                                    </Text>
                                    {unitText && (
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                color: "#6B7280",
                                                opacity: 0.6,
                                                marginLeft: 2,
                                            }}
                                        >
                                            {unitText}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            { }
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: "#6B7280",
                                    marginTop: 4,
                                }}
                            >
                                Còn {item.product.stock} {normalizeUnit(item.product.unit)}
                            </Text>
                        </View>
                    </View>
                </View>
                { }
                <View
                    style={{
                        height: 1,
                        backgroundColor: "#E5E7EB",
                        marginHorizontal: 16,
                    }}
                />
                { }
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 16,
                    }}
                >
                    { }
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#F8FAFC",
                            borderRadius: 18,
                            borderWidth: 1,
                            borderColor: "#E5E7EB",
                        }}
                    >
                        { }
                        <Pressable
                            onPress={handleDecrement}
                            disabled={!canDecrement}
                            style={({ pressed }) => ({
                                width: 36,
                                height: 36,
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: !canDecrement ? 0.4 : pressed ? 0.6 : 1,
                                transform: [{ scale: pressed ? 0.95 : 1 }],
                            })}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name="remove"
                                size={18}
                                color={canDecrement ? "#4B5563" : "#9CA3AF"}
                            />
                        </Pressable>
                        { }
                        <View
                            style={{
                                minWidth: 32,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <TextInput
                                value={inputValue}
                                onChangeText={handleQuantityInputChange}
                                onBlur={handleQuantityBlur}
                                keyboardType="number-pad"
                                style={{
                                    fontSize: 15,
                                    fontWeight: "600",
                                    color: "#111827",
                                    textAlign: "center",
                                    padding: 0,
                                    minWidth: 32,
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        { }
                        <Pressable
                            onPress={handleIncrement}
                            disabled={!canIncrement}
                            style={({ pressed }) => ({
                                width: 36,
                                height: 36,
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: !canIncrement ? 0.4 : pressed ? 0.6 : 1,
                                transform: [{ scale: pressed ? 0.95 : 1 }],
                            })}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name="add"
                                size={18}
                                color={canIncrement ? "#4B5563" : "#9CA3AF"}
                            />
                        </Pressable>
                    </View>
                    { }
                    <Pressable
                        onPress={handleRemove}
                        style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 18,
                            backgroundColor: pressed ? "#FEE2E2" : "#FEF2F2",
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
                            Xóa
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>
        );
    },
    (prevProps, nextProps) => {

        return (
            prevProps.item.id === nextProps.item.id &&
            prevProps.item.quantity === nextProps.item.quantity &&
            prevProps.item.product.stock === nextProps.item.product.stock
        );
    }
);
CartItemCard.displayName = "CartItemCard";
