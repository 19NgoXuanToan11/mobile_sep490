import React, { useEffect } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth, usePreferences } from "../src/shared/hooks";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { onboardingCompleted } = usePreferences();

  // Show loading while checking auth
  if (isLoading) {
    return <View className="flex-1 bg-white" />;
  }

  // Redirect based on auth and onboarding status
  if (!onboardingCompleted) {
    return <Redirect href="/(public)/onboarding" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return <Redirect href="/(public)/welcome" />;
}
