import React from "react";
import { View, ViewProps, TouchableOpacity } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
const cardVariants = cva(
  "rounded-2xl border bg-white shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-neutral-200 bg-white shadow-sm",
        elevated: "border-neutral-200 bg-white shadow-lg",
        product: "border-neutral-100 bg-white shadow-md hover:shadow-lg",
        outlined: "border-2 border-neutral-200 bg-white shadow-none",
        filled: "border-neutral-100 bg-neutral-50 shadow-none",
        organic: "border-organic-200 bg-organic-50 shadow-sm",
        fresh: "border-primary-200 bg-primary-50 shadow-sm",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      interactive: {
        true: "active:scale-[0.98] active:shadow-sm",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      interactive: false,
    },
  }
);
export interface CardProps
  extends ViewProps,
    VariantProps<typeof cardVariants> {
  onPress?: () => void;
}
export const Card: React.FC<CardProps> = ({
  variant,
  padding,
  interactive,
  onPress,
  className,
  ...props
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      className={cn(
        cardVariants({
          variant,
          padding,
          interactive: onPress ? true : interactive,
        }),
        className
      )}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      {...props}
    />
  );
};

export const CardHeader: React.FC<ViewProps> = ({ className, ...props }) => {
  return (
    <View
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
};
export const CardTitle: React.FC<ViewProps> = ({ className, ...props }) => {
  return (
    <View
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
};
export const CardDescription: React.FC<ViewProps> = ({
  className,
  ...props
}) => {
  return (
    <View className={cn("text-sm text-neutral-500", className)} {...props} />
  );
};
export const CardContent: React.FC<ViewProps> = ({ className, ...props }) => {
  return <View className={cn("p-6 pt-0", className)} {...props} />;
};
export const CardFooter: React.FC<ViewProps> = ({ className, ...props }) => {
  return (
    <View className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
};
