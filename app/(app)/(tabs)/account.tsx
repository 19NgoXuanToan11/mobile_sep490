import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card } from "../../../src/shared/ui";
import {
  useAuth,
  useLocalization,
  usePreferences,
} from "../../../src/shared/hooks";
import { useThemeStore } from "../../../src/shared/lib/theme";
import { changeLanguage } from "../../../src/shared/lib/i18n";

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
  const { t, language, changeLanguage: updateLanguage } = useLocalization();
  const { user, logout } = useAuth();
  const { colorScheme, setColorScheme } = useThemeStore();

  const handleLanguageChange = async () => {
    const newLanguage = language === "en" ? "vi" : "en";
    await updateLanguage(newLanguage);
  };

  const handleThemeChange = () => {
    const themes = ["system", "light", "dark"] as const;
    const currentIndex = themes.indexOf(colorScheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setColorScheme(nextTheme);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(public)/welcome");
  };

  const getThemeLabel = () => {
    switch (colorScheme) {
      case "light":
        return t("theme.light");
      case "dark":
        return t("theme.dark");
      case "system":
        return t("theme.system");
      default:
        return t("theme.system");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Profile Section */}
        <Card className="mx-4 mt-4" padding="lg">
          <View className="items-center space-y-4">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center">
              <Text className="text-2xl font-bold text-primary-600">
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-xl font-semibold text-neutral-900">
                {user?.name}
              </Text>
              <Text className="text-neutral-600">{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <Card className="mx-4 mt-6" padding="lg">
          <Text className="text-lg font-semibold text-neutral-900 mb-4">
            {t("account.settings")}
          </Text>

          <View className="space-y-1">
            <SettingItem
              icon="person-outline"
              title={t("account.profile")}
              onPress={() => {}}
            />

            <SettingItem
              icon="location-outline"
              title={t("account.addresses")}
              onPress={() => {}}
            />

            <SettingItem
              icon="language-outline"
              title={t("account.language")}
              subtitle={
                language === "en"
                  ? t("language.english")
                  : t("language.vietnamese")
              }
              onPress={handleLanguageChange}
            />

            <SettingItem
              icon="color-palette-outline"
              title={t("account.theme")}
              subtitle={getThemeLabel()}
              onPress={handleThemeChange}
            />

            <SettingItem
              icon="notifications-outline"
              title={t("account.notifications")}
              onPress={() => {}}
            />
          </View>
        </Card>

        {/* Support */}
        <Card className="mx-4 mt-6" padding="lg">
          <Text className="text-lg font-semibold text-neutral-900 mb-4">
            Support
          </Text>

          <View className="space-y-1">
            <SettingItem
              icon="help-circle-outline"
              title={t("account.help")}
              onPress={() => {}}
            />

            <SettingItem
              icon="information-circle-outline"
              title={t("account.about")}
              subtitle={`${t("account.version")} 1.0.0`}
              onPress={() => {}}
            />
          </View>
        </Card>

        {/* Logout */}
        <View className="mx-4 mt-8 mb-8">
          <Button
            title={t("account.signOut")}
            variant="outline"
            onPress={handleLogout}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
