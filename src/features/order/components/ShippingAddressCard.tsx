import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Order } from "../../../types";

interface ShippingAddressCardProps {
    address: Order["shippingAddress"];
}

export const ShippingAddressCard = React.memo<ShippingAddressCardProps>(
    ({ address }) => {
        const handleCall = (phone: string) => {
            if (phone) {
                Linking.openURL(`tel:${phone}`);
            }
        };

        return (
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <View className="mb-3">
                    <Text className="text-base font-semibold text-gray-900">
                        {address.customerName || "Không có tên"}
                    </Text>
                </View>
                {address.phoneNumber && (
                    <TouchableOpacity
                        onPress={() => handleCall(address.phoneNumber)}
                        className="mb-3"
                    >
                        <Text className="text-base text-blue-600">
                            {address.phoneNumber}
                        </Text>
                    </TouchableOpacity>
                )}
                <View>
                    <Text className="text-base text-gray-700 leading-5">
                        {address.street || "Không có địa chỉ"}
                    </Text>
                </View>
            </View>
        );
    }
);

ShippingAddressCard.displayName = "ShippingAddressCard";

