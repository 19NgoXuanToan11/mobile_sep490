import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../../../src/shared/ui";
import { useAuth } from "../../../src/shared/hooks";
import { profileApi, ProfileData } from "../../../src/shared/data/api";

interface InfoItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subtitle?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  label,
  value,
  subtitle,
}) => (
  <View className="flex-row items-start space-x-4 py-4">
    <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center mt-1">
      <Ionicons name={icon} size={20} color="#6b7280" />
    </View>

    <View className="flex-1">
      <Text className="text-sm font-medium text-neutral-600 mb-1">{label}</Text>
      <Text className="text-base text-neutral-900 font-medium">{value}</Text>
      {subtitle && (
        <Text className="text-sm text-neutral-500 mt-1">{subtitle}</Text>
      )}
    </View>
  </View>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

const Section: React.FC<SectionProps> = ({ title, children, onEdit }) => (
  <Card className="mx-4 mt-6" padding="lg" variant="elevated">
    <View className="flex-row items-center justify-between mb-6">
      <Text className="text-lg font-semibold text-neutral-900">{title}</Text>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} className="p-1">
          <Ionicons name="pencil" size={20} color="#059669" />
        </TouchableOpacity>
      )}
    </View>
    {children}
  </Card>
);

export default function PersonalInfoScreen() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  const getGenderText = (gender?: string) => {
    if (!gender) return "Chưa cập nhật";
    switch (gender.toLowerCase()) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      default:
        return "Không xác định";
    }
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <SafeAreaView
        edges={["top"]}
        className="bg-white border-b border-neutral-200"
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-neutral-900">
            Thông tin cá nhân
          </Text>

          <View className="w-8" />
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-neutral-500 mt-4">Đang tải thông tin...</Text>
          </View>
        ) : (
          <>
            {/* Profile Overview */}
            <Card className="mx-4 mt-6" padding="lg" variant="elevated">
              <View className="items-center space-y-4">
                <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center">
                  {profileData?.images ? (
                    <Text className="text-3xl font-bold text-primary-600">
                      {profileData?.fullname?.charAt(0).toUpperCase() || "N"}
                    </Text>
                  ) : (
                    <Text className="text-3xl font-bold text-primary-600">
                      {profileData?.fullname?.charAt(0).toUpperCase() ||
                        user?.name?.charAt(0).toUpperCase() ||
                        "N"}
                    </Text>
                  )}
                </View>

                <View className="items-center space-y-1">
                  <Text className="text-xl font-semibold text-neutral-900">
                    {profileData?.fullname || user?.name || "Chưa cập nhật"}
                  </Text>
                  <Text className="text-neutral-600">
                    {profileData?.email || user?.email || "Chưa cập nhật"}
                  </Text>
                  <View className="bg-primary-50 px-3 py-1 rounded-full mt-2">
                    <Text className="text-primary-600 text-sm font-medium">
                      {getRoleText(profileData?.role || user?.role)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Personal Information */}
            <Section
              title="Thông tin cá nhân"
              onEdit={() => router.push("/profile/edit")}
            >
              <View className="space-y-1">
                <InfoItem
                  icon="person-outline"
                  label="Họ và tên"
                  value={profileData?.fullname || user?.name || "Chưa cập nhật"}
                />

                <InfoItem
                  icon="mail-outline"
                  label="Email"
                  value={profileData?.email || user?.email || "Chưa cập nhật"}
                  subtitle="Email này được sử dụng để đăng nhập"
                />

                <InfoItem
                  icon="call-outline"
                  label="Số điện thoại"
                  value={profileData?.phone || user?.phone || "Chưa cập nhật"}
                  subtitle={
                    profileData?.phone || user?.phone
                      ? "Đã xác thực"
                      : "Chưa thêm số điện thoại"
                  }
                />

                <InfoItem
                  icon="transgender-outline"
                  label="Giới tính"
                  value={getGenderText(profileData?.gender)}
                />

                <InfoItem
                  icon="location-outline"
                  label="Địa chỉ"
                  value={profileData?.address || "Chưa cập nhật"}
                />
              </View>
            </Section>

            {/* Quick Actions */}
            <Card className="mx-4 mt-6" padding="lg" variant="elevated">
              <Text className="text-lg font-semibold text-neutral-900 mb-4">
                Hành động nhanh
              </Text>

              <View className="space-y-3">
                <TouchableOpacity
                  onPress={() => router.push("/profile/edit")}
                  className="flex-row items-center space-x-3 py-3 px-1"
                >
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                    <Ionicons name="pencil" size={20} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-neutral-900">
                      Chỉnh sửa thông tin
                    </Text>
                    <Text className="text-sm text-neutral-500">
                      Cập nhật thông tin cá nhân
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    // Navigate to change password screen
                    // router.push("/(app)/profile/change-password");
                  }}
                  className="flex-row items-center space-x-3 py-3 px-1"
                >
                  <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                    <Ionicons name="lock-closed" size={20} color="#d97706" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-neutral-900">
                      Đổi mật khẩu
                    </Text>
                    <Text className="text-sm text-neutral-500">
                      Thay đổi mật khẩu đăng nhập
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </Card>

            {/* Edit Button */}
            <View className="mx-4 mt-8 mb-8">
              <Button
                title="Chỉnh sửa thông tin"
                onPress={() => router.push("/profile/edit")}
                fullWidth
                size="lg"
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
