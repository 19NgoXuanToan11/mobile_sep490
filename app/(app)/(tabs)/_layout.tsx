import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/shared/lib/theme";
import { useLocalization } from "../../../src/shared/hooks";
import { useCart } from "../../../src/shared/hooks";
import { View, Text } from "react-native";

// Cart badge component
const CartBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;

  return (
    <View className="absolute -top-1 -right-1 bg-error-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
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
        size={24}
        color={focused ? colors.primary : colors.textSecondary}
      />
      {count !== undefined && <CartBadge count={count} />}
    </View>
  );
};

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useLocalization();
  const { cart } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("nav.home"),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="catalog"
        options={{
          title: t("nav.catalog"),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="grid" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: t("nav.cart"),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bag" focused={focused} count={cart.itemCount} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: t("nav.orders"),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="receipt" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: t("nav.account"),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
