import React from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Badge, Skeleton, EmptyState } from "../../src/shared/ui";
import {
  bannersApi,
  categoriesApi,
  productsApi,
} from "../../src/shared/data/api";
import { useLocalization } from "../../src/shared/hooks";
import { formatCurrency } from "../../src/shared/lib/utils";

const BannerSection: React.FC = () => {
  const {
    data: banners = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["welcome-banners"],
    queryFn: () => bannersApi.getActive().then((res) => res.data),
  });

  if (isLoading) {
    return <Skeleton height={200} className="mx-4 rounded-lg" />;
  }

  if (banners.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4"
    >
      {banners.map((banner) => (
        <Card
          key={banner.id}
          className="w-80 h-48 mr-4 overflow-hidden"
          padding="none"
        >
          <Image
            source={{ uri: banner.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-black/30 items-end justify-end p-4">
            <View className="space-y-2">
              <Text className="text-white text-xl font-bold">
                {banner.title}
              </Text>
              {banner.subtitle && (
                <Text className="text-white/90 text-sm">{banner.subtitle}</Text>
              )}
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const CategoriesSection: React.FC = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <View className="px-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} className="mr-4 items-center space-y-2">
              <Skeleton width={80} height={80} variant="circular" />
              <Skeleton width={60} height={16} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4"
    >
      {categories.slice(0, 6).map((category) => (
        <View key={category.id} className="mr-6 items-center space-y-2">
          <View className="w-20 h-20 rounded-full overflow-hidden bg-neutral-100">
            <Image
              source={{ uri: category.image }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <Text className="text-sm font-medium text-neutral-700 text-center">
            {category.name}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const FeaturedProductsSection: React.FC = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getFeatured(4).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <View className="px-4">
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} className="w-[48%] mb-4">
              <Skeleton height={140} className="rounded-lg" />
              <View className="space-y-2 mt-2">
                <Skeleton height={16} width="80%" />
                <Skeleton height={12} width="60%" />
                <Skeleton height={20} width="40%" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="px-4">
      <View className="flex-row flex-wrap justify-between">
        {products.map((product) => (
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
                  style={{ width: "100%", height: 120 }}
                  className="rounded-md"
                  contentFit="cover"
                />
                {product.originalPrice && (
                  <Badge
                    text="-25%"
                    variant="error"
                    size="sm"
                    className="absolute top-2 left-2"
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

                <View className="flex-row items-center space-x-2">
                  <Text className="text-lg font-bold text-primary-600">
                    {formatCurrency(product.price)}
                  </Text>
                  {product.originalPrice && (
                    <Text className="text-sm text-neutral-500 line-through">
                      {formatCurrency(product.originalPrice)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
};

export default function WelcomeScreen() {
  const { t } = useLocalization();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 py-6 space-y-2">
          <Text className="text-2xl font-bold text-neutral-900">
            Welcome to IFMS
          </Text>
          <Text className="text-neutral-600">
            Discover fresh farm products delivered to your doorstep
          </Text>
        </View>

        {/* Banners */}
        <View className="space-y-4 mb-8">
          <BannerSection />
        </View>

        {/* Categories */}
        <View className="space-y-4 mb-8">
          <View className="px-4">
            <Text className="text-lg font-semibold text-neutral-900">
              Categories
            </Text>
          </View>
          <CategoriesSection />
        </View>

        {/* Featured Products */}
        <View className="space-y-4 mb-8">
          <View className="px-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-neutral-900">
              Featured Products
            </Text>
            <Button
              title="View All"
              variant="ghost"
              size="sm"
              onPress={() => router.push("/(public)/search")}
            />
          </View>
          <FeaturedProductsSection />
        </View>

        {/* Call-to-Action */}
        <View className="px-4 py-8 space-y-4">
          <Text className="text-center text-neutral-600 mb-4">
            Ready to start your healthy journey?
          </Text>

          <Button
            title={t("auth.signUp")}
            onPress={() => router.push("/(public)/auth/register")}
            fullWidth
            size="lg"
          />

          <Button
            title={t("auth.signIn")}
            variant="outline"
            onPress={() => router.push("/(public)/auth/login")}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
