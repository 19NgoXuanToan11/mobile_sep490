import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "../../../shared/lib/utils";
import { getStatusInfo, StatusInfo } from "../utils/orderStatus";
import { Order } from "../../../types";

interface OrderHeaderCardProps {
    order: Order;
}

export const OrderHeaderCard = React.memo<OrderHeaderCardProps>(
    ({ order }) => {
        const statusInfo: StatusInfo = getStatusInfo(order.status);

        return (
            <View className="bg-white mx-4 mt-4 rounded-3xl p-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900 mb-1">
                            {order.orderNumber}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            Ngày đặt: {formatDate(order.createdAt, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </Text>
                    </View>
                    <View
                        className="px-4 py-2 rounded-full flex-row items-center"
                        style={{
                            backgroundColor: statusInfo.bgColor,
                            borderWidth: 1,
                            borderColor: statusInfo.borderColor,
                        }}
                    >
                        <Ionicons
                            name={statusInfo.icon as any}
                            size={18}
                            color={statusInfo.color}
                        />
                        <Text
                            className="ml-2 font-semibold text-sm"
                            style={{ color: statusInfo.color }}
                        >
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
);

OrderHeaderCard.displayName = "OrderHeaderCard";

