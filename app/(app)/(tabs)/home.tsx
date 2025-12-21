import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ProductCard,
  ProductCardSkeleton,
} from "../../../src/shared/ui";
import {
  bannersApi,
  productsApi,
  profileApi,
} from "../../../src/shared/data/api";
import { useAuth, useCart } from "../../../src/shared/hooks";
import { useToast } from "../../../src/shared/ui/toast";
import { appleDesign } from "../../../src/shared/lib/theme";

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const { addItem } = useCart();
  const [refreshing, setRefreshing] = React.useState(false);
  const [avatarUri, setAvatarUri] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data?.images) {
        setAvatarUri(response.data.images);
      }
    } catch (error) {
    }
  };

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannersApi.getActive().then((res) => res.data),
  });

  const { data: featuredProducts = [], isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getFeatured(6).then((res) => res.data),
  });

  const { data: trendingProducts = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-products"],
    queryFn: () => productsApi.getFeatured(4).then((res) => res.data),
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAddToCart = async (productId: string, productName: string) => {
    await addItem(productId, 1);
    toast.success(
      "Đã thêm vào giỏ",
      `${productName} đã được thêm vào giỏ hàng`
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: appleDesign.colors.background.secondary }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.View
        style={{
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <LinearGradient
          colors={appleDesign.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <SafeAreaView edges={["top"]}>
            <View style={{ paddingTop: appleDesign.spacing.lg, paddingBottom: appleDesign.spacing.md }}>
              <Animated.View
                className="px-5 flex-row items-center justify-between"
                style={{ opacity: fadeAnim }}
              >
                <View className="flex-1">
                  <Text
                    className="tracking-tight"
                    style={{
                      color: appleDesign.colors.text.secondary,
                      fontSize: appleDesign.typography.footnote.fontSize,
                      fontWeight: "400",
                      marginBottom: 4,
                    }}
                  >
                    {getPersonalizedGreeting()} 🌿
                  </Text>
                  <Text
                    className="font-semibold"
                    style={{
                      color: appleDesign.colors.text.primary,
                      fontSize: appleDesign.typography.title2.fontSize,
                      lineHeight: appleDesign.typography.title2.lineHeight,
                    }}
                  >
                    {user?.name || "Khách hàng"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.push("/(app)/(tabs)/account")}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    ...appleDesign.shadows.soft,
                  }}
                >
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                      }}
                      contentFit="cover"
                    />
                  ) : (
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={appleDesign.colors.text.secondary}
                    />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {banners.length > 0 && (
          <View style={{ marginBottom: appleDesign.spacing.lg, marginTop: appleDesign.spacing.md }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-5"
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {banners.map((banner, index) => (
                <TouchableOpacity
                  key={banner.id}
                  style={{ marginRight: appleDesign.spacing.md }}
                >
                  <View
                    className="w-80 h-44 overflow-hidden"
                    style={{
                      borderRadius: appleDesign.radius.lg,
                      ...appleDesign.shadows.medium,
                    }}
                  >
                    <Image
                      source={{ uri: banner.image }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={appleDesign.gradients.overlay}
                      className="absolute inset-0"
                    />

                    <View className="absolute inset-0 p-5 justify-between">
                      {index === 0 && (
                        <View className="self-start">
                          <View
                            className="px-3 py-1.5"
                            style={{
                              backgroundColor: "#FCD34D",
                              borderRadius: appleDesign.radius.xs,
                            }}
                          >
                            <Text
                              className="font-bold"
                              style={{
                                color: "#78350F",
                                fontSize: appleDesign.typography.caption1.fontSize,
                              }}
                            >
                              GIẢM 30%
                            </Text>
                          </View>
                        </View>
                      )}

                      <View className="space-y-3">
                        <View>
                          <Text
                            className="text-white font-bold mb-1"
                            style={{ fontSize: appleDesign.typography.title3.fontSize }}
                            numberOfLines={1}
                          >
                            {banner.title}
                          </Text>
                          {banner.subtitle && (
                            <Text
                              className="text-white/90"
                              style={{ fontSize: appleDesign.typography.subheadline.fontSize }}
                              numberOfLines={2}
                            >
                              {banner.subtitle}
                            </Text>
                          )}
                        </View>

                        <TouchableOpacity
                          onPress={() => router.push("/(app)/(tabs)/catalog")}
                          style={{
                            backgroundColor: "rgba(255,255,255,0.92)",
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderRadius: appleDesign.radius.full,
                            flexDirection: "row",
                            alignItems: "center",
                            alignSelf: "flex-start",
                            gap: 6,
                          }}
                        >
                          <Text
                            className="font-semibold"
                            style={{
                              color: appleDesign.colors.green.dark,
                              fontSize: appleDesign.typography.subheadline.fontSize,
                            }}
                          >
                            {index === 0 ? "Mua ngay" : "Khám phá"}
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color={appleDesign.colors.green.dark}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ marginTop: appleDesign.spacing.md, marginBottom: appleDesign.spacing.xl }}>
          <View className="px-5 mb-4 flex-row items-center justify-between">
            <Text
              className="font-semibold"
              style={{
                color: appleDesign.colors.text.primary,
                fontSize: appleDesign.typography.headline.fontSize,
              }}
            >
              Sản Phẩm Nổi Bật
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/(tabs)/catalog")}
              className="flex-row items-center gap-1"
            >
              <Text
                className="font-medium"
                style={{
                  color: appleDesign.colors.green.primary,
                  fontSize: appleDesign.typography.subheadline.fontSize,
                }}
              >
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <View className="flex-row gap-4">
              {featuredLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <View key={i} style={{ width: 192 }}>
                    <ProductCardSkeleton />
                  </View>
                ))
                : featuredProducts.map((product) => (
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
                    onAddToCart={() => handleAddToCart(product.id, product.name)}
                    showQuickView={true}
                  />
                ))}
            </View>
          </ScrollView>
        </View>

        {trendingProducts.length > 0 && (
          <View className="px-5" style={{ marginBottom: appleDesign.spacing.xl }}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text
                className="font-semibold"
                style={{
                  color: appleDesign.colors.text.primary,
                  fontSize: appleDesign.typography.headline.fontSize,
                }}
              >
                Xu Hướng Mua Sắm
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(app)/(tabs)/catalog")}
                className="flex-row items-center gap-1"
              >
                <Text
                  className="font-medium"
                  style={{
                    color: appleDesign.colors.green.primary,
                    fontSize: appleDesign.typography.subheadline.fontSize,
                  }}
                >
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {trendingLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} className="w-[48%] mb-4">
                    <ProductCardSkeleton />
                  </View>
                ))
                : trendingProducts.map((product) => (
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
                      onAddToCart={() =>
                        handleAddToCart(product.id, product.name)
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
