import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Slot, SplashScreen, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import * as Linking from "expo-linking";
import i18n from "../src/shared/lib/i18n";
import { ToastProvider } from "../src/shared/ui/toast";
import { userPreferences } from "../src/shared/lib/storage";
import { OpenAPI } from "../src/api";
import env from "../src/config/env";
import { initializeDeepLinkListener } from "../src/navigation/deeplink";
import "../global.css";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// ✅ Khởi tạo OpenAPI config cho guest users
OpenAPI.BASE = env.API_URL;
OpenAPI.TOKEN = undefined; // Đảm bảo không có token stale

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add any custom fonts here if needed
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Clear any legacy onboarding flags on app start
      userPreferences.clearLegacyOnboardingFlags();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Initialize deep link listener for VNPay & other deep links
  useEffect(() => {
    const cleanup = initializeDeepLinkListener();
    return cleanup;
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <StatusBar style="dark" backgroundColor="transparent" />
            <ToastProvider />
            <Slot />
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
