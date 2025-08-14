import React, { useEffect, useRef } from "react";
import { View, Animated, ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const skeletonVariants = cva("bg-neutral-200 overflow-hidden", {
  variants: {
    variant: {
      text: "rounded h-4",
      circular: "rounded-full",
      rectangular: "rounded",
    },
  },
  defaultVariants: {
    variant: "rectangular",
  },
});

export interface SkeletonProps
  extends ViewProps,
    VariantProps<typeof skeletonVariants> {
  width?: number;
  height?: number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant,
  width,
  height,
  animate = true,
  className,
  style,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animate, animatedValue]);

  const animatedStyle = animate
    ? {
        opacity: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.7],
        }),
      }
    : {};

  const dimensions = {
    width,
    height: variant === "circular" ? width : height,
  };

  return (
    <Animated.View
      className={cn(skeletonVariants({ variant }), className)}
      style={[dimensions, animatedStyle, style]}
      {...props}
    />
  );
};

// Common skeleton patterns
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className,
}) => (
  <View className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        height={16}
        width={index === lines - 1 ? Math.random() * 200 + 100 : undefined}
        className="w-full"
      />
    ))}
  </View>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <View className={cn("p-4 space-y-3", className)}>
    <Skeleton height={200} className="w-full rounded-lg" />
    <SkeletonText lines={2} />
    <View className="flex-row justify-between items-center">
      <Skeleton width={80} height={20} />
      <Skeleton width={60} height={30} />
    </View>
  </View>
);

export const SkeletonAvatar: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className }) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    className={className}
  />
);
