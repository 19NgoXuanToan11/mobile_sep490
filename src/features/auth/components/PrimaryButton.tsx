import React, { useRef, useCallback } from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    Animated,
    ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export const PrimaryButton = React.memo<PrimaryButtonProps>(
    ({ title, onPress, loading = false, disabled = false }) => {
        const scaleAnim = useRef(new Animated.Value(1)).current;

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

        const isDisabled = disabled || loading;

        return (
            <Animated.View
                style={{
                    transform: [{ scale: scaleAnim }],
                }}
            >
                <TouchableOpacity
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isDisabled}
                    activeOpacity={0.9}
                    style={{
                        borderRadius: 26,
                        overflow: "hidden",
                        height: 52,
                    }}
                >
                    <LinearGradient
                        colors={isDisabled ? ["#93C5AA", "#93C5AA"] : ["#00A86B", "#009E60"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: 24,
                        }}
                    >
                        {loading && (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                                style={{ marginRight: 8 }}
                            />
                        )}
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: "#FFFFFF",
                                letterSpacing: 0.3,
                            }}
                        >
                            {title}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    }
);

PrimaryButton.displayName = "PrimaryButton";

