import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
const searchBarVariants = cva(
  "flex-row items-center bg-white border border-neutral-200 rounded-xl px-4 shadow-sm h-12",
  {
    variants: {
      variant: {
        default: "bg-white border-neutral-200",
        filled: "bg-neutral-50 border-neutral-100",
        outlined: "bg-transparent border-neutral-300",
      },
      size: {
        sm: "h-10 px-3",
        md: "h-12 px-4",
        lg: "h-14 px-5",
      },
      sticky: {
        true: "shadow-md border-neutral-100",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      sticky: false,
    },
  }
);
export interface SearchBarProps
  extends ViewProps,
    VariantProps<typeof searchBarVariants> {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showFilter?: boolean;
  onFilterPress?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
}
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Tìm kiếm sản phẩm...",
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  showFilter = false,
  onFilterPress,
  autoFocus = false,
  editable = true,
  variant,
  size,
  sticky,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  const handleSubmit = () => {
    if (value && onSubmit) {
      onSubmit(value);
    }
  };
  const handleClear = () => {
    onChangeText?.("");
  };
  return (
    <View
      className={cn(
        searchBarVariants({ variant, size, sticky }),
        isFocused && "border-primary-300 ring-1 ring-primary-200",
        className
      )}
      {...props}
    >
      {}
      <View className="items-center justify-center w-6 h-6">
        <Ionicons
          name="search-outline"
          size={20}
          color={isFocused ? "#00623A" : "#6b7280"}
        />
      </View>
      {}
      <TextInput
        className="flex-1 ml-3 text-base text-neutral-900"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmit}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
        style={{
          paddingVertical: 0,
          paddingTop: 0,
          paddingBottom: 0,
          margin: 0,
          includeFontPadding: false,
          textAlignVertical: "center",
          height: "100%",
          lineHeight: 20,
          fontSize: 16,
        }}
      />
      {}
      {value && value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          className="ml-2 p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={18} color="#9ca3af" />
        </TouchableOpacity>
      )}
      {}
      {showFilter && (
        <TouchableOpacity
          onPress={onFilterPress}
          className="ml-3 p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View className="flex-row items-center">
            <Ionicons name="options-outline" size={20} color="#00623A" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};
