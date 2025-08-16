import React from "react";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Card } from "./card";

const categoryCardVariants = cva("", {
  variants: {
    size: {
      sm: "w-20",
      md: "w-24",
      lg: "w-32",
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
  extends ViewProps,
    VariantProps<typeof categoryCardVariants> {
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
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  size,
  layout,
  onPress,
  showCount = false,
  className,
  ...props
}) => {
  const isHorizontal = layout === "horizontal";
  const iconSize = size === "sm" ? 24 : size === "md" ? 32 : 40;
  const containerSize =
    size === "sm" ? "w-16 h-16" : size === "md" ? "w-20 h-20" : "w-24 h-24";

  const renderIcon = () => {
    if (category.image) {
      return (
        <View
          className={cn(
            "rounded-2xl overflow-hidden bg-primary-50",
            containerSize
          )}
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
    const backgroundColor = category.color || "#f0f9f5";

    return (
      <View
        className={cn("rounded-2xl items-center justify-center", containerSize)}
        style={{ backgroundColor }}
      >
        <Ionicons name={iconName as any} size={iconSize} color="#00623A" />
      </View>
    );
  };

  return (
    <TouchableOpacity
      className={cn(categoryCardVariants({ size, layout }), className)}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <View
        className={cn(
          "space-y-2",
          isHorizontal ? "flex-row space-y-0 space-x-3" : "flex-col space-y-2"
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
              "font-medium text-neutral-900 text-center",
              size === "sm" ? "text-xs" : "text-sm"
            )}
            numberOfLines={isHorizontal ? 1 : 2}
          >
            {category.name}
          </Text>

          {showCount && category.count !== undefined && (
            <Text className="text-xs text-neutral-500 mt-1">
              {category.count} sản phẩm
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
