import React, { useCallback } from "react";
import { View, Text, ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../../../src/shared/ui";
import { useAuth, useAuthActions } from "../../../src/shared/hooks";
import {
  ProfileCard,
  AccountSection,
  LogoutButton,
  AccountListItemProps,
} from "../../../src/features/profile/components";

export default function AccountScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = useCallback(async () => {
    await logout();
    // Chuyển về trang chủ sau khi đăng xuất - cho phép tiếp tục mua sắm
    router.replace("/(app)/(tabs)/home");
  }, [logout]);

  const handleEditProfile = useCallback(() => {
    router.push("/profile/edit");
  }, []);

  const handlePersonalInfo = useCallback(() => {
    router.push("/profile/personal-info");
  }, []);

  const handleAddress = useCallback(() => {
    router.push("/(app)/address" as any);
  }, []);

  const handleOrders = useCallback(() => {
    router.push("/(app)/(tabs)/orders");
  }, []);

  // Account menu items
  const accountItems: Omit<AccountListItemProps, "isLast">[] = [
    {
      icon: "person-outline",
      title: "Thông tin cá nhân",
      onPress: handlePersonalInfo,
    },
    {
      icon: "location-outline",
      title: "Địa chỉ của tôi",
      onPress: handleAddress,
    },
    {
      icon: "receipt-outline",
      title: "Lịch sử đơn hàng",
      onPress: handleOrders,
    },
  ];

  // Show login prompt if not authenticated
  // Hiển thị yêu cầu đăng nhập nếu chưa xác thực
  if (!isLoading && !isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={styles.loginPromptContainer}>
          <Card
            padding="xl"
            variant="elevated"
            className="items-center space-y-6"
          >
            <View style={styles.loginIconContainer}>
              <Ionicons
                name="person-outline"
                size={48}
                color="#00623A"
              />
            </View>

            <View className="items-center space-y-2">
              <Text style={styles.loginTitle}>
                Chào mừng đến với IFMS
              </Text>
              <Text style={styles.loginSubtitle}>
                Đăng nhập để truy cập tài khoản, xem đơn hàng và
                quản lý thông tin cá nhân
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
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Card */}
          <ProfileCard
            name={user?.name || "Người dùng"}
            email={user?.email || ""}
            onEditPress={handleEditProfile}
          />

          {/* Account Section */}
          <AccountSection title="Tài khoản" items={accountItems} />

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <LogoutButton onLogout={handleLogout} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 120,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  loginIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: "#E8F5F0",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  loginSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  logoutContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
});
