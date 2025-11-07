import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Alert,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ordersApi } from "../../../src/shared/data/api";
import { formatCurrency, formatDate } from "../../../src/shared/lib/utils";
import { EmptyState, Button } from "../../../src/shared/ui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Status configuration matching orders.tsx
const getStatusInfo = (status: string | number) => {
    const statusStr = String(status);
    switch (statusStr) {
        case "0":
        case "CANCELLED":
            return {
                text: "Đã hủy",
                color: "#ef4444",
                bgColor: "#fef2f2",
                borderColor: "#fca5a5",
                icon: "close-circle-outline",
                gradient: ["#fca5a5", "#ef4444"],
            };
        case "1":
        case "PLACED":
            return {
                text: "Đặt hàng",
                color: "#f59e0b",
                bgColor: "#fffbeb",
                borderColor: "#fbbf24",
                icon: "receipt-outline",
                gradient: ["#fbbf24", "#f59e0b"],
            };
        case "2":
        case "CONFIRMED":
            return {
                text: "Thất bại",
                color: "#dc2626",
                bgColor: "#fef2f2",
                borderColor: "#f87171",
                icon: "close-circle-outline",
                gradient: ["#f87171", "#dc2626"],
            };
        case "3":
        case "PACKED":
            return {
                text: "Đóng gói",
                color: "#8b5cf6",
                bgColor: "#f5f3ff",
                borderColor: "#a78bfa",
                icon: "cube-outline",
                gradient: ["#a78bfa", "#8b5cf6"],
            };
        case "4":
        case "SHIPPED":
            return {
                text: "Đang giao",
                color: "#06b6d4",
                bgColor: "#ecfeff",
                borderColor: "#22d3ee",
                icon: "car-outline",
                gradient: ["#22d3ee", "#06b6d4"],
            };
        case "5":
        case "DELIVERED":
            return {
                text: "Hoàn thành",
                color: "#10b981",
                bgColor: "#ecfdf5",
                borderColor: "#34d399",
                icon: "checkmark-circle-outline",
                gradient: ["#34d399", "#10b981"],
            };
        case "6":
        case "REFUNDED":
            return {
                text: "Hoàn tiền",
                color: "#6366f1",
                bgColor: "#eef2ff",
                borderColor: "#818cf8",
                icon: "arrow-undo-outline",
                gradient: ["#818cf8", "#6366f1"],
            };
        default:
            return {
                text: "Không xác định",
                color: "#6b7280",
                bgColor: "#f9fafb",
                borderColor: "#d1d5db",
                icon: "help-circle-outline",
                gradient: ["#d1d5db", "#6b7280"],
            };
    }
};

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [refreshing, setRefreshing] = useState(false);

    // Fetch order detail
    const {
        data: orderResponse,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["order", id],
        queryFn: async () => {
            if (!id) throw new Error("Order ID not found");
            return await ordersApi.getById(id);
        },
        enabled: !!id,
    });

    const order = orderResponse?.data;
    const statusInfo = order ? getStatusInfo(order.status) : null;

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleCall = (phone: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, "");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL(`tel:${cleanPhone}`);
    };

    const handleCopyOrderNumber = () => {
        if (order?.orderNumber) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Đã sao chép", `Mã đơn hàng: ${order.orderNumber}`);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

                {/* Header */}
                <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-100">
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.back();
                        }}
                        className="mr-3 p-2 -ml-2"
                    >
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 flex-1">
                        Chi tiết đơn hàng
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#047857" />
                    <Text className="mt-4 text-gray-500">Đang tải thông tin...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error || !order) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

                {/* Header */}
                <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-100">
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.back();
                        }}
                        className="mr-3 p-2 -ml-2"
                    >
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 flex-1">
                        Chi tiết đơn hàng
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center px-4">
                    <EmptyState
                        icon="alert-circle-outline"
                        title="Không tìm thấy đơn hàng"
                        description="Đơn hàng không tồn tại hoặc đã bị xóa"
                        actionLabel="Quay lại"
                        onActionPress={() => router.back()}
                    />
                </View>
            </SafeAreaView>
        );
    }

    // Parse shipping address
    const parseShippingAddress = (addressStr: string) => {
        if (!addressStr) return { name: "", phone: "", address: "" };

        const lines = addressStr.split("\n");
        const firstLine = lines[0] || "";
        const [name, phone] = firstLine.split(" - ");
        const address = lines.slice(1).join(", ");

        return {
            name: name?.trim() || "",
            phone: phone?.trim() || "",
            address: address?.trim() || "",
        };
    };

    const shippingInfo = typeof order.shippingAddress === 'string'
        ? parseShippingAddress(order.shippingAddress)
        : {
            name: order.shippingAddress?.customerName || "",
            phone: order.shippingAddress?.phoneNumber || "",
            address: [
                order.shippingAddress?.street,
                order.shippingAddress?.ward,
                order.shippingAddress?.district,
                order.shippingAddress?.province
            ].filter(Boolean).join(", "),
        };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                    className="mr-3 p-2 -ml-2"
                >
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 flex-1">
                    Chi tiết đơn hàng
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#047857"
                        colors={["#047857"]}
                    />
                }
            >
                {/* Order Number & Status Card */}
                <View className="bg-white mx-4 mt-4 rounded-3xl p-6 shadow-lg shadow-black/5 border border-gray-100">
                    <View className="flex-row items-start justify-between mb-4">
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500 mb-1">Mã đơn hàng</Text>
                            <TouchableOpacity
                                onPress={handleCopyOrderNumber}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center">
                                    <Text className="text-2xl font-bold text-gray-900 mr-2">
                                        {order.orderNumber}
                                    </Text>
                                    <Ionicons name="copy-outline" size={20} color="#6b7280" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {statusInfo && (
                            <View
                                className="px-4 py-2 rounded-full border flex-row items-center"
                                style={{
                                    backgroundColor: statusInfo.bgColor,
                                    borderColor: statusInfo.borderColor,
                                }}
                            >
                                <Ionicons
                                    name={statusInfo.icon as any}
                                    size={18}
                                    color={statusInfo.color}
                                    style={{ marginRight: 6 }}
                                />
                                <Text
                                    className="font-semibold text-sm"
                                    style={{ color: statusInfo.color }}
                                >
                                    {statusInfo.text}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row items-center pt-4 border-t border-gray-100">
                        <Ionicons name="time-outline" size={18} color="#6b7280" />
                        <Text className="ml-2 text-sm text-gray-600">
                            Đặt hàng: {formatDate(order.createdAt)}
                        </Text>
                    </View>

                    {order.email && (
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="mail-outline" size={18} color="#6b7280" />
                            <Text className="ml-2 text-sm text-gray-600">
                                {order.email}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Shipping Address Card */}
                <View className="bg-white mx-4 mt-4 rounded-3xl p-6 shadow-lg shadow-black/5 border border-gray-100">
                    <View className="flex-row items-center mb-4">
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: "#ecfdf5" }}
                        >
                            <Ionicons name="location" size={22} color="#047857" />
                        </View>
                        <Text className="text-lg font-bold text-gray-900 flex-1">
                            Địa chỉ giao hàng
                        </Text>
                    </View>

                    <View className="bg-gray-50 rounded-2xl p-4">
                        {shippingInfo.name && (
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="person-outline" size={18} color="#047857" />
                                <Text className="ml-3 text-base font-semibold text-gray-900">
                                    {shippingInfo.name}
                                </Text>
                            </View>
                        )}

                        {shippingInfo.phone && (
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center flex-1">
                                    <Ionicons name="call-outline" size={18} color="#047857" />
                                    <Text className="ml-3 text-base text-gray-700">
                                        {shippingInfo.phone}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {shippingInfo.address && (
                            <View className="flex-row items-start">
                                <Ionicons
                                    name="home-outline"
                                    size={18}
                                    color="#047857"
                                    style={{ marginTop: 2 }}
                                />
                                <Text className="ml-3 text-base text-gray-700 flex-1 leading-6">
                                    {shippingInfo.address}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Order Items Card */}
                <View className="bg-white mx-4 mt-4 rounded-3xl p-6 shadow-lg shadow-black/5 border border-gray-100">
                    <View className="flex-row items-center mb-4">
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: "#fffbeb" }}
                        >
                            <Ionicons name="basket" size={22} color="#f59e0b" />
                        </View>
                        <Text className="text-lg font-bold text-gray-900 flex-1">
                            Sản phẩm ({order.orderItems?.length || 0})
                        </Text>
                    </View>

                    {order.orderItems && order.orderItems.length > 0 ? (
                        <View className="space-y-4">
                            {order.orderItems.map((item, index) => (
                                <View
                                    key={`${item.productId}-${index}`}
                                    className="flex-row bg-gray-50 rounded-2xl p-4"
                                >
                                    {/* Product Image */}
                                    <View className="w-24 h-24 rounded-xl overflow-hidden bg-white mr-4">
                                        {item.images ? (
                                            <Image
                                                source={{ uri: item.images }}
                                                className="w-full h-full"
                                                contentFit="cover"
                                                transition={200}
                                            />
                                        ) : (
                                            <View className="w-full h-full bg-gray-100 items-center justify-center">
                                                <Ionicons name="image-outline" size={32} color="#d1d5db" />
                                            </View>
                                        )}
                                    </View>

                                    {/* Product Info */}
                                    <View className="flex-1">
                                        <Text
                                            className="text-base font-bold text-gray-900 mb-2"
                                            numberOfLines={2}
                                        >
                                            {item.productName}
                                        </Text>

                                        <View className="flex-row items-center mb-2">
                                            <View className="bg-green-100 px-3 py-1 rounded-full mr-2">
                                                <Text className="text-xs font-semibold text-green-700">
                                                    {item.unit}
                                                </Text>
                                            </View>
                                            <Text className="text-sm text-gray-600">
                                                x{item.stockQuantity}
                                            </Text>
                                        </View>

                                        <Text className="text-lg font-bold text-green-600">
                                            {formatCurrency(item.price * item.stockQuantity)}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-1">
                                            {formatCurrency(item.price)}/{item.unit}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="py-8 items-center">
                            <Ionicons name="basket-outline" size={48} color="#d1d5db" />
                            <Text className="mt-3 text-gray-500">Không có sản phẩm</Text>
                        </View>
                    )}
                </View>

                {/* Payment Summary Card */}
                <View className="bg-white mx-4 mt-4 mb-6 rounded-3xl p-6 shadow-lg shadow-black/5 border border-gray-100">
                    <View className="flex-row items-center mb-4">
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: "#eef2ff" }}
                        >
                            <Ionicons name="card" size={22} color="#6366f1" />
                        </View>
                        <Text className="text-lg font-bold text-gray-900 flex-1">
                            Thanh toán
                        </Text>
                    </View>

                    <View className="space-y-3">
                        {/* Subtotal */}
                        {order.subtotal > 0 && (
                            <View className="flex-row justify-between items-center">
                                <Text className="text-base text-gray-600">Tạm tính</Text>
                                <Text className="text-base font-semibold text-gray-900">
                                    {formatCurrency(order.subtotal)}
                                </Text>
                            </View>
                        )}

                        {/* Shipping Fee */}
                        {order.shippingFee > 0 && (
                            <View className="flex-row justify-between items-center">
                                <Text className="text-base text-gray-600">Phí vận chuyển</Text>
                                <Text className="text-base font-semibold text-gray-900">
                                    {formatCurrency(order.shippingFee)}
                                </Text>
                            </View>
                        )}

                        {/* Discount */}
                        {order.discount > 0 && (
                            <View className="flex-row justify-between items-center">
                                <Text className="text-base text-gray-600">Giảm giá</Text>
                                <Text className="text-base font-semibold text-red-600">
                                    -{formatCurrency(order.discount)}
                                </Text>
                            </View>
                        )}

                        {/* Divider */}
                        <View className="h-px bg-gray-200 my-2" />

                        {/* Total */}
                        <View className="flex-row justify-between items-center pt-2">
                            <Text className="text-lg font-bold text-gray-900">
                                Tổng cộng
                            </Text>
                            <Text className="text-2xl font-bold text-green-600">
                                {formatCurrency(order.total ?? order.totalPrice ?? 0)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Notes if available */}
                {order.notes && (
                    <View className="bg-white mx-4 mb-6 rounded-3xl p-6 shadow-lg shadow-black/5 border border-gray-100">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                            <Text className="ml-2 text-base font-bold text-gray-900">
                                Ghi chú
                            </Text>
                        </View>
                        <Text className="text-base text-gray-700 leading-6">
                            {order.notes}
                        </Text>
                    </View>
                )}

                {/* Tracking Number if available */}
                {order.trackingNumber && (
                    <View className="bg-white mx-4 mb-6 rounded-3xl p-6 shadow-lg shadow-black/5 border border-gray-100">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="swap-horizontal-outline" size={20} color="#6b7280" />
                            <Text className="ml-2 text-base font-bold text-gray-900">
                                Mã vận đơn
                            </Text>
                        </View>
                        <Text className="text-lg font-mono text-gray-900">
                            {order.trackingNumber}
                        </Text>
                    </View>
                )}

                {/* Bottom spacing */}
                <View className="h-8" />
            </ScrollView>

            {/* Bottom Action Button (if needed) */}
            {(String(order.status) === "PLACED" || String(order.status) === "1") ? (
                <View className="bg-white border-t border-gray-200 px-4 py-4">
                    <Button
                        title="Hủy đơn hàng"
                        onPress={() => {
                            Alert.alert(
                                "Hủy đơn hàng",
                                "Bạn có chắc chắn muốn hủy đơn hàng này?",
                                [
                                    { text: "Không", style: "cancel" },
                                    {
                                        text: "Hủy đơn",
                                        style: "destructive",
                                        onPress: () => {
                                        },
                                    },
                                ]
                            );
                        }}
                        variant="outline"
                    />
                </View>
            ) : null}
        </SafeAreaView>
    );
}

