import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Localize category names from English to Vietnamese
  const getLocalizedCategoryName = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes("vegetable")) return "Rau củ";
    if (name.includes("fruit")) return "Trái cây";
    if (name.includes("grain") || name.includes("rice")) return "Ngũ cốc";
    if (name.includes("dairy") || name.includes("milk")) return "Sản phẩm sữa";
    if (name.includes("meat") || name.includes("poultry"))
      return "Thịt & Gia cầm";
    return categoryName; // Fallback to original name if no match
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

  const renderProductGrid = ({ item: product }: { item: any }) => (
    <View className="w-[48%] mb-4">
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
    </View>
  );

  const FilterModal = () => {
    const screenWidth = Dimensions.get("window").width;
    const modalWidth = Math.min(screenWidth - 32, 380);

    return (
      <View className="flex-1 items-center justify-center px-4">
        <View
          style={{
            width: modalWidth,
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.25,
            shadowRadius: 25,
            elevation: 20,
          }}
          className="rounded-3xl overflow-hidden"
        >
          {/* Clean Header */}
          <View className="px-6 pt-8 pb-2">
            <View className="items-center mb-6">
              <Text
                className="text-2xl text-neutral-900 mb-2"
                style={{
                  fontWeight: "600",
                  letterSpacing: -0.5,
                }}
              >
                Sắp xếp
              </Text>
              <View className="w-12 h-1 bg-neutral-200 rounded-full" />
            </View>
          </View>

          {/* Sort Options - Clean List Style */}
          <View className="px-6 pb-6">
            {filterOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => {
                  setSortBy(option.id as any);
                  setShowFilters(false);
                }}
                className="py-4 border-b border-neutral-100"
                style={{
                  borderBottomWidth:
                    index === filterOptions.length - 1 ? 0 : 0.5,
                }}
                activeOpacity={0.6}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-neutral-900 text-lg"
                    style={{
                      fontWeight: sortBy === option.id ? "600" : "400",
                      letterSpacing: -0.3,
                    }}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.id && (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color="#007AFF"
                      style={{ fontWeight: "600" }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Actions */}
          <View className="px-6 pb-8 pt-4 border-t border-neutral-100">
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                className="w-full py-4 rounded-2xl"
                style={{
                  backgroundColor: "#16a34a",
                }}
                activeOpacity={0.8}
              >
                <Text
                  className="text-center text-white text-lg"
                  style={{
                    fontWeight: "600",
                    letterSpacing: -0.3,
                  }}
                >
                  Xong
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSortBy("newest");
                  setSelectedCategory(null);
                  setShowFilters(false);
                }}
                className="w-full py-3"
                activeOpacity={0.6}
              >
                <Text
                  className="text-center text-neutral-600 text-base"
                  style={{
                    fontWeight: "400",
                    letterSpacing: -0.2,
                  }}
                >
                  Đặt lại
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Search & Controls - Edge to Edge */}
      <View className="bg-white shadow-sm border-b border-neutral-100 pt-12">
        <View className="px-4 pb-3">
          <View className="flex-row items-center space-x-3">
            <SearchBar
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmit={handleSearch}
              variant="filled"
              className="flex-1"
            />
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center"
            >
              <Ionicons name="options-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Categories Filter */}
      <View className="bg-white border-b border-neutral-100 py-3">
        <View className="px-4">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: null, name: "Tất cả" }, ...categories]}
            keyExtractor={(item) => item.id || "all"}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                className={`mr-3 px-4 py-2 rounded-full border ${
                  selectedCategory === item.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedCategory === item.id
                      ? "text-primary-700"
                      : "text-neutral-600"
                  }`}
                >
                  {item.id === null
                    ? item.name
                    : getLocalizedCategoryName(item.name)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {/* Products Grid */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-neutral-600">Đang tải sản phẩm...</Text>
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
          />
        )}
      </View>

      {/* Filter Modal - Apple Style */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
        presentationStyle="overFullScreen"
      >
        <View
          className="flex-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => setShowFilters(false)}
            activeOpacity={1}
          />
          <FilterModal />
        </View>
      </Modal>
    </View>
  );
}
