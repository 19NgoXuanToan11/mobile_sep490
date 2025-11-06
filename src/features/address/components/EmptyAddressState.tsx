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
interface EmptyAddressStateProps {
    onAddAddress: () => void;
}
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
export const EmptyAddressState = React.memo<EmptyAddressStateProps>(
    ({ onAddAddress }) => {
        const scale = useSharedValue(1);
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));
        const handlePressIn = useCallback(() => {
            scale.value = withSpring(0.96, {
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
        const handlePress = useCallback(() => {
            handlePressOut();
            onAddAddress();
        }, [onAddAddress]);
        return (
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <Ionicons name="home-outline" size={56} color="#D1D5DB" />
                </View>
                <Text style={styles.title}>Chưa có địa chỉ nào</Text>
                <Text style={styles.subtitle}>
                    Thêm địa chỉ để thuận tiện hơn khi đặt hàng
                </Text>
                <AnimatedTouchable
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[styles.button, animatedStyle]}
                    activeOpacity={0.9}
                >
                    <Text style={styles.buttonText}>Thêm địa chỉ đầu tiên</Text>
                </AnimatedTouchable>
            </View>
        );
    }
);
EmptyAddressState.displayName = "EmptyAddressState";
const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
        paddingHorizontal: 24,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#F9FAFB",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
        maxWidth: 280,
    },
    button: {
        backgroundColor: "#00A86B",
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 24,
        ...Platform.select({
            ios: {
                shadowColor: "#00A86B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
