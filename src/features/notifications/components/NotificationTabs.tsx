import React, { useCallback, useEffect, useRef } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Animated,
    StyleSheet,
} from "react-native";
export type NotificationFilter =
    | "all"
    | "unread"
    | "order"
    | "promotion"
    | "payment"
    | "delivery";

interface Tab {
    key: NotificationFilter;
    label: string;
}

const TABS: Tab[] = [
    { key: "all", label: "Tất cả" },
    { key: "unread", label: "Chưa đọc" },
    { key: "order", label: "Đơn hàng" },
    { key: "promotion", label: "Khuyến mãi" },
    { key: "payment", label: "Thanh toán" },
    { key: "delivery", label: "Giao hàng" },
];

interface NotificationTabsProps {
    activeFilter: NotificationFilter;
    onFilterChange: (filter: NotificationFilter) => void;
}

export const NotificationTabs = React.memo<NotificationTabsProps>(
    ({ activeFilter, onFilterChange }) => {
        const scrollViewRef = useRef<ScrollView>(null);
        const handleTabPress = useCallback(
            (key: NotificationFilter) => {
                onFilterChange(key);
            },
            [onFilterChange]
        );
        return (
            <View style={styles.container}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {TABS.map((tab) => (
                        <TabButton
                            key={tab.key}
                            tab={tab}
                            isActive={activeFilter === tab.key}
                            onPress={handleTabPress}
                        />
                    ))}
                </ScrollView>
            </View>
        );
    }
);
NotificationTabs.displayName = "NotificationTabs";

interface TabButtonProps {
    tab: Tab;
    isActive: boolean;
    onPress: (key: NotificationFilter) => void;
}

const TabButton = React.memo<TabButtonProps>(({ tab, isActive, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bgAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
    useEffect(() => {
        Animated.timing(bgAnim, {
            toValue: isActive ? 1 : 0,
            duration: 160,
            useNativeDriver: false,
        }).start();
    }, [isActive, bgAnim]);
    const handlePressIn = useCallback(() => {
        Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);
    const handlePressOut = useCallback(() => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);
    const handlePress = useCallback(() => {
        onPress(tab.key);
    }, [tab.key, onPress]);
    const backgroundColor = bgAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#FFFFFF", "#F0FDF4"],
    });
    const borderColor = bgAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#E5E7EB", "#00A86B"],
    });
    return (
        <Animated.View
            style={[
                {
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <Animated.View
                style={[
                    styles.tabButton,
                    {
                        backgroundColor,
                        borderColor,
                    },
                ]}
            >
                <Pressable
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.tabPressable}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                    <Text
                        style={[styles.tabText, isActive && styles.tabTextActive]}
                        numberOfLines={1}
                    >
                        {tab.label}
                    </Text>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
}
);
TabButton.displayName = "TabButton";
const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tabButton: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#F2F2F7",
        backgroundColor: "#F2F2F7",
    },
    tabPressable: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 6,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#636366",
    },
    tabTextActive: {
        color: "#0A84FF",
        fontWeight: "600",
    },
});
