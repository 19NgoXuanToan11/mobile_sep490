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
  },
  defaultVariants: {
    size: "md",
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
    soldCount?: number;
    certifications?: string[];
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
  onPress,
  onAddToCart,
  showAddToCart = true,
  showQuickView = false,
  className,
  ...props
}) => {
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
      ((product.originalPrice! - product.price) / product.originalPrice!) *
      100
    )
    : 0;

  const renderImage = () => {
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;

    return (
      <View className="relative bg-neutral-100 rounded-xl overflow-hidden w-full h-36">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="image-outline" size={48} color="#9ca3af" />
            <Text className="text-neutral-500 text-xs mt-2">Không có hình ảnh</Text>
          </View>
        )}

        {/* Top Badges - Left Side */}
        <View className="absolute top-1.5 left-1.5 space-y-1">
          {hasDiscount && (
            <View className="bg-red-500 px-1.5 py-0.5 rounded-md">
              <Text className="text-white text-xs font-bold">
                -{discountPercent}%
              </Text>
            </View>
          )}
          {product.isFeatured && (
            <View className="bg-orange-500 px-1.5 py-0.5 rounded-md">
              <Text className="text-white text-xs font-bold">HOT</Text>
            </View>
          )}
        </View>

        {/* Top Badge - Right Side */}
        {product.tags?.includes("organic") && (
          <View className="absolute top-1.5 right-1.5">
            <View className="bg-green-500 px-1.5 py-0.5 rounded-md">
              <Text className="text-white text-xs font-bold">Organic</Text>
            </View>
          </View>
        )}

        {/* Quick actions */}
        {showQuickView && (
          <View
            className="absolute top-1.5 right-1.5"
            style={{ marginTop: product.tags?.includes("organic") ? 28 : 0 }}
          >
            <TouchableOpacity
              className="w-7 h-7 bg-white/90 rounded-full items-center justify-center shadow-sm"
              onPress={onPress}
            >
              <Ionicons name="eye-outline" size={14} color="#00623A" />
            </TouchableOpacity>
          </View>
        )}

        {/* Out of stock overlay */}
        {product.isInStock === false && (
          <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-xl">
            <Text className="text-white text-xs font-semibold">Hết hàng</Text>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => (
    <View className="flex-1 justify-between pt-3">
      {/* Top Section: Product Info */}
      <View className="space-y-2 flex-1">
        {/* Product Name */}
        <Text
          className="font-semibold text-neutral-900 text-sm leading-5"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Location & Date Row */}
        {(product.origin || product.harvestDate) && (
          <View className="flex-row items-center flex-wrap gap-x-3 gap-y-1">
            {product.origin && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={11} color="#6b7280" />
                <Text className="text-xs text-neutral-600" numberOfLines={1}>
                  {product.origin}
                </Text>
              </View>
            )}
            {product.harvestDate && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={11} color="#6b7280" />
                <Text className="text-xs text-neutral-600">
                  {new Date(product.harvestDate).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Rating & Trust Row */}
        <View className="space-y-1.5">
          {product.rating && (
            <RatingDisplay
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="sm"
            />
          )}

          {/* Trust Elements Row */}
          <View className="flex-row items-center flex-wrap gap-x-3 gap-y-1">
            {/* Sold Count */}
            {product.soldCount && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="checkmark-circle" size={11} color="#16a34a" />
                <Text className="text-xs text-neutral-600">
                  Đã bán{" "}
                  {product.soldCount > 1000
                    ? `${Math.floor(product.soldCount / 1000)}k+`
                    : product.soldCount}
                </Text>
              </View>
            )}

            {/* VietGAP Badge */}
            {product.certifications?.includes("VietGAP") && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="shield-checkmark" size={11} color="#2563eb" />
                <Text className="text-xs text-blue-600 font-medium">
                  VietGAP
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Bottom Section: Price & CTA */}
      <View className="space-y-2.5 mt-2">
        {/* Price Section */}
        <View className="space-y-1">
          <View className="flex-row items-baseline gap-2 flex-wrap">
            <Text className="text-base font-bold text-primary-600">
              {formatCurrency(product.price)}
            </Text>
            {product.unit && !product.unit.startsWith("/") && (
              <Text className="text-xs text-neutral-500">/{product.unit}</Text>
            )}
          </View>

          {/* Original Price Row */}
          {hasDiscount && (
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-neutral-400 line-through">
                {formatCurrency(product.originalPrice!)}
              </Text>
              <View className="bg-red-100 px-1.5 py-0.5 rounded">
                <Text className="text-xs font-medium text-red-600">
                  -{discountPercent}%
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* CTA Button */}
        {showAddToCart && product.isInStock !== false && (
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-2.5 items-center justify-center shadow-sm"
            onPress={onAddToCart}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="basket-outline" size={14} color="white" />
              <Text className="text-white text-sm font-semibold">
                Thêm vào giỏ
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Card
      variant="product"
      padding="md"
      onPress={onPress}
      className={cn(productCardVariants({ size }), "shadow-sm", className)}
      {...props}
    >
      <View className="flex-col space-y-3">
        {renderImage()}
        {renderContent()}
      </View>
    </Card>
  );
};
