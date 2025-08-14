import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 border-primary-500 text-white focus:ring-primary-500",
        secondary:
          "bg-neutral-100 border-neutral-200 text-neutral-900 focus:ring-neutral-500",
        outline:
          "border-primary-500 bg-transparent text-primary-500 focus:ring-primary-500",
        ghost:
          "border-transparent bg-transparent text-primary-500 hover:bg-primary-50 focus:ring-primary-500",
        destructive:
          "bg-error-500 border-error-500 text-white focus:ring-error-500",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

const textVariants = cva("font-medium", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-neutral-900",
      outline: "text-primary-500",
      ghost: "text-primary-500",
      destructive: "text-white",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
});

export interface ButtonProps
  extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
  title: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant,
  size,
  fullWidth,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === "secondary" ||
            variant === "outline" ||
            variant === "ghost"
              ? "#22c55e"
              : "#ffffff"
          }
          style={{ marginRight: 8 }}
        />
      )}

      {!loading && leftIcon && <React.Fragment>{leftIcon}</React.Fragment>}

      <Text
        className={cn(
          textVariants({ variant, size }),
          leftIcon && !loading && "ml-2",
          rightIcon && "mr-2"
        )}
      >
        {title}
      </Text>

      {!loading && rightIcon && <React.Fragment>{rightIcon}</React.Fragment>}
    </TouchableOpacity>
  );
};
