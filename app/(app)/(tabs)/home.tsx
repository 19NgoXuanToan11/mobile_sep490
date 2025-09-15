import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
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

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get personalized greeting
  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // Modern category icon mapping
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes("rau") || name.includes("vegetable"))
      return "leaf-outline";
    if (name.includes("quả") || name.includes("fruit"))
      return "nutrition-outline";
    if (name.includes("thịt") || name.includes("meat")) return "fish-outline";
    if (name.includes("sữa") || name.includes("milk")) return "wine-outline";
    if (name.includes("gạo") || name.includes("rice")) return "grid-outline";
    return "basket-outline";
  };

  // Localize category names from English to Vietnamese
  const getLocalizedCategoryName = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes("vegetable")) return "Rau củ";
    if (name.includes("fruit")) return "Trái cây";
    if (name.includes("grain") || name.includes("rice")) return "Ngũ cốc";
    if (name.includes("dairy") || name.includes("milk")) return "Sữa";
    if (name.includes("meat") || name.includes("poultry")) return "Thịt";
    return categoryName; // Fallback to original name if no match
  };

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
    queryFn: () => productsApi.getFeatured(4).then((res) => res.data),
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
          {/* Personalized Greeting */}
          <Animated.View
            className="flex-row items-center justify-between"
            style={{ opacity: fadeAnim }}
          >
            <View>
              <Text className="text-sm text-neutral-600">
                {getPersonalizedGreeting()},
              </Text>
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
          </Animated.View>
        </View>
      </View>

      <ScrollView
        className="flex-1 mt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Featured Banners with CTAs */}
        {banners.length > 0 && (
          <View className="px-4 mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {banners.map((banner, index) => (
                <TouchableOpacity key={banner.id} className="mr-4">
                  <Card className="w-80 h-40" padding="none" variant="elevated">
                    <View className="flex-1 rounded-2xl overflow-hidden">
                      <Image
                        source={{ uri: banner.image }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                      <LinearGradient
                        colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)"]}
                        className="absolute inset-0"
                      />

                      {/* Content */}
                      <View className="absolute inset-0 p-4 justify-between">
                        {/* Top: Discount Badge */}
                        {index === 0 && (
                          <View className="self-start">
                            <Badge
                              text="GIẢM 30%"
                              variant="warning"
                              size="sm"
                              className="bg-yellow-500"
                            />
                          </View>
                        )}

                        {/* Bottom: Title & CTA */}
                        <View className="space-y-3">
                          <View>
                            <Text
                              className="text-white text-lg font-bold"
                              numberOfLines={1}
                            >
                              {banner.title}
                            </Text>
                            {banner.subtitle && (
                              <Text
                                className="text-white/90 text-sm"
                                numberOfLines={2}
                              >
                                {banner.subtitle}
                              </Text>
                            )}
                          </View>

                          {/* Enhanced CTA Button */}
                          <TouchableOpacity
                            className="bg-primary-500 px-4 py-2 rounded-xl flex-row items-center self-start space-x-2"
                            onPress={() => router.push("/(app)/(tabs)/catalog")}
                          >
                            <Text className="text-white font-semibold text-sm">
                              {index === 0 ? "Mua ngay" : "Khám phá"}
                            </Text>
                            <Ionicons
                              name="arrow-forward"
                              size={16}
                              color="white"
                            />
                          </TouchableOpacity>
                        </View>
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
          <View className="px-4 mb-5 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-neutral-900 tracking-tight">
              Danh Mục Sản Phẩm
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/(tabs)/catalog")}
              className="bg-primary-50 px-3 py-1.5 rounded-full"
            >
              <Text className="text-primary-700 font-semibold text-sm">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <View className="flex-row space-x-5">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={{
                    id: category.id,
                    name: getLocalizedCategoryName(category.name),
                    image: category.image,
                    icon: getCategoryIcon(category.name),
                  }}
                  size="lg"
                  onPress={() =>
                    router.push(`/(app)/(tabs)/catalog?category=${category.id}`)
                  }
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Products with Filters */}
        <View className="mb-6">
          <View className="px-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-neutral-900">
                Sản Phẩm Nổi Bật Hôm Nay
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(app)/(tabs)/catalog")}
              >
                <Text className="text-primary-600 font-medium">Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {/* Product Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {[
                  { label: "🔥 Bán chạy", value: "bestseller" },
                  { label: "💰 Giá tốt", value: "price" },
                  { label: "🌱 Organic", value: "organic" },
                  { label: "🆕 Mới nhất", value: "newest" },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.value}
                    className="bg-neutral-100 px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-xs font-medium text-neutral-700">
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
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
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/product/[id]",
                      params: { id: product.id },
                    })
                  }
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
                onPress={() => router.push("/(app)/(tabs)/catalog")}
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
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/product/[id]",
                        params: { id: product.id },
                      })
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
