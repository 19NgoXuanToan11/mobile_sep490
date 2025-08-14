import React from "react";
import { Stack } from "expo-router";
import { AuthGuard } from "../../src/features/auth";
import { useTheme } from "../../src/shared/lib/theme";

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <AuthGuard requireAuth={true} redirectTo="/(public)/welcome">
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
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            title: "Checkout",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="track/[orderId]"
          options={{
            title: "Track Order",
            headerBackTitle: "Orders",
          }}
        />
      </Stack>
    </AuthGuard>
  );
}
