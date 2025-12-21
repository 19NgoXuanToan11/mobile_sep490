import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withDelay,
    runOnJS,
} from "react-native-reanimated";
export type ToastType = "success" | "error" | "info";
interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    duration?: number;
    onHide?: () => void;
}
const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
    success: "checkmark-circle",
    error: "close-circle",
    info: "information-circle",
};
const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> =
{
    success: {
        bg: "#E8F9F1",
        border: "#00A86B",
        icon: "#00A86B",
    },
    error: {
        bg: "#FEF2F2",
        border: "#EF4444",
        icon: "#EF4444",
    },
    info: {
        bg: "#EFF6FF",
        border: "#3B82F6",
        icon: "#3B82F6",
    },
};
export const Toast = React.memo<ToastProps>(
    ({ visible, message, type = "success", duration = 3000, onHide }) => {
        const translateY = useSharedValue(-100);
        const opacity = useSharedValue(0);
        useEffect(() => {
            if (visible) {
                translateY.value = -100;
                opacity.value = 0;

                translateY.value = withSpring(0, {
                    damping: 20,
                    stiffness: 300,
                });
                opacity.value = withSpring(1, {
                    damping: 20,
                    stiffness: 300,
                });

                const hideTimer = setTimeout(() => {
                    translateY.value = withSpring(-100, {
                        damping: 20,
                        stiffness: 300,
                    });
                    opacity.value = withSpring(0, {
                        damping: 20,
                        stiffness: 300,
                    }, (finished) => {
                        if (finished && onHide) {
                            runOnJS(onHide)();
                        }
                    });
                }, duration);

                return () => {
                    clearTimeout(hideTimer);
                };
            } else {
                translateY.value = -100;
                opacity.value = 0;
            }
        }, [visible, duration, onHide]);
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        }));
        if (!visible) return null;
        const colors = COLORS[type];
        return (
            <Animated.View style={[styles.container, animatedStyle]}>
                <View
                    style={[
                        styles.toast,
                        {
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: `${colors.icon}15` },
                        ]}
                    >
                        <Ionicons name={ICONS[type]} size={22} color={colors.icon} />
                    </View>
                    <Text style={styles.message} numberOfLines={2}>
                        {message}
                    </Text>
                </View>
            </Animated.View>
        );
    }
);
Toast.displayName = "Toast";
const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: Platform.OS === "ios" ? 60 : 20,
        left: 16,
        right: 16,
        zIndex: 9999,
        elevation: 9999,
    },
    toast: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1.5,
        paddingVertical: 14,
        paddingHorizontal: 16,
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
        color: "#111827",
        letterSpacing: 0.2,
        lineHeight: 20,
    },
});
