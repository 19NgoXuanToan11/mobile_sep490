import React from "react";
import { View, Text, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./button";
import { cn } from "../lib/utils";
export interface EmptyStateProps extends ViewProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  actionVariant?: "primary" | "secondary" | "outline";
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "folder-open-outline",
  title,
  description,
  actionLabel,
  onActionPress,
  actionVariant = "primary",
  className,
  ...props
}) => {
  return (
    <View
      className={cn("flex-1 items-center justify-center px-4 py-8", className)}
      {...props}
    >
      <View className="items-center space-y-4">
        <View className="w-20 h-20 rounded-full bg-neutral-100 items-center justify-center">
          <Ionicons name={icon} size={40} color="#9ca3af" />
        </View>
        <View className="items-center space-y-2">
          <Text className="text-lg font-semibold text-neutral-900 text-center">
            {title}
          </Text>
          {description && (
            <Text className="text-sm text-neutral-500 text-center max-w-sm">
              {description}
            </Text>
          )}
        </View>
        {actionLabel && onActionPress && (
          <Button
            title={actionLabel}
            variant={actionVariant}
            onPress={onActionPress}
            className="mt-4"
          />
        )}
      </View>
    </View>
  );
};
