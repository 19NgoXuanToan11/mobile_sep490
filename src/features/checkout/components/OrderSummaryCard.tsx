import React, { memo } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { CartItem } from "../../../types";
import { formatCurrency } from "../../../shared/lib/utils";
interface OrderSummaryCardProps {
    items: CartItem[];
    subtotal: number;
    total: number;
}

const OrderItemRow = memo<{ item: CartItem }>(({ item }) => (
    <View style={styles.itemRow}>
        <Image
            source={{ uri: item.product.images[0] }}
            style={styles.itemImage}
            contentFit="cover"
            transition={200}
        />
        <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
                {item.product.name}
            </Text>
            <Text style={styles.itemMeta}>
                {item.quantity} x {formatCurrency(item.price)}
            </Text>
        </View>
        <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
    </View>
));
OrderItemRow.displayName = "OrderItemRow";
export const OrderSummaryCard = memo<OrderSummaryCardProps>(
    ({ items, subtotal, total }) => {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="receipt-outline" size={20} color="#00A86B" />
                    <Text style={styles.title}>Đơn Hàng</Text>
                </View>
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <OrderItemRow item={item} />}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.listContent}
                />
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tạm tính</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                </View>
            </View>
        );
    }
);
OrderSummaryCard.displayName = "OrderSummaryCard";
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    listContent: {
        gap: 0,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    itemImage: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: "#F5F5F5",
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 13,
        color: "#8E8E93",
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1A1A1A",
        marginLeft: 12,
    },
    separator: {
        height: 1,
        backgroundColor: "#F2F2F7",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E5EA",
        marginVertical: 16,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 15,
        color: "#3A3A3C",
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    totalRow: {
        marginTop: 8,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#00A86B",
    },
});
