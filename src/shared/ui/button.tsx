import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl border font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 border-primary-500 text-white shadow-lg focus:ring-primary-500 active:bg-primary-600",
        secondary:
          "bg-white border-neutral-200 text-neutral-900 shadow-sm focus:ring-neutral-500 active:bg-neutral-50",
        outline:
          "border-primary-500 bg-transparent text-primary-500 focus:ring-primary-500 active:bg-primary-50",
        ghost:
          "border-transparent bg-transparent text-primary-500 active:bg-primary-50 focus:ring-primary-500",
        destructive:
          "bg-error-500 border-error-500 text-white shadow-lg focus:ring-error-500 active:bg-error-600",
        success:
          "bg-success-500 border-success-500 text-white shadow-lg focus:ring-success-500 active:bg-success-600",
        organic:
          "bg-organic-500 border-organic-500 text-white shadow-lg focus:ring-organic-500 active:bg-organic-600",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-12 px-8 text-lg",
        xl: "h-14 px-10 text-xl",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      rounded: {
        true: "rounded-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      rounded: false,
    },
  }
);
const textVariants = cva("font-semibold", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-neutral-900",
      outline: "text-primary-500",
      ghost: "text-primary-500",
      destructive: "text-white",
      success: "text-white",
      organic: "text-white",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
export interface ButtonProps
  extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
  title: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
}
export const Button: React.FC<ButtonProps> = ({
  title,
  variant,
  size,
  fullWidth,
  rounded,
  loading = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const getIndicatorColor = () => {
    switch (variant) {
      case "secondary":
      case "outline":
      case "ghost":
        return "#00623A";
      default:
        return "#ffffff";
    }
  };
  return (
    <TouchableOpacity
      className={cn(
        buttonVariants({ variant, size, fullWidth, rounded }),
        className
      )}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={getIndicatorColor()}
          style={{ marginRight: iconOnly ? 0 : 8 }}
        />
      )}
      {!loading && leftIcon && (
        <View className={iconOnly ? "" : "mr-2"}>{leftIcon}</View>
      )}
      {!iconOnly && (
        <Text
          className={cn(textVariants({ variant, size }), loading && "ml-2")}
        >
          {title}
        </Text>
      )}
      {!loading && rightIcon && (
        <View className={iconOnly ? "" : "ml-2"}>{rightIcon}</View>
      )}
    </TouchableOpacity>
  );
};
