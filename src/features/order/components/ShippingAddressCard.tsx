import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
                <View className="flex-row items-start mb-3">
                    <Ionicons name="person-outline" size={20} color="#10b981" />
                    <View className="ml-3 flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                            {address.customerName || "Không có tên"}
                        </Text>
                    </View>
                </View>
                {address.phoneNumber && (
                    <TouchableOpacity
                        onPress={() => handleCall(address.phoneNumber)}
                        className="flex-row items-center mb-3"
                    >
                        <Ionicons name="call-outline" size={20} color="#10b981" />
                        <Text className="ml-3 text-base text-blue-600">
                            {address.phoneNumber}
                        </Text>
                    </TouchableOpacity>
                )}
                <View className="flex-row items-start">
                    <Ionicons name="location-outline" size={20} color="#10b981" />
                    <View className="ml-3 flex-1">
                        <Text className="text-base text-gray-700 leading-5">
                            {address.street || "Không có địa chỉ"}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
);

ShippingAddressCard.displayName = "ShippingAddressCard";

