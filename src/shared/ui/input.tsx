import React, { forwardRef, useState, useCallback } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
  Platform,
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
        lg: "h-14 px-4 text-base",
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

    const handleRightIconPress = useCallback(() => {
      if (showPasswordIcon) {
        setIsPasswordVisible(!isPasswordVisible);
      } else if (onRightIconPress) {
        onRightIconPress();
      }
    }, [showPasswordIcon, isPasswordVisible, onRightIconPress]);

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        props.onFocus?.(e);
      },
      [props.onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        props.onBlur?.(e);
      },
      [props.onBlur]
    );

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
            <View
              className="absolute left-3 items-center justify-center w-6 h-6"
              style={{
                top: "50%",
                transform: [{ translateY: -12 }],
                zIndex: 10,
              }}
            >
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
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="#9ca3af"
            autoCorrect={false}
            spellCheck={false}
            textContentType={isPassword ? "password" : props.textContentType}
            importantForAutofill={isPassword ? "yes" : "auto"}
            blurOnSubmit={false}
            returnKeyType={props.returnKeyType || "next"}
            enablesReturnKeyAutomatically={true}
            contextMenuHidden={isPassword}
            {...props}
            style={[
              {
                fontSize: size === "lg" ? 16 : size === "sm" ? 14 : 15,
                lineHeight:
                  Platform.OS === "ios"
                    ? size === "lg"
                      ? 22
                      : size === "sm"
                      ? 18
                      : 20
                    : size === "lg"
                    ? 24
                    : size === "sm"
                    ? 20
                    : 22,
                paddingVertical: 0,
                includeFontPadding: false,
                textAlignVertical: "center",
                height: size === "lg" ? 56 : size === "sm" ? 36 : 44,
              },
              props.style,
            ]}
          />

          {(finalRightIcon || showPasswordIcon) && (
            <TouchableOpacity
              className="absolute right-3"
              style={{
                top: "50%",
                transform: [{ translateY: -10 }],
                zIndex: 10,
              }}
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
