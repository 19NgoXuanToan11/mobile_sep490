import React from "react";
import { View, ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const cardVariants = cva("rounded-lg border bg-white shadow-sm", {
  variants: {
    variant: {
      default: "border-neutral-200 bg-white shadow-sm",
      elevated: "border-neutral-200 bg-white shadow-md",
      outlined: "border-2 border-neutral-200 bg-white shadow-none",
      filled: "border-neutral-100 bg-neutral-50 shadow-none",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

export interface CardProps
  extends ViewProps,
    VariantProps<typeof cardVariants> {}

export const Card: React.FC<CardProps> = ({
  variant,
  padding,
  className,
  ...props
}) => {
  return (
    <View
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  );
};

// Card subcomponents
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
