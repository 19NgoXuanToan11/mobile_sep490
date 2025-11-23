import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../../../shared/ui";
import { formatCurrency } from "../../../shared/lib/utils";

interface PaymentResultContentProps {
    paymentStatus: "loading" | "success" | "failed";
    orderId: string;
    amount?: string;
    orderData?: any;
    onGoHome: () => void;
    onGoToOrders: () => void;
    onRetry?: () => void;
}

export const PaymentResultContent = React.memo<PaymentResultContentProps>(
    ({
        paymentStatus,
        orderId,
        amount,
        orderData,
        onGoHome,
        onGoToOrders,
        onRetry,
    }) => {
        if (paymentStatus === "loading") {
            return (
                <>
                    <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center">
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                    <View className="items-center space-y-2">
                        <Text className="text-xl font-semibold text-neutral-900">
                            Đang xử lý thanh toán
                        </Text>
                        <Text className="text-neutral-600 text-center">
                            Vui lòng đợi trong khi chúng tôi xác nhận thanh toán của bạn...
                        </Text>
                    </View>
                    <View className="bg-blue-50 p-4 rounded-lg w-full">
                        <Text className="text-blue-800 text-sm text-center">
                            Mã đơn hàng: #{orderId}
                        </Text>
                    </View>
                </>
            );
        }

        if (paymentStatus === "success") {
            return (
                <>
                    <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
                        <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                    </View>
                    <View className="items-center space-y-2">
                        <Text className="text-xl font-semibold text-neutral-900">
                            Thanh toán thành công!
                        </Text>
                        <Text className="text-neutral-600 text-center">
                            Đơn hàng của bạn đã được thanh toán và đang được xử lý
                        </Text>
                    </View>
                    <View className="bg-green-50 p-4 rounded-lg w-full space-y-2">
                        <Text className="text-green-800 text-sm text-center font-medium">
                            Mã đơn hàng: #{orderId}
                        </Text>
                        {amount && (
                            <Text className="text-green-800 text-sm text-center">
                                Số tiền: {formatCurrency(Number(amount))}
                            </Text>
                        )}
                    </View>
                    <View className="w-full space-y-3">
                        <Button
                            title="Xem đơn hàng của tôi"
                            onPress={onGoToOrders}
                            size="lg"
                            variant="primary"
                        />
                        <Button
                            title="Tiếp tục mua sắm"
                            onPress={onGoHome}
                            size="lg"
                            variant="outline"
                        />
                    </View>
                </>
            );
        }

        return (
            <>
                <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center">
                    <Ionicons name="close-circle" size={48} color="#ef4444" />
                </View>
                <View className="items-center space-y-2">
                    <Text className="text-xl font-semibold text-red-600">
                        Thanh toán thất bại
                    </Text>
                    <Text className="text-neutral-600 text-center">
                        Có lỗi xảy ra trong quá trình thanh toán
                    </Text>
                </View>
                <View className="w-full mt-5 space-y-3">
                    <View className="flex-row items-center justify-between px-4 py-2">
                        <View className="flex-row items-center">
                            <Ionicons name="cube-outline" size={18} color="#9ca3af" />
                            <Text className="text-sm text-gray-600 ml-2">Mã đơn hàng:</Text>
                        </View>
                        <Text className="text-sm font-medium text-neutral-900">
                            #{orderId}
                        </Text>
                    </View>
                    {((amount && Number(amount) > 0) || orderData?.data?.total) && (
                        <View className="flex-row items-center justify-between px-4 py-2">
                            <Text className="text-sm text-gray-600">Số tiền:</Text>
                            <Text className="text-sm font-medium text-green-600">
                                {amount
                                    ? formatCurrency(Number(amount))
                                    : orderData?.data?.total
                                        ? formatCurrency(orderData.data.total)
                                        : ""}
                            </Text>
                        </View>
                    )}
                </View>
                <View className="w-full space-y-3 mt-5">
                    <Button
                        title="Đơn hàng của tôi"
                        onPress={onGoToOrders}
                        size="lg"
                        variant="primary"
                    />
                    <Button
                        title="Trang chủ"
                        onPress={onGoHome}
                        size="lg"
                        variant="outline"
                    />
                </View>
            </>
        );
    }
);

PaymentResultContent.displayName = "PaymentResultContent";

