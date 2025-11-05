import React, { useCallback } from "react";
import { View, Text, Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Notification } from "../../../shared/hooks";

interface NotificationCardProps {
    notification: Notification;
    onPress: (notification: Notification) => void;
}

const ICON_CONFIG = {
    order: { icon: "bag-outline" as const, color: "#00A86B", bg: "#E6F7F0", label: "Đơn hàng" },
    promotion: { icon: "pricetag-outline" as const, color: "#F97316", bg: "#FFF7ED", label: "Khuyến mãi" },
    payment: { icon: "card-outline" as const, color: "#6366F1", bg: "#EEF2FF", label: "Thanh toán" },
    delivery: { icon: "car-outline" as const, color: "#3B82F6", bg: "#EFF6FF", label: "Giao hàng" },
    system: { icon: "settings-outline" as const, color: "#6B7280", bg: "#F3F4F6", label: "Hệ thống" },
};

const formatRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

export const NotificationCard = React.memo<NotificationCardProps>(
    ({ notification, onPress }) => {
        const scaleAnim = React.useRef(new Animated.Value(1)).current;
        const config = ICON_CONFIG[notification.type] || ICON_CONFIG.system;

        const handlePressIn = useCallback(() => {
            Animated.timing(scaleAnim, {
                toValue: 0.97,
                duration: 120,
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

        const handlePress = useCallback(() => {
            onPress(notification);
        }, [notification, onPress]);

        return (
            <Animated.View
                style={[
                    styles.container,
                    { transform: [{ scale: scaleAnim }] },
                    notification.isRead ? styles.containerRead : styles.containerUnread,
                ]}
            >
                <Pressable
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.pressable}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                    <View style={styles.content}>
                        {/* Left Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                            <Ionicons name={config.icon} size={20} color={config.color} />
                        </View>

                        {/* Main Content */}
                        <View style={styles.mainContent}>
                            {/* Top Row: Type Badge + Time */}
                            <View style={styles.topRow}>
                                <View style={[styles.badge, { backgroundColor: config.bg }]}>
                                    <Text style={[styles.badgeText, { color: config.color }]}>
                                        {config.label}
                                    </Text>
                                </View>
                                <Text style={styles.timeText}>
                                    {formatRelativeTime(notification.timestamp)}
                                </Text>
                            </View>

                            {/* Title Row */}
                            <View style={styles.titleRow}>
                                {!notification.isRead && <View style={styles.unreadDot} />}
                                <Text
                                    style={[
                                        styles.title,
                                        notification.isRead ? styles.titleRead : styles.titleUnread,
                                    ]}
                                    numberOfLines={2}
                                >
                                    {notification.title}
                                </Text>
                            </View>

                            {/* Message */}
                            <Text
                                style={[
                                    styles.message,
                                    notification.isRead ? styles.messageRead : styles.messageUnread,
                                ]}
                                numberOfLines={3}
                            >
                                {notification.message}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.notification.id === nextProps.notification.id &&
            prevProps.notification.isRead === nextProps.notification.isRead
        );
    }
);

NotificationCard.displayName = "NotificationCard";

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    containerRead: {
        backgroundColor: "#FFFFFF",
    },
    containerUnread: {
        backgroundColor: "#F0FDF4",
    },
    pressable: {
        padding: 16,
    },
    content: {
        flexDirection: "row",
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    mainContent: {
        flex: 1,
        gap: 8,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        flexShrink: 0,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    timeText: {
        fontSize: 12,
        color: "#9CA3AF",
        flexShrink: 0,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 6,
    },
    unreadDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#00A86B",
        marginTop: 6,
        flexShrink: 0,
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        lineHeight: 20,
        flex: 1,
    },
    titleUnread: {
        color: "#111827",
    },
    titleRead: {
        color: "#4B5563",
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    messageUnread: {
        color: "#6B7280",
    },
    messageRead: {
        color: "#9CA3AF",
    },
});

