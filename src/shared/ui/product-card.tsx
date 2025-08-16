import React from "react";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Card } from "./card";
import { Badge } from "./badge";
import { RatingDisplay } from "./rating-stars";

const productCardVariants = cva("", {
  variants: {
    size: {
      sm: "w-40",
      md: "w-48",
      lg: "w-56",
      full: "w-full",
    },
    layout: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
  defaultVariants: {
    size: "md",
    layout: "vertical",
  },
});

export interface ProductCardProps
  extends ViewProps,
    VariantProps<typeof productCardVariants> {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    rating?: number;
    reviewCount?: number;
    unit?: string;
    tags?: string[];
    origin?: string;
    harvestDate?: string;
    isInStock?: boolean;
    isFeatured?: boolean;
  };
  onPress?: () => void;
  onAddToCart?: () => void;
  showAddToCart?: boolean;
  showQuickView?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  size,
  layout,
  onPress,
  onAddToCart,
  showAddToCart = true,
  showQuickView = false,
  className,
  ...props
}) => {
  const isHorizontal = layout === "horizontal";
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0;

  const renderImage = () => (
    <View
      className={cn(
        "relative bg-neutral-100 rounded-xl overflow-hidden",
        isHorizontal ? "w-20 h-20" : "w-full h-32"
      )}
    >
      <Image
        source={{ uri: product.images[0] }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
      />

      {/* Badges */}
      <View className="absolute top-2 left-2 flex-row gap-1">
        {hasDiscount && (
          <Badge text={`-${discountPercent}%`} variant="error" size="xs" />
        )}
        {product.isFeatured && <Badge text="HOT" variant="organic" size="xs" />}
        {product.tags?.includes("organic") && (
          <Badge text="Organic" variant="success" size="xs" />
        )}
      </View>

      {/* Quick actions */}
      {showQuickView && (
        <View className="absolute top-2 right-2">
          <TouchableOpacity
            className="w-8 h-8 bg-white/80 rounded-full items-center justify-center"
            onPress={onPress}
          >
            <Ionicons name="eye-outline" size={16} color="#00623A" />
          </TouchableOpacity>
        </View>
      )}

      {/* Out of stock overlay */}
      {product.isInStock === false && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <Text className="text-white text-xs font-medium">Hết hàng</Text>
        </View>
      )}
    </View>
  );

  const renderContent = () => (
    <View
      className={cn(
        "flex-1 space-y-2",
        isHorizontal ? "pl-3 justify-between" : "pt-3"
      )}
    >
      {/* Product name */}
      <Text
        className="font-semibold text-neutral-900 leading-4"
        numberOfLines={isHorizontal ? 1 : 2}
      >
        {product.name}
      </Text>

      {/* Origin & Harvest info */}
      {(product.origin || product.harvestDate) && (
        <View className="flex-row items-center gap-2">
          {product.origin && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={12} color="#6b7280" />
              <Text className="text-xs text-neutral-600">{product.origin}</Text>
            </View>
          )}
          {product.harvestDate && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={12} color="#6b7280" />
              <Text className="text-xs text-neutral-600">
                {new Date(product.harvestDate).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Rating */}
      {product.rating && (
        <RatingDisplay
          rating={product.rating}
          reviewCount={product.reviewCount}
          size="sm"
        />
      )}

      {/* Price */}
      <View className="flex-row items-center gap-2">
        <Text className="text-lg font-bold text-primary-600">
          {formatCurrency(product.price)}
        </Text>
        {hasDiscount && (
          <Text className="text-sm text-neutral-400 line-through">
            {formatCurrency(product.originalPrice!)}
          </Text>
        )}
        {product.unit && (
          <Text className="text-xs text-neutral-500">/{product.unit}</Text>
        )}
      </View>

      {/* Add to cart button */}
      {showAddToCart && product.isInStock !== false && (
        <TouchableOpacity
          className="bg-primary-500 rounded-lg py-2 items-center justify-center mt-2"
          onPress={onAddToCart}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-1">
            <Ionicons name="basket-outline" size={14} color="white" />
            <Text className="text-white text-xs font-medium">Thêm vào giỏ</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Card
      variant="product"
      padding="sm"
      onPress={onPress}
      className={cn(productCardVariants({ size, layout }), className)}
      {...props}
    >
      <View className={cn("space-y-0", isHorizontal ? "flex-row" : "flex-col")}>
        {renderImage()}
        {renderContent()}
      </View>
    </Card>
  );
};
