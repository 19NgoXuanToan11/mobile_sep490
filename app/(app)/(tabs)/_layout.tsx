import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/shared/lib/theme";
import { useCart } from "../../../src/shared/hooks";
import { View, Text } from "react-native";

// Cart badge component
const CartBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;

  return (
    <View className="absolute -top-2 -right-2 bg-error-500 rounded-full min-w-[20px] h-[20px] items-center justify-center">
      <Text className="text-white text-xs font-bold">
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
};

// Tab bar icon component
interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  count?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, count }) => {
  const { colors } = useTheme();
  const iconName = focused
    ? name
    : (`${name.replace("-", "-outline")}` as keyof typeof Ionicons.glyphMap);

  return (
    <View className="relative">
      <Ionicons
        name={iconName}
        size={28}
        color={focused ? colors.primary : colors.textSecondary}
      />
      {count !== undefined && <CartBadge count={count} />}
    </View>
  );
};

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { cart } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Xóa header để có cảm giác premium
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: "transparent",
          borderTopWidth: 0,
          paddingTop: 16,
          paddingBottom: 20,
          paddingHorizontal: 20,
          height: 80,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 24,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 8,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.05)",
          position: "absolute",
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false, // Ẩn toàn bộ text labels
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="catalog"
        options={{
          title: "Danh mục",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="grid" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Giỏ hàng",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bag" focused={focused} count={cart.itemCount} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="receipt" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
