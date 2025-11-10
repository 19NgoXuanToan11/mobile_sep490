import React from "react";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
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
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile/personal-info"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="address/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="address/add"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="address/edit/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="payment-result"
        options={{
          title: "Kết Quả Thanh Toán",
          headerBackTitle: "Quay lại",
        }}
      />
      <Stack.Screen
        name="order/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="track/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
