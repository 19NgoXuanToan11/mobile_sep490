import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentMethod } from "../../../types";

interface PaymentMethodCardProps {
    method: PaymentMethod;
    isSelected: boolean;
    onSelect: () => void;
}

const getPaymentIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
        case "E_WALLET":
            return "wallet-outline";
        case "COD":
            return "cash-outline";
        case "BANK_TRANSFER":
            return "card-outline";
        case "CREDIT_CARD":
            return "card-outline";
        default:
            return "wallet-outline";
    }
};

const getPaymentColor = (type: PaymentMethod["type"]) => {
    switch (type) {
        case "E_WALLET":
            return "#FF6B00";
        case "COD":
            return "#34C759";
        case "BANK_TRANSFER":
            return "#007AFF";
        case "CREDIT_CARD":
            return "#5856D6";
        default:
            return "#8E8E93";
    }
};

export const PaymentMethodCard = memo<PaymentMethodCardProps>(
    ({ method, isSelected, onSelect }) => {
        const iconColor = getPaymentColor(method.type);

        return (
            <TouchableOpacity
                style={[styles.container, isSelected && styles.selectedContainer]}
                onPress={onSelect}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                    <Ionicons
                        name={getPaymentIcon(method.type) as any}
                        size={24}
                        color={iconColor}
                    />
                </View>

                <View style={styles.content}>
                    <Text style={styles.name}>{method.name}</Text>
                    <Text style={styles.description} numberOfLines={1}>
                        {method.description}
                    </Text>
                </View>

                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
            </TouchableOpacity>
        );
    }
);

PaymentMethodCard.displayName = "PaymentMethodCard";

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#E5E5EA",
        flexDirection: "row",
        alignItems: "center",
    },
    selectedContainer: {
        borderColor: "#00A86B",
        backgroundColor: "#F0FDF7",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: "#8E8E93",
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#C7C7CC",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },
    radioSelected: {
        borderColor: "#00A86B",
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#00A86B",
    },
});

