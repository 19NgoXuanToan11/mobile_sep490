import React, { useCallback, useState, useEffect } from "react";
import { View, ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useAuth, useAuthActions } from "../../../src/shared/hooks";
import { profileApi } from "../../../src/shared/data/api";
import {
  ProfileCard,
  AccountSection,
  LogoutButton,
  AccountListItemProps,
  WelcomeProfileCard,
  WelcomeButtons,
} from "../../../src/features/profile/components";

export default function AccountScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthActions();
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadProfile();
      }
    }, [isAuthenticated])
  );

  const loadProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data?.images) {
        setAvatarUri(response.data.images);
      }
    } catch (error) {
    }
  };

  const handleLogout = useCallback(async () => {
    await logout();
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
  
  if (!isLoading && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

        <View style={styles.welcomeContainer}>
          <WelcomeProfileCard />

          <View style={styles.buttonContainer}>
            <WelcomeButtons
              onLoginPress={() => router.push("/(public)/auth/login")}
              onRegisterPress={() => router.push("/(public)/auth/register")}
            />
          </View>
        </View>
      </SafeAreaView>
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
          <ProfileCard
            name={user?.name || "Người dùng"}
            email={user?.email || ""}
            avatarUri={avatarUri}
            onEditPress={handleEditProfile}
          />

          <AccountSection title="Tài khoản" items={accountItems} />

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
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 80,
  },
  buttonContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  logoutContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
});
