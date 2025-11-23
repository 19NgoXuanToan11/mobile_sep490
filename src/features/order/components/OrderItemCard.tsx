import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "../../../shared/lib/utils";
import { Order } from "../../../types";

interface OrderItemCardProps {
    item: Order["items"][0];
}

export const OrderItemCard = React.memo<OrderItemCardProps>(({ item }) => {
    return (
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row">
                {item.product.images && item.product.images.length > 0 ? (
                    <Image
                        source={{ uri: item.product.images[0] }}
                        className="w-20 h-20 rounded-xl"
                        contentFit="cover"
                    />
                ) : (
                    <View className="w-20 h-20 rounded-xl bg-gray-200 items-center justify-center">
                        <Ionicons name="image-outline" size={32} color="#9ca3af" />
                    </View>
                )}
                <View className="flex-1 ml-4">
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                        {item.product.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mb-2">
                        Số lượng: {item.quantity}
                    </Text>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-green-600">
                            {formatCurrency(item.price)}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            Tổng: {formatCurrency(item.subtotal)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
});

OrderItemCard.displayName = "OrderItemCard";

