import React, { useCallback, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
interface WelcomeButtonsProps {
    onLoginPress: () => void;
    onRegisterPress: () => void;
}

const PrimaryButton = React.memo<{
    title: string;
    onPress: () => void;
}>(({ title, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const handlePressIn = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);
    const handlePressOut = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);
    return (
        <Animated.View
            style={[
                styles.buttonWrapper,
                {
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.primaryButton}
            >
                <LinearGradient
                    colors={["#00A86B", "#009E60"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                >
                    <Text style={styles.primaryButtonText}>{title}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
});
PrimaryButton.displayName = "PrimaryButton";

const SecondaryButton = React.memo<{
    title: string;
    onPress: () => void;
}>(({ title, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isPressed, setIsPressed] = useState(false);
    const handlePressIn = useCallback(() => {
        setIsPressed(true);
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);
    const handlePressOut = useCallback(() => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);
    return (
        <Animated.View
            style={[
                styles.buttonWrapper,
                {
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.secondaryButton,
                    isPressed && styles.secondaryButtonPressed,
                ]}
            >
                <Text style={styles.secondaryButtonText}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
});
SecondaryButton.displayName = "SecondaryButton";

export const WelcomeButtons = React.memo<WelcomeButtonsProps>(
    ({ onLoginPress, onRegisterPress }) => {
        return (
            <View style={styles.container}>
                <PrimaryButton title="Đăng nhập ngay" onPress={onLoginPress} />
                <SecondaryButton title="Tạo tài khoản" onPress={onRegisterPress} />
            </View>
        );
    }
);
WelcomeButtons.displayName = "WelcomeButtons";
const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 12,
    },
    buttonWrapper: {
        width: "100%",
    },

    primaryButton: {
        borderRadius: 26,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#00A86B",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    gradientButton: {
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        letterSpacing: 0.2,
    },

    secondaryButton: {
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: "#00A86B",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    secondaryButtonPressed: {
        backgroundColor: "#E8F9F1",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#00A86B",
        letterSpacing: 0.2,
    },
});
