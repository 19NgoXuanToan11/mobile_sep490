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
import { testVnpayIntegration } from "../src/shared/utils/testVnpayIntegration";
import { OpenAPI } from "../src/api";
import env from "../src/config/env";
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

      // Make test utilities available in development
      if (__DEV__) {
        (global as any).testVnpayIntegration = testVnpayIntegration;
        console.log(
          "🧪 VNPay test utilities loaded. Use 'testVnpayIntegration.runAllTests()' in console."
        );
      }
    }
  }, [fontsLoaded]);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log("🔗 Deep link received:", url);

      try {
        // Parse the URL
        const parsed = Linking.parse(url);
        console.log("📋 Parsed deep link:", parsed);

        // Handle payment result deep link
        if (parsed.path === "payment-result") {
          const { success, orderId, amount, code, message } =
            parsed.queryParams || {};
          console.log("💳 Payment result params:", {
            success,
            orderId,
            amount,
            code,
            message,
          });

          if (orderId) {
            // Navigate to payment result screen with parameters
            const params = new URLSearchParams();
            params.append("orderId", orderId as string);
            if (success) params.append("success", success as string);
            if (amount) params.append("amount", amount as string);
            if (code) params.append("code", code as string);
            if (message) params.append("message", message as string);

            const targetUrl = `/(app)/payment-result?${params.toString()}`;
            console.log("🎯 Navigating to:", targetUrl);
            router.replace(targetUrl as any);
          } else {
            console.warn("⚠️ No orderId in deep link parameters");
          }
        } else {
          console.log("ℹ️ Deep link path not handled:", parsed.path);
        }
      } catch (error) {
        console.error("❌ Error handling deep link:", error);
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
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
            <StatusBar style="auto" />
            <ToastProvider />
            <Slot />
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
