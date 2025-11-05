import React from "react";
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface QuickActionItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBackground: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    isLast?: boolean;
}

export const QuickActionItem = React.memo<QuickActionItemProps>(
    ({
        icon,
        iconColor,
        iconBackground,
        title,
        subtitle,
        onPress,
        isLast = false,
    }) => {
        const scaleAnim = React.useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.97,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 7,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View
                style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
            >
                <TouchableOpacity
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.8}
                    style={styles.touchable}
                >
                    <View style={styles.content}>
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: iconBackground },
                            ]}
                        >
                            <Ionicons name={icon} size={20} color={iconColor} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#9CA3AF"
                        />
                    </View>
                </TouchableOpacity>
                {!isLast && <View style={styles.divider} />}
            </Animated.View>
        );
    }
);

QuickActionItem.displayName = "QuickActionItem";

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    touchable: {
        width: "100%",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 2,
        letterSpacing: 0.1,
    },
    subtitle: {
        fontSize: 13,
        color: "#6B7280",
        letterSpacing: 0.1,
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginLeft: 52,
    },
});
