import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    Animated,
    StyleSheet,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WelcomeProfileCardProps {
    title?: string;
    subtitle?: string;
}

/**
 * WelcomeProfileCard - Apple Premium Style
 * 
 * Hiển thị card chào mừng khi user chưa đăng nhập
 * - Fade-in animation 200ms
 * - Icon người dùng tròn 76px, nền #E8F9F1
 * - Card bo góc 24px, shadow nhẹ
 * - Spacing cân đối, typography iOS-style
 */
export const WelcomeProfileCard = React.memo<WelcomeProfileCardProps>(
    ({
        title = "Chào mừng đến với IFMS",
        subtitle = "Đăng nhập để truy cập tài khoản, xem đơn hàng và quản lý thông tin cá nhân",
    }) => {
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const slideAnim = useRef(new Animated.Value(20)).current;

        useEffect(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }, []);

        return (
            <Animated.View
                style={[
                    styles.card,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Icon Container */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons
                            name="person-outline"
                            size={36}
                            color="#00A86B"
                        />
                    </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            </Animated.View>
        );
    }
);

WelcomeProfileCard.displayName = "WelcomeProfileCard";

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        marginHorizontal: 20,
        padding: 24,
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    iconContainer: {
        marginBottom: 16,
    },
    iconCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: "#E8F9F1",
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer: {
        alignItems: "center",
        width: "100%",
    },
    title: {
        fontSize: 19,
        fontWeight: "600",
        color: "#111827",
        textAlign: "center",
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 8,
    },
});

