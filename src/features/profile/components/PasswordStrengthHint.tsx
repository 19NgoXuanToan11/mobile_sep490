import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { getPasswordStrength } from "../schemas/changePasswordSchema";
interface PasswordStrengthHintProps {
    password: string;
}

export const PasswordStrengthHint = React.memo<PasswordStrengthHintProps>(
    ({ password }) => {

        if (!password) return null;
        const strength = useMemo(
            () => getPasswordStrength(password),
            [password]
        );
        const strengthConfig = useMemo(() => {
            switch (strength) {
                case "weak":
                    return {
                        text: "YẾU",
                        color: "#EF4444",
                        bgColor: "rgba(239, 68, 68, 0.08)",
                    };
                case "medium":
                    return {
                        text: "TRUNG BÌNH",
                        color: "#F59E0B",
                        bgColor: "rgba(245, 158, 11, 0.08)",
                    };
                case "strong":
                    return {
                        text: "MẠNH",
                        color: "#00A86B",
                        bgColor: "rgba(0, 168, 107, 0.08)",
                    };
            }
        }, [strength]);
        return (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: strengthConfig.bgColor,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                }}
            >
                <View
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: strengthConfig.color,
                        marginRight: 8,
                    }}
                />
                <Text
                    style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: strengthConfig.color,
                        letterSpacing: 0.3,
                    }}
                >
                    {strengthConfig.text}
                </Text>
            </View>
        );
    }
);
PasswordStrengthHint.displayName = "PasswordStrengthHint";
