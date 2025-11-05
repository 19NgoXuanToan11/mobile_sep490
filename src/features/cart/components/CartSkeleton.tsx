import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

const ShimmerBlock = ({ width, height, borderRadius = 8 }: any) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: "#E5E7EB",
                opacity,
            }}
        />
    );
};

const CartItemSkeleton = () => (
    <View
        style={{
            marginHorizontal: 16,
            marginBottom: 16,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        }}
    >
        {/* Main Content */}
        <View style={{ flexDirection: "row", gap: 12 }}>
            {/* Image Placeholder */}
            <ShimmerBlock width={64} height={64} borderRadius={10} />

            {/* Info Placeholder */}
            <View style={{ flex: 1, gap: 8 }}>
                <ShimmerBlock width="80%" height={16} borderRadius={8} />
                <ShimmerBlock width="60%" height={14} borderRadius={8} />
                <ShimmerBlock width="40%" height={12} borderRadius={8} />
            </View>
        </View>

        {/* Divider */}
        <View
            style={{
                height: 1,
                backgroundColor: "#E5E7EB",
                marginVertical: 16,
            }}
        />

        {/* Bottom Controls Placeholder */}
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <ShimmerBlock width={120} height={36} borderRadius={18} />
            <ShimmerBlock width={80} height={32} borderRadius={18} />
        </View>
    </View>
);

export const CartSkeleton = () => {
    return (
        <View style={{ paddingVertical: 20 }}>
            <CartItemSkeleton />
            <CartItemSkeleton />
            <CartItemSkeleton />
        </View>
    );
};

