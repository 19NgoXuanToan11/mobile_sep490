import React from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginForm } from "../../../src/features/auth";
import { useLocalization } from "../../../src/shared/hooks";

export default function LoginScreen() {
  const { t } = useLocalization();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-8">
            <View className="space-y-2 mb-8">
              <Text className="text-3xl font-bold text-neutral-900">
                {t("auth.welcomeBack")}
              </Text>
              <Text className="text-neutral-600">
                {t("auth.loginSubtitle")}
              </Text>
            </View>

            <LoginForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
