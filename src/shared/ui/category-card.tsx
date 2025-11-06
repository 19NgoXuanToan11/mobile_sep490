import React from "react";
import { View, Text, TouchableOpacity, ViewProps, Animated } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { appleDesign } from "../lib/theme";
import { Card } from "./card";
const categoryCardVariants = cva("", {
  variants: {
    size: {
      sm: "w-20",
      md: "w-24",
      lg: "w-28",
    },
    layout: {
      vertical: "flex-col items-center",
      horizontal: "flex-row items-center",
    },
  },
  defaultVariants: {
    size: "md",
    layout: "vertical",
  },
});
export interface CategoryCardProps
  extends VariantProps<typeof categoryCardVariants> {
  category: {
    id: string;
    name: string;
    image?: string;
    icon?: string;
    count?: number;
    color?: string;
  };
  onPress?: () => void;
  showCount?: boolean;
  className?: string;
}
export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  size,
  layout,
  onPress,
  showCount = false,
  className,
}) => {
  const isHorizontal = layout === "horizontal";
  const iconSize = size === "sm" ? 24 : size === "md" ? 32 : 42;
  const containerSize =
    size === "sm" ? "w-16 h-16" : size === "md" ? "w-20 h-20" : "w-24 h-24";

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };
  const renderIcon = () => {
    if (category.image) {
      return (
        <View
          className={cn("overflow-hidden bg-primary-50", containerSize)}
          style={{
            borderRadius: appleDesign.radius.lg,
            ...appleDesign.shadows.soft,
          }}
        >
          <Image
            source={{ uri: category.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>
      );
    }
    const iconName = category.icon || "leaf-outline";
    return (
      <View
        className={cn("overflow-hidden", containerSize)}
        style={{
          borderRadius: appleDesign.radius.lg,
          ...appleDesign.shadows.medium,
        }}
      >
        {}
        <LinearGradient
          colors={["rgba(0,168,107,0.12)", "rgba(0,168,107,0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 items-center justify-center"
        >
          <View
            className="items-center justify-center"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          >
            <Ionicons name={iconName as any} size={iconSize} color="#00A86B" />
          </View>
        </LinearGradient>
      </View>
    );
  };
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        className={cn(categoryCardVariants({ size, layout }), className)}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View
          className={cn(
            "space-y-3",
            isHorizontal ? "flex-row space-y-0 space-x-3" : "flex-col space-y-3"
          )}
        >
          {renderIcon()}
          <View
            className={cn(
              "items-center",
              isHorizontal ? "items-start flex-1" : "items-center"
            )}
          >
            <Text
              className={cn(
                "font-semibold leading-tight",
                isHorizontal ? "text-left" : "text-center"
              )}
              style={{
                color: appleDesign.colors.text.primary,
                fontSize: size === "sm"
                  ? appleDesign.typography.caption1.fontSize
                  : size === "md"
                    ? appleDesign.typography.footnote.fontSize
                    : appleDesign.typography.subheadline.fontSize,
              }}
              numberOfLines={isHorizontal ? 1 : 2}
            >
              {category.name}
            </Text>
            {showCount && category.count !== undefined && (
              <Text
                className="mt-1"
                style={{
                  color: appleDesign.colors.text.secondary,
                  fontSize: appleDesign.typography.caption2.fontSize,
                  fontWeight: "500",
                }}
              >
                {category.count} sản phẩm
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
