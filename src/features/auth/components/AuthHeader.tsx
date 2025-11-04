import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AuthHeaderProps {
    title: string;
    subtitle: string;
}

export const AuthHeader = React.memo<AuthHeaderProps>(({ title, subtitle }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                alignItems: "center",
                marginBottom: 32,
            }}
        >
            {/* Icon圆形容器 */}
            <View
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                }}
            >
                <Ionicons name="leaf" size={28} color="#00A86B" />
            </View>

            {/* 标题 */}
            <Text
                style={{
                    fontSize: 24,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 8,
                    letterSpacing: -0.5,
                }}
            >
                {title}
            </Text>

            {/* 副标题 */}
            <Text
                style={{
                    fontSize: 14,
                    color: "#6B7280",
                    textAlign: "center",
                }}
            >
                {subtitle}
            </Text>
        </Animated.View>
    );
});

AuthHeader.displayName = "AuthHeader";

