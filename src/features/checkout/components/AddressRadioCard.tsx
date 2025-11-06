import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Address } from "../../../types";
interface AddressRadioCardProps {
    address: Address;
    isSelected: boolean;
    onSelect: () => void;
}
export const AddressRadioCard = memo<AddressRadioCardProps>(
    ({ address, isSelected, onSelect }) => {
        const fullAddress = `${address.street}, ${address.ward}, ${address.district}, ${address.province}`;
        return (
            <TouchableOpacity
                style={[styles.container, isSelected && styles.selectedContainer]}
                onPress={onSelect}
                activeOpacity={0.7}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{address.customerName}</Text>
                        {address.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultText}>Mặc định</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="call-outline" size={14} color="#8E8E93" />
                        <Text style={styles.phone}>{address.phoneNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="location-outline" size={14} color="#8E8E93" />
                        <Text style={styles.address} numberOfLines={2}>
                            {fullAddress}
                        </Text>
                    </View>
                </View>
                <View
                    style={[styles.radio, isSelected && styles.radioSelected]}
                >
                    {isSelected && (
                        <View style={styles.radioInner} />
                    )}
                </View>
            </TouchableOpacity>
        );
    }
);
AddressRadioCard.displayName = "AddressRadioCard";
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#E5E5EA",
        flexDirection: "row",
        alignItems: "flex-start",
    },
    selectedContainer: {
        borderColor: "#00A86B",
        backgroundColor: "#F0FDF7",
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    defaultBadge: {
        backgroundColor: "#00A86B",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    defaultText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 6,
        gap: 6,
    },
    phone: {
        fontSize: 14,
        color: "#3A3A3C",
        flex: 1,
    },
    address: {
        fontSize: 14,
        color: "#3A3A3C",
        flex: 1,
        lineHeight: 20,
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
