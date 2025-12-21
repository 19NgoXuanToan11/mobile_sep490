import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../src/shared/hooks";
import { profileApi, ProfileData } from "../../../src/shared/data/api";
import {
  ProfileSummaryCard,
  InfoRow,
  QuickActionItem,
} from "../../../src/features/profile/components";

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

const InfoSection = React.memo<InfoSectionProps>(
  ({ title, children, onEdit }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            style={styles.editIconButton}
            activeOpacity={0.6}
          >
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  )
);

InfoSection.displayName = "InfoSection";

export default function PersonalInfoScreen() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const getRoleText = (role?: string) => {
    switch (role) {
      case "CUSTOMER":
      case "Customer":
        return "Khách hàng";
      case "GUEST":
      case "Guest":
        return "Khách";
      default:
        return "N/A";
    }
  };

  const handleEditProfile = useCallback(() => {
    router.push("/profile/edit");
  }, []);

  const handleChangePassword = useCallback(() => {
    router.push("/profile/change-password");
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.6}
          >
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>

          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00A86B" />
            <Text style={styles.loadingText}>
              Đang tải thông tin...
            </Text>
          </View>
        ) : (
          <>
            {/* Profile Summary Card */}
            <ProfileSummaryCard
              fullName={
                profileData?.fullname ||
                user?.name ||
                "Chưa cập nhật"
              }
              email={
                profileData?.email ||
                user?.email ||
                "Chưa cập nhật"
              }
              role={getRoleText(profileData?.role || user?.role)}
              avatarUri={profileData?.images}
            />

            {/* Personal Information Section */}
            <InfoSection
              title="Thông tin cá nhân"
              onEdit={handleEditProfile}
            >
              <InfoRow
                icon="person-outline"
                label="Họ và tên"
                value={
                  profileData?.fullname ||
                  user?.name ||
                  "Chưa cập nhật"
                }
              />

              <InfoRow
                icon="mail-outline"
                label="Email"
                value={
                  profileData?.email ||
                  user?.email ||
                  "Chưa cập nhật"
                }
                subtitle="Email này được sử dụng để đăng nhập"
              />

              <InfoRow
                icon="call-outline"
                label="Số điện thoại"
                value={
                  profileData?.phone ||
                  user?.phone ||
                  "Chưa cập nhật"
                }
              />

              <InfoRow
                icon="location-outline"
                label="Địa chỉ"
                value={profileData?.address || "Chưa cập nhật"}
                isLast
              />
            </InfoSection>

            {/* Quick Actions Section */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.quickActionsTitle}>
                Hành động nhanh
              </Text>

              <View style={styles.quickActionsContent}>
                <QuickActionItem
                  icon="pencil"
                  iconColor="#00A86B"
                  iconBackground="#E8F9F1"
                  title="Chỉnh sửa thông tin"
                  subtitle="Cập nhật thông tin cá nhân"
                  onPress={handleEditProfile}
                />

                <QuickActionItem
                  icon="lock-closed"
                  iconColor="#D97706"
                  iconBackground="#FEF3C7"
                  title="Đổi mật khẩu"
                  subtitle="Thay đổi mật khẩu đăng nhập"
                  onPress={handleChangePassword}
                  isLast
                />
              </View>
            </View>

            {/* Bottom Edit Button */}
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProfile}
                activeOpacity={0.9}
              >
                <Text style={styles.editButtonText}>
                  Chỉnh sửa thông tin
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 16,
    letterSpacing: 0.1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.2,
  },
  editIconButton: {
    padding: 4,
  },
  sectionContent: {
  },
  quickActionsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  quickActionsContent: {
  },
  bottomButtonContainer: {
    marginTop: 32,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: "#00A86B",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#00A86B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
