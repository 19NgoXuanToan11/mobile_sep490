import React from "react";
import { Stack } from "expo-router";
import { AuthGuard } from "../../src/features/auth";

export default function AppLayout() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/(public)/auth/login">
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTintColor: "#111827",
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
