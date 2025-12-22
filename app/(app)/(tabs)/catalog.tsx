import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  Button,
  Card,
  Badge,
  Input,
  EmptyState,
  ProductCard,
  SearchBar,
  CategoryCard,
} from "../../../src/shared/ui";
import {
  productsApi,
  cartApi,
  categoriesApi,
} from "../../../src/shared/data/api";
import {
  useCart,
  useDebounce,
  useLocalization,
} from "../../../src/shared/hooks";
import { formatCurrency } from "../../../src/shared/lib/utils";
import { useToast } from "../../../src/shared/ui/toast";
import { appleDesign } from "../../../src/shared/lib/theme";

export default function CatalogScreen() {
  const { t } = useLocalization();
  const toast = useToast();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "name" | "price_asc" | "price_desc" | "newest"
  >("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(1)).current;
  const filterButtonScale = useRef(new Animated.Value(1)).current;
  const modalSlideAnim = useRef(new Animated.Value(0)).current;

  const getDisplayCategoryName = (categoryName: string): string => {
    if (!categoryName) return "";
    const parts = categoryName.split(" - ");
    const vietnameseName =
      parts.length > 1 ? parts[parts.length - 1].trim() : categoryName.trim();
    return vietnameseName || categoryName;
  };

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll().then((res) => res.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", debouncedQuery, selectedCategory, sortBy],
    queryFn: async () => {
      const filterParams = {
        categories: selectedCategory ? [selectedCategory] : undefined,
        sortBy: sortBy,
      };

      if (debouncedQuery) {
        return productsApi.search(debouncedQuery, 50).then((res) => ({
          data: res.data,
          pagination: null,
        }));
      }
      return productsApi.getAll(filterParams, 1, 50).then((res) => res.data);
    },
  });

  const products = data?.data || [];

  const handleAddToCart = async (productId: string, productName: string) => {
    await addItem(productId, 1);
    toast.success(
      "Đã thêm vào giỏ",
      `${productName} đã được thêm vào giỏ hàng`
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filterOptions = [
    { id: "newest", label: "Mới nhất" },
    { id: "price_asc", label: "Giá thấp đến cao" },
    { id: "price_desc", label: "Giá cao đến thấp" },
    { id: "name", label: "Tên A-Z" },
  ];

  const ShimmerProductCard = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const opacity = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    return (
      <View
        className="w-[48%] mb-4 bg-white p-3"
        style={{
          borderRadius: appleDesign.radius.lg,
          ...appleDesign.shadows.soft,
        }}
      >
        <Animated.View
          className="w-full h-36 mb-3"
          style={{
            backgroundColor: "#F0F0F0",
            borderRadius: appleDesign.radius.md,
            opacity,
          }}
        />

        <Animated.View
          className="h-4 mb-2"
          style={{
            backgroundColor: "#F0F0F0",
            borderRadius: 4,
            width: "80%",
            opacity,
          }}
        />
        <Animated.View
          className="h-4 mb-3"
          style={{
            backgroundColor: "#F0F0F0",
            borderRadius: 4,
            width: "60%",
            opacity,
          }}
        />

        <Animated.View
          className="h-5 mb-3"
          style={{
            backgroundColor: "#E0F2E9",
            borderRadius: 4,
            width: "50%",
            opacity,
          }}
        />

        <Animated.View
          className="h-10"
          style={{
            backgroundColor: "#F0F0F0",
            borderRadius: appleDesign.radius.sm,
            opacity,
          }}
        />
      </View>
    );
  };

  const ProductGridItem = React.memo(({ product, index }: { product: any; index: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          delay: index * 50,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        className="w-[48%] mb-4"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }],
        }}
      >
        <ProductCard
          product={product}
          size="full"
          onPress={() =>
            router.push({
              pathname: "/(app)/product/[id]",
              params: { id: product.id },
            })
          }
          onAddToCart={() => handleAddToCart(product.id, product.name)}
        />
      </Animated.View>
    );
  });

  const CategoryPill = React.memo(({
    item,
    isSelected,
    onPress,
    getDisplayCategoryName,
  }: {
    item: any;
    isSelected: boolean;
    onPress: () => void;
    getDisplayCategoryName: (name: string) => string;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.92,
          useNativeDriver: true,
          speed: 100,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 100,
        }),
      ]).start();
      onPress();
    };

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View
          className="px-5 py-2.5"
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: isSelected ? "#00A86B" : "#E5E7EB",
            backgroundColor: isSelected
              ? "rgba(0, 168, 107, 0.08)"
              : "#FFFFFF",
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text
            style={{
              fontSize: appleDesign.typography.footnote.fontSize,
              fontWeight: isSelected ? "600" : "400",
              color: isSelected ? "#00A86B" : "#6B7280",
              letterSpacing: -0.2,
            }}
          >
            {item.id === null ? item.name : getDisplayCategoryName(item.name)}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  });

  const FilterOption = React.memo(({
    option,
    isSelected,
    onPress
  }: {
    option: { id: string; label: string };
    isSelected: boolean;
    onPress: () => void;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      onPress();
    };

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View
          className="py-4 px-4 flex-row items-center justify-between"
          style={{
            transform: [{ scale: scaleAnim }],
            backgroundColor: isSelected
              ? "rgba(0, 168, 107, 0.08)"
              : "transparent",
            borderRadius: appleDesign.radius.sm,
            marginVertical: 2,
          }}
        >
          <Text
            className="text-neutral-900"
            style={{
              fontSize: appleDesign.typography.body.fontSize,
              fontWeight: isSelected ? "600" : "400",
              letterSpacing: -0.3,
              color: isSelected ? "#00A86B" : "#1D1D1F",
            }}
          >
            {option.label}
          </Text>
          {isSelected && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#00A86B"
            />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  });

  const renderProductGrid = ({ item: product, index }: { item: any; index: number }) => {
    return <ProductGridItem product={product} index={index} />;
  };

  const FilterModal = () => {
    const screenHeight = Dimensions.get("window").height;

    useEffect(() => {
      if (showFilters) {
        Animated.spring(modalSlideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      } else {
        Animated.spring(modalSlideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      }
    }, [showFilters]);

    const translateY = modalSlideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [screenHeight, 0],
    });

    return (
      <Animated.View
        className="absolute bottom-0 left-0 right-0"
        style={{
          transform: [{ translateY }],
        }}
      >
        <View
          className="bg-white overflow-hidden"
          style={{
            borderTopLeftRadius: appleDesign.radius.xl,
            borderTopRightRadius: appleDesign.radius.xl,
            ...appleDesign.shadows.strong,
          }}
        >
          <View className="items-center pt-3 pb-2">
            <View
              className="bg-neutral-300"
              style={{
                width: 40,
                height: 5,
                borderRadius: appleDesign.radius.full,
              }}
            />
          </View>

          <View className="px-6 pt-4 pb-3">
            <Text
              className="text-center text-neutral-900"
              style={{
                fontSize: appleDesign.typography.title3.fontSize,
                fontWeight: "600",
                letterSpacing: -0.5,
              }}
            >
              Sắp xếp
            </Text>
          </View>

          <View className="px-5 py-2">
            {filterOptions.map((option) => (
              <FilterOption
                key={option.id}
                option={option}
                isSelected={sortBy === option.id}
                onPress={() => setSortBy(option.id as any)}
              />
            ))}
          </View>
            
          <View className="px-6 pt-6 pb-8" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#00A86B", "#009E60"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: appleDesign.radius.md,
                  paddingVertical: 16,
                  ...appleDesign.shadows.soft,
                }}
              >
                <Text
                  className="text-center text-white"
                  style={{
                    fontSize: appleDesign.typography.body.fontSize,
                    fontWeight: "600",
                    letterSpacing: -0.3,
                  }}
                >
                  Xong
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSortBy("newest");
                setSelectedCategory(null);
                setShowFilters(false);
              }}
              className="py-3"
              activeOpacity={0.6}
            >
              <Text
                className="text-center"
                style={{
                  fontSize: appleDesign.typography.callout.fontSize,
                  fontWeight: "400",
                  letterSpacing: -0.2,
                  color: appleDesign.colors.text.secondary,
                }}
              >
                Đặt lại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.View
        className="bg-white pt-12 pb-4 px-4"
        style={{
          ...appleDesign.shadows.soft,
        }}
      >
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View
            className="flex-1 flex-row items-center bg-white px-4 py-3"
            style={{
              borderRadius: 18,
              borderWidth: searchFocused ? 1.5 : 0,
              borderColor: searchFocused ? "#00A86B" : "transparent",
              backgroundColor: searchFocused ? "#F8FFF9" : "#F5F5F7",
              ...appleDesign.shadows.soft,
            }}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={searchFocused ? "#00A86B" : "#9CA3AF"}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Tìm kiếm sản phẩm…"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1"
              style={{
                fontSize: appleDesign.typography.callout.fontSize,
                fontWeight: "400",
                color: "#1D1D1F",
                letterSpacing: -0.2,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            onPressIn={() => {
              Animated.spring(filterButtonScale, {
                toValue: 0.9,
                useNativeDriver: true,
                speed: 50,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(filterButtonScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
              }).start();
            }}
            activeOpacity={1}
          >
            <Animated.View
              className="w-12 h-12 items-center justify-center"
              style={{
                borderRadius: appleDesign.radius.full,
                backgroundColor: "rgba(245, 245, 247, 0.9)",
                ...appleDesign.shadows.soft,
                transform: [{ scale: filterButtonScale }],
              }}
            >
              <Ionicons
                name="options-outline"
                size={22}
                color={searchFocused ? "#00A86B" : "#6B7280"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View
        className="bg-white py-4"
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: "rgba(0,0,0,0.05)",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 10,
          }}
          decelerationRate="fast"
        >
          {[{ id: null, name: "Tất cả" }, ...categories].map((item) => (
            <CategoryPill
              key={item.id || "all"}
              item={item}
              isSelected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
              getDisplayCategoryName={getDisplayCategoryName}
            />
          ))}
        </ScrollView>
      </View>

      <View className="flex-1" style={{ backgroundColor: "#F9FAFB" }}>
        {isLoading ? (
          <View className="flex-1 px-4 pt-4">
            <View className="flex-row flex-wrap justify-between">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ShimmerProductCard key={i} />
              ))}
            </View>
          </View>
        ) : products.length === 0 ? (
          <EmptyState
            icon="basket-outline"
            title="Không tìm thấy sản phẩm"
            description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
          />
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductGrid}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{
              paddingVertical: 16,
              paddingHorizontal: 16,
              paddingBottom: 110,
            }}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
          />
        )}
      </View>

      <Modal
        visible={showFilters}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowFilters(false)}
        presentationStyle="overFullScreen"
      >
        <View className="flex-1">   
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => setShowFilters(false)}
            activeOpacity={1}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          />
          <FilterModal />
        </View>
      </Modal>
    </View>
  );
}
