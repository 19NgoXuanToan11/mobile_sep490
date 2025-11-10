import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StatusBar,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { addressesApi } from "../../../src/shared/data/api";
import { useToast } from "../../../src/shared/ui/toast";
import { Address } from "../../../src/types";
import {
  AddressCard,
  AddNewButton,
  EmptyAddressState,
  ConfirmDialog,
} from "../../../src/features/address/components";

interface DialogState {
  visible: boolean;
  type: "delete" | "setDefault" | null;
  address: Address | null;
}

export default function MyAddressScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: null,
    address: null,
  });

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.getAll().then((res) => res.data),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: addressesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Cập nhật thành công", "Địa chỉ đã được xóa");
    },
    onError: () => {
      toast.error("Thao tác thất bại", "Vui lòng thử lại");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) =>
      addressesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Cập nhật thành công", "Địa chỉ mặc định đã được đặt");
    },
    onError: () => {
      toast.error("Thao tác thất bại", "Vui lòng thử lại");
    },
  });

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleAddAddress = useCallback(() => {
    router.push("/(app)/address/add");
  }, []);

  const handleEditAddress = useCallback((address: Address) => {
    router.push(`/(app)/address/edit/${address.id}` as any);
  }, []);

  const handleDeletePress = useCallback((address: Address) => {
    setDialog({
      visible: true,
      type: "delete",
      address,
    });
  }, []);

  const handleSetDefaultPress = useCallback((address: Address) => {
    setDialog({
      visible: true,
      type: "setDefault",
      address,
    });
  }, []);

  const handleDialogCancel = useCallback(() => {
    setDialog({
      visible: false,
      type: null,
      address: null,
    });
  }, []);

  const handleDialogConfirm = useCallback(() => {
    if (!dialog.address) return;

    if (dialog.type === "delete") {
      deleteAddressMutation.mutate(dialog.address.id);
    } else if (dialog.type === "setDefault") {
      updateAddressMutation.mutate({
        id: dialog.address.id,
        data: { isDefault: true },
      });
    }

    handleDialogCancel();
  }, [dialog, deleteAddressMutation, updateAddressMutation, handleDialogCancel]);

  const renderAddressCard = useCallback(
    ({ item }: { item: Address }) => (
      <AddressCard
        address={item}
        onEdit={() => handleEditAddress(item)}
        onDelete={() => handleDeletePress(item)}
        onSetDefault={() => handleSetDefaultPress(item)}
      />
    ),
    [handleEditAddress, handleDeletePress, handleSetDefaultPress]
  );

  const renderHeader = useCallback(() => {
    if (addresses.length === 0) return null;

    return (
      <Text style={styles.addressCount}>
        {addresses.length} địa chỉ
      </Text>
    );
  }, [addresses.length]);

  const renderEmpty = useCallback(
    () => <EmptyAddressState onAddAddress={handleAddAddress} />,
    [handleAddAddress]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Địa Chỉ Của Tôi</Text>
        </View>
        <AddNewButton onPress={handleAddAddress} />
      </View>

      {/* Address List */}
      <FlatList
        data={addresses}
        renderItem={renderAddressCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          addresses.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        visible={dialog.visible}
        title={
          dialog.type === "delete"
            ? "Xác nhận xóa"
            : "Đặt làm địa chỉ mặc định?"
        }
        message={
          dialog.type === "delete"
            ? `Bạn có chắc muốn xóa địa chỉ "${dialog.address?.name || dialog.address?.customerName}"?`
            : "Địa chỉ này sẽ được sử dụng làm địa chỉ giao hàng mặc định"
        }
        confirmText={dialog.type === "delete" ? "Xóa" : "Đồng ý"}
        cancelText="Hủy"
        confirmColor={dialog.type === "delete" ? "danger" : "primary"}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  addressCount: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
});
