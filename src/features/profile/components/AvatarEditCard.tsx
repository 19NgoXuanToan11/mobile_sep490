import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from "react-native-reanimated";

interface AvatarEditCardProps {
    fullName: string;
    avatarUri?: string;
    onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AvatarEditCard = React.memo<AvatarEditCardProps>(
    ({ fullName, avatarUri, onPress }) => {
        const scale = useSharedValue(1);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));

        const handlePressIn = () => {
            scale.value = withSpring(0.95, {
                damping: 15,
                stiffness: 300,
            });
        };

        const handlePressOut = () => {
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 300,
            });
        };

        const getInitials = () => {
            const names = fullName.trim().split(" ");
            if (names.length >= 2) {
                return (
                    names[0].charAt(0).toUpperCase() +
                    names[names.length - 1].charAt(0).toUpperCase()
                );
            }
            return fullName.charAt(0).toUpperCase() || "N";
        };

        return (
            <View style={styles.container}>
                <AnimatedTouchable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                    style={animatedStyle}
                >
                    <View style={styles.avatarContainer}>
                        {/* Avatar Circle */}
                        <View style={styles.avatar}>
                            <Text style={styles.initials}>{getInitials()}</Text>
                        </View>

                        {/* Camera Icon Overlay */}
                        <View style={styles.cameraButton}>
                            <Ionicons name="camera" size={18} color="#FFFFFF" />
                        </View>
                    </View>
                </AnimatedTouchable>

                {/* Edit Text */}
                <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                    <Text style={styles.editText}>Thay đổi ảnh đại diện</Text>
                </TouchableOpacity>
            </View>
        );
    }
);

AvatarEditCard.displayName = "AvatarEditCard";

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginHorizontal: 16,
        marginTop: 12,
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 12,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#E8F9F1",
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    initials: {
        fontSize: 36,
        fontWeight: "600",
        color: "#00A86B",
        letterSpacing: 0.5,
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#00A86B",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
        ...Platform.select({
            ios: {
                shadowColor: "#00A86B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    editText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#00A86B",
        letterSpacing: 0.2,
    },
});

