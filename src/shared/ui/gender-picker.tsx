import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
export interface GenderOption {
  value: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}
export interface GenderPickerProps {
  value?: number;
  onValueChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}
const GENDER_OPTIONS: GenderOption[] = [
  { value: 0, label: "Nam", icon: "man" },
  { value: 1, label: "Nữ", icon: "woman" },
  { value: 2, label: "Khác", icon: "person" },
];
export function GenderPicker({
  value,
  onValueChange,
  error,
  disabled = false,
}: GenderPickerProps) {
  return (
    <View className="space-y-2">
      <Text className="text-sm font-medium text-neutral-700 mb-3">
        Giới tính
      </Text>
      <View className="flex-row space-x-3">
        {GENDER_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => !disabled && onValueChange(option.value)}
              className={`flex-1 flex-row items-center justify-center px-4 py-3 rounded-2xl border-2 ${
                isSelected
                  ? "bg-primary-50 border-primary-500"
                  : "bg-white border-neutral-200"
              } ${disabled ? "opacity-50" : ""}`}
              activeOpacity={disabled ? 1 : 0.7}
            >
              <Ionicons
                name={option.icon}
                size={18}
                color={isSelected ? "#00623A" : "#6b7280"}
              />
              <Text
                className={`ml-2 font-medium ${
                  isSelected ? "text-primary-700" : "text-neutral-600"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text className="text-error-500 text-sm mt-2">{error}</Text>
      )}
    </View>
  );
}
