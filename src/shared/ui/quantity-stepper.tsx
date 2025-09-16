import React from "react";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../lib/utils";

export interface QuantityStepperProps extends ViewProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onValueChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  size = "md",
  className,
  ...props
}) => {
  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onValueChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onValueChange(Math.min(max, value + step));
  };

  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;

  const sizeStyles = {
    sm: {
      container: "h-8 min-w-24",
      button: "w-8 h-8",
      text: "text-sm font-semibold",
      icon: 16,
      quantityContainer: "min-w-8 px-3",
    },
    md: {
      container: "h-10 min-w-32",
      button: "w-10 h-10",
      text: "text-base font-semibold",
      icon: 18,
      quantityContainer: "min-w-12 px-4",
    },
    lg: {
      container: "h-12 min-w-36",
      button: "w-12 h-12",
      text: "text-lg font-semibold",
      icon: 20,
      quantityContainer: "min-w-16 px-5",
    },
  };

  const styles = sizeStyles[size];

  return (
    <View
      className={cn(
        "flex-row items-center border border-neutral-200 rounded-lg bg-white shadow-sm",
        styles.container,
        disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <TouchableOpacity
        onPress={handleDecrement}
        disabled={!canDecrement}
        className={cn(
          "items-center justify-center border-r border-neutral-200 rounded-l-lg",
          styles.button,
          !canDecrement && "opacity-50"
        )}
      >
        <Ionicons
          name="remove"
          size={styles.icon}
          color={canDecrement ? "#374151" : "#9ca3af"}
        />
      </TouchableOpacity>

      <View
        className={cn("items-center justify-center", styles.quantityContainer)}
      >
        <Text className={cn("text-neutral-900 text-center", styles.text)}>
          {value}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleIncrement}
        disabled={!canIncrement}
        className={cn(
          "items-center justify-center border-l border-neutral-200 rounded-r-lg",
          styles.button,
          !canIncrement && "opacity-50"
        )}
      >
        <Ionicons
          name="add"
          size={styles.icon}
          color={canIncrement ? "#374151" : "#9ca3af"}
        />
      </TouchableOpacity>
    </View>
  );
};
