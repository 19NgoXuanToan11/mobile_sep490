import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
const SkeletonItem = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [shimmerAnim]);
    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {}
                <Animated.View style={[styles.iconSkeleton, { opacity }]} />
                {}
                <View style={styles.mainContent}>
                    {}
                    <View style={styles.topRow}>
                        <Animated.View style={[styles.badgeSkeleton, { opacity }]} />
                        <Animated.View style={[styles.timeSkeleton, { opacity }]} />
                    </View>
                    {}
                    <Animated.View style={[styles.titleSkeleton, { opacity }]} />
                    <Animated.View style={[styles.titleSkeletonShort, { opacity }]} />
                    {}
                    <Animated.View style={[styles.messageSkeleton, { opacity }]} />
                    <Animated.View style={[styles.messageSkeletonShort, { opacity }]} />
                </View>
            </View>
        </View>
    );
};
interface NotificationSkeletonProps {
    count?: number;
}
export const NotificationSkeleton = React.memo<NotificationSkeletonProps>(
    ({ count = 3 }) => {
        return (
            <>
                {Array.from({ length: count }).map((_, index) => (
                    <SkeletonItem key={index} />
                ))}
            </>
        );
    }
);
NotificationSkeleton.displayName = "NotificationSkeleton";
const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    content: {
        padding: 16,
        flexDirection: "row",
        gap: 12,
    },
    iconSkeleton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E5E7EB",
        flexShrink: 0,
    },
    mainContent: {
        flex: 1,
        gap: 8,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    badgeSkeleton: {
        width: 70,
        height: 20,
        borderRadius: 8,
        backgroundColor: "#E5E7EB",
    },
    timeSkeleton: {
        width: 80,
        height: 14,
        borderRadius: 4,
        backgroundColor: "#E5E7EB",
    },
    titleSkeleton: {
        height: 16,
        borderRadius: 4,
        backgroundColor: "#E5E7EB",
        width: "100%",
    },
    titleSkeletonShort: {
        height: 16,
        borderRadius: 4,
        backgroundColor: "#E5E7EB",
        width: "60%",
    },
    messageSkeleton: {
        height: 14,
        borderRadius: 4,
        backgroundColor: "#E5E7EB",
        width: "100%",
    },
    messageSkeletonShort: {
        height: 14,
        borderRadius: 4,
        backgroundColor: "#E5E7EB",
        width: "80%",
    },
});
