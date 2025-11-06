import React, { useState, useCallback, useMemo } from "react";
import {
    View,
    TextInput,
    Text,
    TextInputProps,
    Platform,
} from "react-native";
interface TextFieldProps extends Omit<TextInputProps, "style"> {
    error?: string;
    onChangeText?: (text: string) => void;
}
export const TextField = React.memo(
    React.forwardRef<TextInput, TextFieldProps>(
        ({ error, onChangeText, ...props }, ref) => {
            const [isFocused, setIsFocused] = useState(false);
            const handleFocus = useCallback(() => {
                setIsFocused(true);
            }, []);
            const handleBlur = useCallback(() => {
                setIsFocused(false);
            }, []);
            const containerStyle = useMemo(
                () => ({
                    borderRadius: 16,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 2,
                    borderColor: error ? "#EF4444" : isFocused ? "#00A86B" : "#E5E7EB",
                    paddingHorizontal: 16,
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
            return (
                <View>
                    <View style={containerStyle}>
                        <TextInput
                            ref={ref}
                            style={inputStyle}
                            placeholderTextColor="#9CA3AF"
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChangeText={onChangeText}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            {...props}
                        />
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
TextField.displayName = "TextField";
