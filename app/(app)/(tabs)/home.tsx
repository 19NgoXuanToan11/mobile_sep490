import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Button, Card, Badge, Skeleton } from "../../../src/shared/ui";
import {
  bannersApi,
  categoriesApi,
  productsApi,
} from "../../../src/shared/data/api";
import { useAuth, useLocalization } from "../../../src/shared/hooks";
import { formatCurrency } from "../../../src/shared/lib/utils";

export default function HomeScreen() {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: banners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannersApi.getActive().then((res) => res.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll().then((res) => res.data.slice(0, 6)),
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getFeatured(6).then((res) => res.data),
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 py-4 space-y-1">
          <Text className="text-sm text-neutral-600">Good morning,</Text>
          <Text className="text-xl font-bold text-neutral-900">
            {user?.name || "Welcome"}
          </Text>
        </View>

        {/* Banners */}
        {banners.length > 0 && (
          <ScrollView horizontal className="px-4 mb-6">
            {banners.map((banner) => (
              <Card key={banner.id} className="w-80 h-40 mr-4" padding="none">
                <Image
                  source={{ uri: banner.image }}
                  style={{ width: "100%", height: "100%" }}
                  className="rounded-lg"
                />
                <View className="absolute inset-0 bg-black/20 rounded-lg items-end justify-end p-4">
                  <Text className="text-white text-lg font-bold">
                    {banner.title}
                  </Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        )}

        {/* Categories */}
        <View className="space-y-4 mb-6">
          <View className="px-4">
            <Text className="text-lg font-semibold text-neutral-900">
              {t("categories.title", "Categories")}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="mr-6 items-center space-y-2"
                onPress={() => router.push("/catalog")}
              >
                <View className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100">
                  <Image
                    source={{ uri: category.image }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
                <Text className="text-xs text-neutral-600 text-center">
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View className="space-y-4 px-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-neutral-900">
              Featured Products
            </Text>
            <Button
              title="View All"
              variant="ghost"
              size="sm"
              onPress={() => router.push("/catalog")}
            />
          </View>

          <View className="flex-row flex-wrap justify-between">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="w-[48%] mb-4"
                padding="sm"
                onPress={() => router.push(`/(public)/product/${product.id}`)}
              >
                <View className="space-y-3">
                  <View className="relative">
                    <Image
                      source={{ uri: product.images[0] }}
                      style={{ width: "100%", height: 100 }}
                      className="rounded-md"
                    />
                    {product.originalPrice && (
                      <Badge
                        text="-25%"
                        variant="error"
                        size="sm"
                        className="absolute top-1 left-1"
                      />
                    )}
                  </View>

                  <View className="space-y-1">
                    <Text
                      className="font-medium text-neutral-900"
                      numberOfLines={2}
                    >
                      {product.name}
                    </Text>
                    <Text className="text-lg font-bold text-primary-600">
                      {formatCurrency(product.price)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
