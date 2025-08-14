import React, { forwardRef, useState } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const inputVariants = cva(
  "border rounded-lg px-3 py-3 text-base bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-neutral-300 focus:border-primary-500 focus:ring-primary-500",
        error: "border-error-500 focus:border-error-500 focus:ring-error-500",
        success:
          "border-success-500 focus:border-success-500 focus:ring-success-500",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-3 text-base",
        lg: "h-12 px-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<TextInputProps, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      variant,
      size,
      className,
      label,
      error,
      success,
      leftIcon,
      rightIcon,
      onRightIconPress,
      required,
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(
      !secureTextEntry
    );
    const [isFocused, setIsFocused] = useState(false);

    const finalVariant = error ? "error" : success ? "success" : variant;
    const isPassword = secureTextEntry;
    const showPasswordIcon = isPassword;
    const finalRightIcon = showPasswordIcon
      ? isPasswordVisible
        ? "eye-off"
        : "eye"
      : rightIcon;

    const handleRightIconPress = () => {
      if (showPasswordIcon) {
        setIsPasswordVisible(!isPasswordVisible);
      } else if (onRightIconPress) {
        onRightIconPress();
      }
    };

    return (
      <View className="w-full">
        {label && (
          <Text className="text-sm font-medium text-neutral-700 mb-1">
            {label}
            {required && <Text className="text-error-500 ml-1">*</Text>}
          </Text>
        )}

        <View className="relative">
          {leftIcon && (
            <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
              <Ionicons name={leftIcon} size={20} color="#6b7280" />
            </View>
          )}

          <TextInput
            ref={ref}
            className={cn(
              inputVariants({ variant: finalVariant, size }),
              leftIcon && "pl-10",
              (finalRightIcon || showPasswordIcon) && "pr-10",
              isFocused && "border-primary-500",
              className
            )}
            secureTextEntry={isPassword && !isPasswordVisible}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            placeholderTextColor="#9ca3af"
            {...props}
          />

          {(finalRightIcon || showPasswordIcon) && (
            <TouchableOpacity
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onPress={handleRightIconPress}
            >
              <Ionicons name={finalRightIcon!} size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {error && <Text className="text-sm text-error-500 mt-1">{error}</Text>}

        {success && !error && (
          <Text className="text-sm text-success-500 mt-1">{success}</Text>
        )}
      </View>
    );
  }
);
