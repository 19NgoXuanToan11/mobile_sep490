import React from "react";
import { View, Text, ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-500 text-white",
        secondary: "border-transparent bg-neutral-100 text-neutral-900",
        success: "border-transparent bg-success-500 text-white",
        warning: "border-transparent bg-warning-500 text-white",
        error: "border-transparent bg-error-500 text-white",
        outline: "border-neutral-200 bg-transparent text-neutral-900",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
const textVariants = cva("font-semibold", {
  variants: {
    variant: {
      default: "text-white",
      secondary: "text-neutral-900",
      success: "text-white",
      warning: "text-white",
      error: "text-white",
      outline: "text-neutral-900",
    },
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
});
export interface BadgeProps
  extends ViewProps,
    VariantProps<typeof badgeVariants> {
  text?: string;
  children?: React.ReactNode;
}
export const Badge: React.FC<BadgeProps> = ({
  text,
  children,
  variant,
  size,
  className,
  ...props
}) => {
  return (
    <View
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      <Text className={cn(textVariants({ variant, size }))}>
        {text ?? children}
      </Text>
    </View>
  );
};
