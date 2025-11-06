import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
interface AddressFormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    placeholder: string;
    value: string;
    onChangeText?: (text: string) => void;
    onPress?: () => void;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: "default" | "phone-pad" | "email-address";
    disabled?: boolean;
    editable?: boolean;
    maxLength?: number;
    rightIcon?: keyof typeof Ionicons.glyphMap;
}
export const AddressFormField = React.memo<AddressFormFieldProps>(
    ({
        label,
        required = false,
        error,
        placeholder,
        value,
        onChangeText,
        onPress,
        multiline = false,
        numberOfLines = 1,
        keyboardType = "default",
        disabled = false,
        editable = true,
        maxLength,
        rightIcon,
    }) => {
        const [isFocused, setIsFocused] = useState(false);
        const handleFocus = useCallback(() => {
            if (onPress) {
                onPress();
            } else {
                setIsFocused(true);
            }
        }, [onPress]);
        const handleBlur = useCallback(() => {
            setIsFocused(false);
        }, []);
        const isPickerField = !!onPress;
        const hasError = !!error;
        const hasValue = value && value.trim().length > 0;
        return (
            <View style={styles.container}>
                {}
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
                {}
                <TouchableOpacity
                    activeOpacity={isPickerField ? 0.6 : 1}
                    onPress={isPickerField ? onPress : undefined}
                    disabled={disabled}
                    style={[
                        styles.inputContainer,
                        multiline && styles.inputContainerMultiline,
                        isFocused && styles.inputContainerFocused,
                        hasError && styles.inputContainerError,
                        disabled && styles.inputContainerDisabled,
                    ]}
                >
                    <TextInput
                        style={[
                            styles.input,
                            multiline && styles.inputMultiline,
                            isPickerField && styles.inputPicker,
                            disabled && styles.inputDisabled,
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        editable={!isPickerField && editable && !disabled}
                        multiline={multiline}
                        numberOfLines={numberOfLines}
                        textAlignVertical={multiline ? "top" : "center"}
                        keyboardType={keyboardType}
                        maxLength={maxLength}
                    />
                    {}
                    {isPickerField && (
                        <Ionicons
                            name={rightIcon || "chevron-down"}
                            size={20}
                            color={disabled ? "#D1D5DB" : "#6B7280"}
                            style={styles.rightIcon}
                        />
                    )}
                </TouchableOpacity>
                {}
                {hasError && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="warning-outline" size={14} color="#EF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
                {}
                {multiline && maxLength && hasValue && (
                    <Text style={styles.charCount}>
                        {value.length}/{maxLength}
                    </Text>
                )}
            </View>
        );
    }
);
AddressFormField.displayName = "AddressFormField";
const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    required: {
        color: "#EF4444",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 16,
        minHeight: 52,
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.02,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    inputContainerMultiline: {
        paddingVertical: 14,
        minHeight: 100,
        alignItems: "flex-start",
    },
    inputContainerFocused: {
        backgroundColor: "#FFFFFF",
        borderColor: "#00A86B",
        ...Platform.select({
            ios: {
                shadowColor: "#00A86B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    inputContainerError: {
        borderColor: "#EF4444",
        backgroundColor: "#FEF2F2",
    },
    inputContainerDisabled: {
        backgroundColor: "#F3F4F6",
        borderColor: "#E5E7EB",
        opacity: 0.6,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#111827",
        paddingVertical: 0,
        includeFontPadding: false,
    },
    inputMultiline: {
        paddingVertical: 0,
        minHeight: 70,
        textAlignVertical: "top",
    },
    inputPicker: {
        color: "#111827",
    },
    inputDisabled: {
        color: "#9CA3AF",
    },
    rightIcon: {
        marginLeft: 8,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        paddingHorizontal: 4,
    },
    errorText: {
        fontSize: 13,
        color: "#EF4444",
        marginLeft: 4,
        flex: 1,
    },
    charCount: {
        fontSize: 12,
        color: "#9CA3AF",
        textAlign: "right",
        marginTop: 4,
        paddingHorizontal: 4,
    },
});
