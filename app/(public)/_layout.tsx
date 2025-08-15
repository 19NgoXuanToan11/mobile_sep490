import React from "react";
import { Stack } from "expo-router";
import { AuthGuard } from "../../src/features/auth";
import { useTheme } from "../../src/shared/lib/theme";

export default function PublicLayout() {
  const { colors, isDark } = useTheme();

  return (
    <AuthGuard requireAuth={false} redirectTo="/(app)/(tabs)/home">
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{
            title: "Product Details",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            title: "Search Products",
            headerSearchBarOptions: {
              placeholder: "Search products...",
            },
          }}
        />
      </Stack>
    </AuthGuard>
  );
}
