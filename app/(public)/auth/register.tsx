import React from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RegisterForm } from "../../../src/features/auth";
import { useLocalization } from "../../../src/shared/hooks";

export default function RegisterScreen() {
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
                {t("auth.createAccount")}
              </Text>
              <Text className="text-neutral-600">
                {t("auth.registerSubtitle")}
              </Text>
            </View>

            <RegisterForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
