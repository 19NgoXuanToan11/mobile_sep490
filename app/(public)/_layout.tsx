import React from "react";
import { Stack } from "expo-router";
import { AuthGuard } from "../../src/features/auth";

export default function PublicLayout() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/(app)/(tabs)/home">
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
          headerBackTitle: "Quay lại",
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
          name="search"
          options={{
            title: "Tìm kiếm sản phẩm",
            headerSearchBarOptions: {
              placeholder: "Tìm kiếm sản phẩm...",
            },
          }}
        />
      </Stack>
    </AuthGuard>
  );
}
