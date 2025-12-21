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
import { orderNotificationService } from "../src/services/realtime/orderNotificationService";
import "../global.css";

SplashScreen.preventAutoHideAsync();

OpenAPI.BASE = env.API_URL;
OpenAPI.TOKEN = undefined;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
  });

  useEffect(() => {
    if (fontsLoaded) {
      userPreferences.clearLegacyOnboardingFlags();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const cleanup = initializeDeepLinkListener();
    return cleanup;
  }, []);

  useEffect(() => {
    return () => {
      orderNotificationService.dispose();
    };
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
