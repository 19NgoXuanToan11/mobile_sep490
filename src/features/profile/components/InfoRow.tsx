import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
export interface InfoRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    subtitle?: string;
    isLast?: boolean;
}
export const InfoRow = React.memo<InfoRowProps>(
    ({ icon, label, value, subtitle, isLast = false }) => (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color="#6B7280" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.value} numberOfLines={2}>
                        {value}
                    </Text>
                    {subtitle && (
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            {!isLast && <View style={styles.divider} />}
        </View>
    )
);
InfoRow.displayName = "InfoRow";
const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    content: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 14,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    value: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        letterSpacing: 0.1,
        lineHeight: 22,
    },
    subtitle: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 4,
        letterSpacing: 0.1,
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginLeft: 52,
    },
});
