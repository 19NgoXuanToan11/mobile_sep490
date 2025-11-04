import React, { useState, useCallback, useMemo } from "react";
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    TextInputProps,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordFieldProps extends Omit<TextInputProps, "style" | "secureTextEntry"> {
    error?: string;
    onChangeText?: (text: string) => void;
}

export const PasswordField = React.memo(
    React.forwardRef<TextInput, PasswordFieldProps>(
        ({ error, onChangeText, ...props }, ref) => {
            const [isFocused, setIsFocused] = useState(false);
            const [isVisible, setIsVisible] = useState(false);

            const handleFocus = useCallback(() => {
                setIsFocused(true);
            }, []);

            const handleBlur = useCallback(() => {
                setIsFocused(false);
            }, []);

            const toggleVisibility = useCallback(() => {
                setIsVisible((prev) => !prev);
            }, []);

            const containerStyle = useMemo(
                () => ({
                    borderRadius: 16,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 2,
                    borderColor: error ? "#EF4444" : isFocused ? "#00A86B" : "#E5E7EB",
                    paddingHorizontal: 16,
                    paddingRight: 48,
                    height: 52,
                    justifyContent: "center" as const,
                    shadowColor: isFocused ? "#00A86B" : "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: isFocused ? 0.06 : 0,
                    shadowRadius: 4,
                    elevation: 0,
                }),
                [isFocused, error]
            );

            const inputStyle = useMemo(
                () => ({
                    fontSize: 16,
                    color: "#111827",
                    padding: 0,
                    margin: 0,
                    height: Platform.OS === "ios" ? 48 : 50,
                }),
                []
            );

            const iconColor = isFocused ? "#00A86B" : "#9CA3AF";

            return (
                <View>
                    <View style={containerStyle}>
                        <TextInput
                            ref={ref}
                            style={inputStyle}
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!isVisible}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChangeText={onChangeText}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            {...props}
                        />
                        <TouchableOpacity
                            onPress={toggleVisibility}
                            style={{
                                position: "absolute",
                                right: 16,
                                width: 24,
                                height: 24,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Ionicons
                                name={isVisible ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color={iconColor}
                            />
                        </TouchableOpacity>
                    </View>
                    {error && (
                        <Text
                            style={{
                                fontSize: 13,
                                color: "#EF4444",
                                marginTop: 6,
                                marginLeft: 4,
                            }}
                        >
                            {error}
                        </Text>
                    )}
                </View>
            );
        }
    )
);

PasswordField.displayName = "PasswordField";

