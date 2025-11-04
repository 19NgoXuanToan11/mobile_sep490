import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge } from "../../../src/shared/ui";
import { addressesApi } from "../../../src/shared/data/api";
import { useToast } from "../../../src/shared/ui/toast";
import { Address } from "../../../src/types";

const AddressCard: React.FC<{
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}> = ({ address, onEdit, onDelete, onSetDefault }) => {
  return (
    <Card variant="elevated" padding="lg" className="mb-4">
      <View className="space-y-5">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-wrap gap-2 flex-1 pr-3">
            <Text className="font-semibold text-neutral-900 text-lg">
              {address.customerName || address.name}
            </Text>
            {address.isDefault && (
              <Badge text="Mặc định" size="sm" variant="success" />
            )}
          </View>

          <View className="flex-row space-x-2 mr-1">
            <TouchableOpacity
              onPress={onEdit}
              className="w-8 h-8 bg-neutral-100 rounded-full items-center justify-center"
            >
              <Ionicons name="pencil-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              className="w-8 h-8 bg-red-50 rounded-full items-center justify-center"
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View className="space-y-2.5">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="call-outline" size={16} color="#6b7280" />
            <Text className="text-neutral-700">
              {address.phoneNumber || address.phone}
            </Text>
          </View>

          <View className="flex-row items-start space-x-2">
            <Ionicons
              name="location-outline"
              size={16}
              color="#6b7280"
              className="mt-1"
            />
            <Text className="text-neutral-800 leading-5 flex-1">
              {address.street}, {address.ward}, {address.province || address.city}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {!address.isDefault && (
          <View className="pt-4 border-t border-neutral-100">
            <TouchableOpacity
              onPress={onSetDefault}
              className="flex-row items-center space-x-2"
            >
              <Ionicons name="star-outline" size={16} color="#00623A" />
              <Text className="text-primary-600 font-medium">
                Đặt làm mặc định
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );
};

export default function AddressListScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.getAll().then((res) => res.data),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: addressesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Thành công", "Địa chỉ đã được xóa");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra", "Vui lòng thử lại");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) =>
      addressesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Thành công", "Đã cập nhật địa chỉ mặc định");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra", "Vui lòng thử lại");
    },
  });

  const handleDeleteAddress = (address: Address) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa địa chỉ "${address.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => deleteAddressMutation.mutate(address.id),
        },
      ]
    );
  };

  const handleSetDefaultAddress = (address: Address) => {
    updateAddressMutation.mutate({
      id: address.id,
      data: { isDefault: true },
    });
  };

  const handleEditAddress = (address: Address) => {
    // TODO: Implement edit screen
    router.push(`/(app)/address/edit/${address.id}` as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View className="flex-1 items-center justify-center">
          <View className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <Text className="text-neutral-600 mt-4">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.push("/(app)/address/add")}
          className="bg-primary-500 px-4 py-2 rounded-xl absolute right-4"
          style={{
            shadowColor: "#00623A",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text className="text-white font-medium">Thêm mới</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          {addresses.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="w-24 h-24 bg-neutral-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="location-outline" size={48} color="#9ca3af" />
              </View>
              <Text className="text-xl font-semibold text-neutral-900 mb-2">
                Chưa có địa chỉ nào
              </Text>
              <Text className="text-neutral-600 text-center mb-6">
                Thêm địa chỉ để thuận tiện hơn khi đặt hàng
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(app)/address/add")}
                className="bg-primary-500 px-6 py-3 rounded-xl"
                style={{
                  shadowColor: "#00623A",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white font-medium">
                  Thêm địa chỉ đầu tiên
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-sm text-neutral-500 mb-4">
                {addresses.length} địa chỉ
              </Text>
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={() => handleEditAddress(address)}
                  onDelete={() => handleDeleteAddress(address)}
                  onSetDefault={() => handleSetDefaultAddress(address)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
