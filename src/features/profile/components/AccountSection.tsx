import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { AccountListItem, AccountListItemProps } from "./AccountListItem";
interface AccountSectionProps {
    title: string;
    items: Omit<AccountListItemProps, "isLast">[];
}
export const AccountSection = React.memo<AccountSectionProps>(
    ({ title, items }) => {
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const slideAnim = useRef(new Animated.Value(20)).current;
        useEffect(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 140,
                    delay: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 140,
                    delay: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        }, [fadeAnim, slideAnim]);
        return (
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {}
                <Text style={styles.title}>{title}</Text>
                {}
                <View style={styles.listContainer}>
                    {items.map((item, index) => (
                        <AccountListItem
                            key={`${item.title}-${index}`}
                            {...item}
                            isLast={index === items.length - 1}
                        />
                    ))}
                </View>
            </Animated.View>
        );
    }
);
AccountSection.displayName = "AccountSection";
const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 24,
    },
    title: {
        fontSize: 17,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 0.3,
    },
    listContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});
