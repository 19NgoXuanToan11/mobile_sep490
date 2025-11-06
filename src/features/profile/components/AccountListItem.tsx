import React, { useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
export interface AccountListItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
    isLast?: boolean;
}
export const AccountListItem = React.memo<AccountListItemProps>(
    ({ icon, title, subtitle, onPress, showChevron = true, isLast = false }) => {
        const scaleAnim = useRef(new Animated.Value(1)).current;
        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.97,
                friction: 3,
                useNativeDriver: true,
            }).start();
        };
        const handlePressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }).start();
        };
        return (
            <>
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.touchable}
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                    >
                        <View style={styles.content}>
                            {}
                            <View style={styles.iconContainer}>
                                <Ionicons name={icon} size={20} color="#6B7280" />
                            </View>
                            {}
                            <View style={styles.textContainer}>
                                <Text style={styles.title} numberOfLines={1}>
                                    {title}
                                </Text>
                                {subtitle ? (
                                    <Text style={styles.subtitle} numberOfLines={1}>
                                        {subtitle}
                                    </Text>
                                ) : null}
                            </View>
                            {}
                            {showChevron && (
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color="#9CA3AF"
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
                {}
                {!isLast && <View style={styles.divider} />}
            </>
        );
    }
);
AccountListItem.displayName = "AccountListItem";
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
    },
    touchable: {
        width: "100%",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2,
        letterSpacing: 0.1,
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginLeft: 56,
    },
});
