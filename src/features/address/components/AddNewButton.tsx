import React, { useCallback } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Platform,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
interface AddNewButtonProps {
    onPress: () => void;
}
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
export const AddNewButton = React.memo<AddNewButtonProps>(({ onPress }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.95, {
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
        onPress();
    }, [onPress]);
    return (
        <AnimatedTouchable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.button, animatedStyle]}
            activeOpacity={0.9}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.buttonText}>Thêm mới</Text>
        </AnimatedTouchable>
    );
});
AddNewButton.displayName = "AddNewButton";
const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#00A86B",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 6,
        ...Platform.select({
            ios: {
                shadowColor: "#00A86B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    iconContainer: {
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
