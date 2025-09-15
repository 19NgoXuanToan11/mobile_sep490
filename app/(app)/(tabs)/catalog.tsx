import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
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

  const FilterModal = () => (
    <View className="bg-white rounded-t-3xl p-6 space-y-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold text-neutral-900">
          Bộ Lọc & Sắp Xếp
        </Text>
        <TouchableOpacity onPress={() => setShowFilters(false)}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View className="space-y-3">
        <Text className="text-lg font-semibold text-neutral-900">
          Sắp Xếp Theo
        </Text>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => {
              setSortBy(option.id as any);
              setShowFilters(false);
            }}
            className={`flex-row items-center justify-between py-3 px-4 rounded-xl border ${
              sortBy === option.id
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 bg-white"
            }`}
          >
            <Text
              className={`font-medium ${
                sortBy === option.id ? "text-primary-700" : "text-neutral-700"
              }`}
            >
              {option.label}
            </Text>
            {sortBy === option.id && (
              <Ionicons name="checkmark" size={20} color="#00623A" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Reset Filters */}
      <Button
        title="Đặt Lại Bộ Lọc"
        variant="outline"
        onPress={() => {
          setSortBy("newest");
          setSelectedCategory(null);
          setShowFilters(false);
        }}
        fullWidth
      />
    </View>
  );

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

      {/* Filter Modal */}
      {showFilters && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <TouchableOpacity
            className="flex-1"
            onPress={() => setShowFilters(false)}
          />
          <FilterModal />
        </View>
      )}
    </View>
  );
}
