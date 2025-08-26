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
    if (name.includes("gia vị") || name.includes("spice"))
      return "flower-outline";
    return "basket-outline";
  };

  // Localize category names from English to Vietnamese
  const getLocalizedCategoryName = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes("vegetable")) return "Rau củ";
    if (name.includes("fruit")) return "Trái cây";
    if (name.includes("herb") || name.includes("spice"))
      return "Thảo mộc & Gia vị";
    if (name.includes("grain") || name.includes("rice")) return "Ngũ cốc";
    if (name.includes("dairy") || name.includes("milk")) return "Sản phẩm sữa";
    if (name.includes("meat") || name.includes("poultry"))
      return "Thịt & Gia cầm";
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

  // Enhanced quick actions with modern farming themes
  const quickActions = [
    {
      id: 1,
      title: "⚡ Flash Sale",
      icon: "flash-outline",
      color: "#fee2e2",
      textColor: "#dc2626",
    },
    {
      id: 2,
      title: "🌿 Organic",
      icon: "leaf-outline",
      color: "#dcfce7",
      textColor: "#16a34a",
    },
    {
      id: 3,
      title: "🕐 Tươi hôm nay",
      icon: "time-outline",
      color: "#fef3c7",
      textColor: "#d97706",
    },
    {
      id: 4,
      title: "📍 Trang trại địa phương",
      icon: "location-outline",
      color: "#e0e7ff",
      textColor: "#2563eb",
    },
    {
      id: 5,
      title: "🏆 VietGAP",
      icon: "ribbon-outline",
      color: "#fce7f3",
      textColor: "#c2410c",
    },
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
              <Text className="text-xs text-primary-600 font-medium mt-1">
                🌿 Có {featuredProducts.length} sản phẩm tươi mới cho bạn
              </Text>
            </View>

            <TouchableOpacity
              className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
              onPress={() => router.push("/(app)/(tabs)/account")}
            >
              <Ionicons name="person-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </Animated.View>

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
        {/* Enhanced Quick Actions */}
        <View className="px-4 py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {quickActions.map((action) => (
                <Animated.View
                  key={action.id}
                  style={{ transform: [{ scale: scaleAnim }] }}
                >
                  <TouchableOpacity
                    className="items-center space-y-2"
                    onPress={() => {
                      // Micro-interaction animation
                      Animated.sequence([
                        Animated.timing(scaleAnim, {
                          toValue: 0.95,
                          duration: 100,
                          useNativeDriver: true,
                        }),
                        Animated.timing(scaleAnim, {
                          toValue: 1,
                          duration: 100,
                          useNativeDriver: true,
                        }),
                      ]).start();
                      router.push("/(app)/(tabs)/catalog");
                    }}
                  >
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center shadow-sm"
                      style={{ backgroundColor: action.color }}
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={24}
                        color={action.textColor}
                      />
                    </View>
                    <Text
                      className="text-xs font-medium text-center max-w-[70px]"
                      style={{ color: action.textColor }}
                      numberOfLines={2}
                    >
                      {action.title}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </View>

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
          <View className="px-4 mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              Danh Mục Sản Phẩm
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/(tabs)/catalog")}
            >
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

        {/* Commitment & Values Section */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-neutral-900 mb-4">
            Cam Kết & Giá Trị
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {[
              {
                icon: "checkmark-circle",
                title: "100% Sạch",
                subtitle: "Không chất bảo quản",
                color: "#16a34a",
              },
              {
                icon: "shield-checkmark",
                title: "Nông trại uy tín",
                subtitle: "Chứng nhận VietGAP",
                color: "#2563eb",
              },
              {
                icon: "flash",
                title: "Giao hàng nhanh",
                subtitle: "2-4 giờ trong ngày",
                color: "#dc2626",
              },
              {
                icon: "heart",
                title: "Hỗ trợ 24/7",
                subtitle: "Tư vấn miễn phí",
                color: "#c2410c",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="w-[48%] mb-3"
                padding="md"
                variant="elevated"
              >
                <View className="items-center space-y-2">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.color}
                    />
                  </View>
                  <View className="items-center">
                    <Text className="font-semibold text-neutral-900 text-center text-sm">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-neutral-600 text-center">
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Enhanced CTA Section */}
        <View className="px-4 py-8 mb-6">
          <Card variant="fresh" padding="lg">
            <View className="items-center space-y-4">
              <View className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full items-center justify-center shadow-lg">
                <Ionicons name="leaf" size={36} color="white" />
              </View>
              <View className="items-center space-y-2">
                <Text className="text-2xl font-bold text-neutral-900 text-center">
                  Trang Trại Tươi Mỗi Ngày
                </Text>
                <Text className="text-neutral-600 text-center leading-6 px-4">
                  Khám phá những sản phẩm nông sản tươi ngon được thu hoạch hàng
                  ngày từ các trang trại địa phương uy tín
                </Text>
                <View className="flex-row items-center space-x-4 mt-3">
                  <View className="flex-row items-center space-x-1">
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text className="text-sm font-medium text-neutral-700">
                      4.8/5
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-1">
                    <Ionicons name="people" size={16} color="#6b7280" />
                    <Text className="text-sm font-medium text-neutral-700">
                      10K+ khách hàng
                    </Text>
                  </View>
                </View>
              </View>
              <Button
                title="Khám Phá Ngay"
                variant="primary"
                size="lg"
                onPress={() => router.push("/(app)/(tabs)/catalog")}
                rightIcon={
                  <Ionicons name="arrow-forward" size={18} color="white" />
                }
                className="shadow-lg"
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
