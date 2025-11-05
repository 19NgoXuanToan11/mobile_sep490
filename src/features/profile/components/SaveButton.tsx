import React from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    Platform,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

interface SaveButtonProps {
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    title?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const SaveButton = React.memo<SaveButtonProps>(
    ({ onPress, loading = false, disabled = false, title = "Lưu thay đổi" }) => {
        const scale = useSharedValue(1);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));

        const handlePressIn = () => {
            if (!loading && !disabled) {
                scale.value = withSpring(0.97, {
                    damping: 15,
                    stiffness: 400,
                });
            }
        };

        const handlePressOut = () => {
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 400,
            });
        };

        const isDisabled = loading || disabled;

        return (
            <AnimatedTouchable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={0.9}
                style={[styles.button, animatedStyle]}
            >
                <AnimatedLinearGradient
                    colors={
                        isDisabled
                            ? ["#9CA3AF", "#9CA3AF"]
                            : ["#00A86B", "#009E60", "#008F56"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        </View>
                    )}
                    <Text style={[styles.text, loading && styles.textWithLoading]}>
                        {loading ? "Đang lưu..." : title}
                    </Text>
                </AnimatedLinearGradient>
            </AnimatedTouchable>
        );
    }
);

SaveButton.displayName = "SaveButton";

const styles = StyleSheet.create({
    button: {
        width: "100%",
        height: 52,
        borderRadius: 26,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#00A86B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    gradient: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    loadingContainer: {
        marginRight: 10,
    },
    text: {
        fontSize: 17,
        fontWeight: "600",
        color: "#FFFFFF",
        letterSpacing: 0.4,
    },
    textWithLoading: {
        marginLeft: 0,
    },
});

