import React, { forwardRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    Platform,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FormInputProps extends TextInputProps {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export const FormInput = React.memo(
    forwardRef<TextInput, FormInputProps>(
        (
            {
                label,
                icon,
                error,
                required,
                disabled,
                multiline,
                style,
                ...textInputProps
            },
            ref
        ) => {
            const [isFocused, setIsFocused] = useState(false);
            const borderColor = new Animated.Value(0);

            const handleFocus = () => {
                setIsFocused(true);
                Animated.timing(borderColor, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: false,
                }).start();
            };

            const handleBlur = () => {
                setIsFocused(false);
                Animated.timing(borderColor, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: false,
                }).start();
            };

            const animatedBorderColor = borderColor.interpolate({
                inputRange: [0, 1],
                outputRange: error ? ["#FCA5A5", "#EF4444"] : ["#E5E7EB", "#00A86B"],
            });

            return (
                <View style={styles.container}>
                    {/* Label */}
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>
                            {label}
                            {required && <Text style={styles.required}>*</Text>}
                        </Text>
                    </View>

                    {/* Input Container */}
                    <Animated.View
                        style={[
                            styles.inputContainer,
                            multiline && styles.multilineContainer,
                            disabled && styles.disabledContainer,
                            { borderColor: animatedBorderColor },
                            error && styles.errorContainer,
                        ]}
                    >
                        {/* Icon */}
                        {icon && (
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={icon}
                                    size={20}
                                    color={error ? "#EF4444" : isFocused ? "#00A86B" : "#9CA3AF"}
                                />
                            </View>
                        )}

                        {/* Input */}
                        <TextInput
                            ref={ref}
                            style={[
                                styles.input,
                                multiline && styles.multilineInput,
                                disabled && styles.disabledInput,
                                style,
                            ]}
                            placeholderTextColor="#9CA3AF"
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            editable={!disabled}
                            multiline={multiline}
                            textAlignVertical={multiline ? "top" : "center"}
                            {...textInputProps}
                        />
                    </Animated.View>

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorMessageContainer}>
                            <Ionicons
                                name="alert-circle"
                                size={14}
                                color="#EF4444"
                                style={styles.errorIcon}
                            />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                </View>
            );
        }
    )
);

FormInput.displayName = "FormInput";

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    labelContainer: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        letterSpacing: 0.2,
    },
    required: {
        color: "#EF4444",
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        paddingHorizontal: 14,
        minHeight: 52,
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    multilineContainer: {
        minHeight: 100,
        paddingVertical: 14,
        alignItems: "flex-start",
    },
    disabledContainer: {
        backgroundColor: "#F9FAFB",
        borderColor: "#E5E7EB",
    },
    errorContainer: {
        borderColor: "#FCA5A5",
        backgroundColor: "#FEF2F2",
    },
    iconContainer: {
        marginRight: 10,
        alignSelf: "flex-start",
        paddingTop: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: "400",
        color: "#111827",
        paddingVertical: 0,
        letterSpacing: 0.3,
    },
    multilineInput: {
        paddingTop: 0,
        paddingBottom: 0,
        minHeight: 72,
    },
    disabledInput: {
        color: "#6B7280",
    },
    errorMessageContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        paddingLeft: 2,
    },
    errorIcon: {
        marginRight: 4,
    },
    errorText: {
        fontSize: 13,
        color: "#EF4444",
        fontWeight: "400",
        letterSpacing: 0.1,
    },
});

