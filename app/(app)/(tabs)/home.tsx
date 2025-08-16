import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Button,
  Card,
  Badge,
  Skeleton,
  ProductCard,
  CategoryCard,
  SearchBar,
} from "../../../src/shared/ui";
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
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: banners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannersApi.getActive().then((res) => res.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll().then((res) => res.data.slice(0, 8)),
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getFeatured(6).then((res) => res.data),
  });

  const { data: trendingProducts = [] } = useQuery({
    queryKey: ["trending-products"],
    queryFn: () => productsApi.getTrending(4).then((res) => res.data || []),
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/(public)/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSearchFocus = () => {
    router.push("/(public)/search");
  };

  // Mock data for demo
  const quickActions = [
    { id: 1, title: "Flash Sale", icon: "flash-outline", color: "#fee2e2" },
    { id: 2, title: "Organic", icon: "leaf-outline", color: "#dcfce7" },
    { id: 3, title: "Fresh Today", icon: "time-outline", color: "#fef3c7" },
    { id: 4, title: "Local Farm", icon: "location-outline", color: "#e0e7ff" },
  ];

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header with Search - Edge to Edge */}
      <View className="bg-white shadow-sm border-b border-neutral-100 pt-12">
        <View className="px-4 pb-3 space-y-4">
          {/* Greeting */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-neutral-600">Chào buổi sáng,</Text>
              <Text className="text-xl font-bold text-neutral-900">
                {user?.name || "Khách hàng"}
              </Text>
            </View>

            <TouchableOpacity
              className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
              onPress={() => router.push("/(app)/(tabs)/account")}
            >
              <Ionicons name="person-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Search Bar - Sticky */}
          <SearchBar
            placeholder="Tìm kiếm sản phẩm nông sản..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearch}
            onFocus={handleSearchFocus}
            showFilter={true}
            onFilterPress={() => router.push("/(public)/search")}
            variant="filled"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Quick Actions */}
        <View className="px-4 py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  className="items-center space-y-2"
                  onPress={() => router.push("/(public)/catalog")}
                >
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: action.color }}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={24}
                      color="#00623A"
                    />
                  </View>
                  <Text className="text-xs font-medium text-neutral-700 text-center">
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Banner */}
        {banners.length > 0 && (
          <View className="px-4 mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {banners.map((banner) => (
                <TouchableOpacity key={banner.id} className="mr-4">
                  <Card className="w-80 h-32" padding="none" variant="elevated">
                    <View className="flex-1 rounded-2xl overflow-hidden">
                      <Image
                        source={{ uri: banner.image }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                      <LinearGradient
                        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]}
                        className="absolute inset-0"
                      />
                      <View className="absolute bottom-4 left-4 right-4">
                        <Text
                          className="text-white text-lg font-bold"
                          numberOfLines={1}
                        >
                          {banner.title}
                        </Text>
                        {banner.subtitle && (
                          <Text
                            className="text-white/80 text-sm"
                            numberOfLines={1}
                          >
                            {banner.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View className="mb-6">
          <View className="px-4 mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              Danh Mục Sản Phẩm
            </Text>
            <TouchableOpacity onPress={() => router.push("/(public)/catalog")}>
              <Text className="text-primary-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
          >
            <View className="flex-row space-x-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={{
                    id: category.id,
                    name: category.name,
                    image: category.image,
                    icon: "leaf-outline",
                  }}
                  size="lg"
                  onPress={() =>
                    router.push(`/(public)/catalog?category=${category.id}`)
                  }
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View className="mb-6">
          <View className="px-4 mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              Sản Phẩm Nổi Bật Hôm Nay
            </Text>
            <TouchableOpacity onPress={() => router.push("/(public)/catalog")}>
              <Text className="text-primary-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
          >
            <View className="flex-row space-x-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  size="md"
                  onPress={() => router.push(`/(public)/product/${product.id}`)}
                  showQuickView={true}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Trending Products Grid */}
        {trendingProducts.length > 0 && (
          <View className="px-4 mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-neutral-900">
                Xu Hướng Mua Sắm
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(public)/catalog")}
              >
                <Text className="text-primary-600 font-medium">Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {trendingProducts.map((product) => (
                <View key={product.id} className="w-[48%] mb-4">
                  <ProductCard
                    product={product}
                    size="full"
                    layout="vertical"
                    onPress={() =>
                      router.push(`/(public)/product/${product.id}`)
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CTA Section */}
        <View className="px-4 py-8 mb-8">
          <Card variant="fresh" padding="lg">
            <View className="items-center space-y-4">
              <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center">
                <Ionicons name="leaf" size={32} color="white" />
              </View>
              <View className="items-center space-y-2">
                <Text className="text-xl font-bold text-neutral-900 text-center">
                  Trang Trại Tươi Mỗi Ngày
                </Text>
                <Text className="text-neutral-600 text-center leading-6">
                  Khám phá những sản phẩm nông sản tươi ngon được thu hoạch hàng
                  ngày từ các trang trại địa phương
                </Text>
              </View>
              <Button
                title="Khám Phá Ngay"
                variant="primary"
                size="lg"
                onPress={() => router.push("/(public)/catalog")}
                rightIcon={
                  <Ionicons name="arrow-forward" size={18} color="white" />
                }
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
