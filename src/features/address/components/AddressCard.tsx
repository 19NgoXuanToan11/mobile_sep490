import React, { useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { Address } from "../../../types";

interface AddressCardProps {
    address: Address;
    onEdit: () => void;
    onDelete: () => void;
    onSetDefault: () => void;
}

export const AddressCard = React.memo<AddressCardProps>(
    ({ address, onEdit, onDelete, onSetDefault }) => {
        const scale = useSharedValue(1);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));

        const handlePressIn = useCallback(() => {
            scale.value = withSpring(0.98, {
                damping: 15,
                stiffness: 400,
            });
        }, []);

        const handlePressOut = useCallback(() => {
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 400,
            });
        }, []);

        const handleSetDefault = useCallback(() => {
            handlePressOut();
            onSetDefault();
        }, [onSetDefault]);

        return (
            <Animated.View style={[styles.container, animatedStyle]}>
                {/* Header Row */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.name} numberOfLines={1}>
                            {address.customerName || address.name}
                        </Text>
                        {address.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>Mặc định</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={onEdit}
                            style={styles.actionButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="pencil-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onDelete}
                            style={[styles.actionButton, styles.deleteButton]}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Contact Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={18} color="#6B7280" />
                        <Text style={styles.infoText}>
                            {address.phoneNumber || address.phone}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color="#6B7280" />
                        <Text style={styles.addressText} numberOfLines={3}>
                            {address.street}, {address.ward},{" "}
                            {address.province || address.city}
                        </Text>
                    </View>
                </View>

                {/* Set Default Action */}
                {!address.isDefault && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={handleSetDefault}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            style={styles.defaultButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="star-outline" size={18} color="#00A86B" />
                            <Text style={styles.defaultButtonText}>Đặt làm mặc định</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        );
    }
);

AddressCard.displayName = "AddressCard";

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingRight: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        flexShrink: 1,
    },
    defaultBadge: {
        backgroundColor: "#E8F9F1",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#00A86B",
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButton: {
        backgroundColor: "#FEE2E2",
    },
    infoContainer: {
        gap: 10,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    infoText: {
        fontSize: 15,
        color: "#374151",
        lineHeight: 20,
    },
    addressText: {
        flex: 1,
        fontSize: 15,
        color: "#6B7280",
        lineHeight: 20,
    },
    footer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    defaultButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    defaultButtonText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#00A86B",
    },
});

