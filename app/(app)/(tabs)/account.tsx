import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, EmptyState } from "../../../src/shared/ui";
import { useAuth, useAuthActions } from "../../../src/shared/hooks";

const SettingItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}> = ({ icon, title, subtitle, onPress, showArrow = true }) => (
  <TouchableOpacity onPress={onPress}>
    <View className="flex-row items-center space-x-4 py-4 px-1">
      <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
        <Ionicons name={icon} size={20} color="#6b7280" />
      </View>

      <View className="flex-1">
        <Text className="font-medium text-neutral-900">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-neutral-500 mt-1">{subtitle}</Text>
        )}
      </View>

      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </View>
  </TouchableOpacity>
);

export default function AccountScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    await logout();
    // Chuyển về trang chủ sau khi đăng xuất - cho phép tiếp tục mua sắm
    router.replace("/(app)/(tabs)/home");
  };

  // Show login prompt if not authenticated
  // Hiển thị yêu cầu đăng nhập nếu chưa xác thực
  if (!isLoading && !isAuthenticated) {
    return (
      <View className="flex-1 bg-neutral-50">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <View className="flex-1 justify-center pt-12 px-4">
          <Card
            padding="xl"
            variant="elevated"
            className="items-center space-y-6"
          >
            <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center">
              <Ionicons name="person-outline" size={48} color="#00623A" />
            </View>

            <View className="items-center space-y-2">
              <Text className="text-2xl font-bold text-neutral-900">
                Chào mừng đến với IFMS
              </Text>
              <Text className="text-center text-neutral-600">
                Đăng nhập để truy cập tài khoản, xem đơn hàng và quản lý thông
                tin cá nhân
              </Text>
            </View>

            <View className="w-full space-y-3">
              <Button
                title="Đăng nhập ngay"
                onPress={() => router.push("/(public)/auth/login")}
                fullWidth
                size="lg"
              />
              <Button
                title="Tạo tài khoản"
                variant="outline"
                onPress={() => router.push("/(public)/auth/register")}
                fullWidth
                size="lg"
              />
            </View>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110, paddingTop: 48 }}
      >
        {/* Profile Section */}
        <Card className="mx-4 mt-4" padding="lg" variant="elevated">
          <View className="items-center space-y-4">
            <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center">
              <Text className="text-3xl font-bold text-primary-600">
                {user?.name?.charAt(0).toUpperCase() || "N"}
              </Text>
            </View>

            <View className="items-center space-y-1">
              <Text className="text-xl font-semibold text-neutral-900">
                {user?.name || "Nguyễn Văn An"}
              </Text>
              <Text className="text-neutral-600">
                {user?.email || "nguyenvanan@example.com"}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-primary-50 px-4 py-2 rounded-lg"
              onPress={() => router.push("/profile/edit")}
            >
              <Text className="text-primary-600 font-medium">
                Chỉnh sửa thông tin
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card className="mx-4 mt-6" padding="lg" variant="elevated">
          <Text className="text-lg font-semibold text-neutral-900 mb-4">
            Tài khoản
          </Text>

          <View className="space-y-1">
            <SettingItem
              icon="person-outline"
              title="Thông tin cá nhân"
              onPress={() => router.push("/profile/personal-info")}
            />

            <SettingItem
              icon="location-outline"
              title="Địa chỉ của tôi"
              onPress={() => router.push("/(app)/address" as any)}
            />

            <SettingItem
              icon="receipt-outline"
              title="Lịch sử đơn hàng"
              onPress={() => router.push("/(app)/(tabs)/orders")}
            />
          </View>
        </Card>

        {/* Logout */}
        <View className="mx-4 mt-8 mb-8">
          <Button
            title="Đăng xuất"
            variant="outline"
            onPress={handleLogout}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </View>
  );
}
