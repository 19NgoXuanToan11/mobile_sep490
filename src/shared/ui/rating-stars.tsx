import React from "react";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../lib/utils";
export interface RatingStarsProps extends ViewProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  showText?: boolean;
  textClassName?: string;
}
export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  onRatingChange,
  readonly = true,
  showText = false,
  textClassName,
  className,
  ...props
}) => {
  const handleStarPress = (starRating: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(starRating);
  };
  const renderStar = (starIndex: number) => {
    const starRating = starIndex + 1;
    const isFilled = starRating <= rating;
    const isHalfFilled = rating > starIndex && rating < starRating;
    if (readonly) {
      return (
        <Ionicons
          key={starIndex}
          name={isFilled ? "star" : isHalfFilled ? "star-half" : "star-outline"}
          size={size}
          color={isFilled || isHalfFilled ? "#fbbf24" : "#d1d5db"}
        />
      );
    }
    return (
      <TouchableOpacity
        key={starIndex}
        onPress={() => handleStarPress(starRating)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isFilled ? "star" : "star-outline"}
          size={size}
          color={isFilled ? "#fbbf24" : "#d1d5db"}
        />
      </TouchableOpacity>
    );
  };
  return (
    <View className={cn("flex-row items-center", className)} {...props}>
      <View className="flex-row items-center space-x-1">
        {Array.from({ length: maxRating }).map((_, index) => renderStar(index))}
      </View>
      {showText && (
        <Text className={cn("ml-2 text-sm text-neutral-600", textClassName)}>
          {rating.toFixed(1)} / {maxRating}
        </Text>
      )}
    </View>
  );
};
export interface RatingDisplayProps extends ViewProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
}
export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  size = "md",
  className,
  ...props
}) => {
  const sizeConfig = {
    sm: { starSize: 12, textSize: "text-xs" },
    md: { starSize: 16, textSize: "text-sm" },
    lg: { starSize: 20, textSize: "text-base" },
  };
  const config = sizeConfig[size];
  return (
    <View
      className={cn("flex-row items-center space-x-1", className)}
      {...props}
    >
      <RatingStars rating={rating} size={config.starSize} readonly />
      <Text className={cn("font-medium text-neutral-900", config.textSize)}>
        {rating.toFixed(1)}
      </Text>
      {reviewCount !== undefined && (
        <Text className={cn("text-neutral-500", config.textSize)}>
          ({reviewCount.toLocaleString()} đánh giá)
        </Text>
      )}
    </View>
  );
};
