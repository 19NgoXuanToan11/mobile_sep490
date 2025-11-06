import React, { useEffect, useRef } from "react";
import { View, Animated, ViewProps, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "../lib/utils";
interface ShimmerLoaderProps extends ViewProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
}
export const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({
    width = "100%",
    height = 100,
    borderRadius = 20,
    className,
    ...props
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);
    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });
    return (
        <View
            style={[{ width, height, borderRadius, overflow: "hidden", backgroundColor: "#f0f0f0" } as ViewStyle]}
            className={cn(className)}
            {...props}
        >
            <Animated.View
                style={[
                    {
                        width: "100%",
                        height: "100%",
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={["#f0f0f0", "#e0e0e0", "#f0f0f0"] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1, width: 300 }}
                />
            </Animated.View>
        </View>
    );
};

export const ProductCardSkeleton: React.FC = () => {
    return (
        <View className="w-full p-3 bg-white rounded-[20px]">
            <ShimmerLoader height={144} borderRadius={16} className="mb-3" />
            <ShimmerLoader height={16} width="80%" borderRadius={8} className="mb-2" />
            <ShimmerLoader height={12} width="60%" borderRadius={6} className="mb-3" />
            <ShimmerLoader height={36} borderRadius={12} />
        </View>
    );
};

export const CategoryCardSkeleton: React.FC = () => {
    return (
        <View className="items-center">
            <ShimmerLoader width={96} height={96} borderRadius={20} className="mb-3" />
            <ShimmerLoader height={12} width={80} borderRadius={6} />
        </View>
    );
};
