import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Button, Card, Badge, Input, EmptyState } from "../../src/shared/ui";
import { productsApi, categoriesApi, cartApi } from "../../src/shared/data/api";
import { useCart, useDebounce, useLocalization } from "../../src/shared/hooks";
import { useToast } from "../../src/shared/ui/toast";
import { formatCurrency } from "../../src/shared/lib/utils";
import { Product, Category } from "../../src/types";

const CategoryFilter: React.FC<{
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}> = ({ categories, selectedCategory, onSelectCategory }) => (
  <View className="px-4 mb-4">
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={[
        { id: "all", name: "Tất cả danh mục", slug: "all" },
        ...categories,
      ]}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onSelectCategory(item.id)}
          className={`mr-3 px-4 py-2 rounded-full border ${
            selectedCategory === item.id
              ? "bg-primary-500 border-primary-500"
              : "bg-white border-neutral-300"
          }`}
        >
          <Text
            className={`font-medium ${
              selectedCategory === item.id ? "text-white" : "text-neutral-700"
            }`}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ paddingHorizontal: 0 }}
    />
  </View>
);

const ProductCard: React.FC<{
  product: Product;
  onAddToCart: (productId: string, productName: string) => void;
}> = ({ product, onAddToCart }) => (
  <Card className="mx-4 mb-4" padding="md">
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(app)/product/[id]",
          params: { id: product.id },
        })
      }
    >
      <View className="flex-row space-x-4">
        <View className="relative">
          <Image
            source={{ uri: product.images[0] }}
            style={{ width: 80, height: 80 }}
            className="rounded-md"
          />
          {product.originalPrice && (
            <Badge
              text="-25%"
              variant="error"
              size="sm"
              className="absolute -top-1 -right-1"
            />
          )}
        </View>

        <View className="flex-1 space-y-2">
          <Text className="font-semibold text-neutral-900" numberOfLines={2}>
            {product.name}
          </Text>

          <Text className="text-sm text-neutral-600" numberOfLines={2}>
            {product.shortDescription || product.description}
          </Text>

          <View className="flex-row items-center space-x-2">
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text className="text-sm text-neutral-600">
              {product.rating} ({product.reviewCount})
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="space-y-1">
              <Text className="text-lg font-bold text-primary-600">
                {formatCurrency(product.price)}
              </Text>
              {product.originalPrice && (
                <Text className="text-sm text-neutral-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </Text>
              )}
            </View>

            <Button
              title="Thêm vào giỏ"
              size="sm"
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart(product.id, product.name);
              }}
              disabled={!product.isInStock}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  </Card>
);

export default function SearchScreen() {
  const { t } = useLocalization();
  const toast = useToast();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll().then((res) => res.data),
  });

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["search", debouncedQuery, selectedCategory],
    queryFn: async () => {
      try {
        if (debouncedQuery && debouncedQuery.trim()) {
          // Search by query
          const response = await productsApi.search(debouncedQuery.trim());
          let results = response.data || [];

          // Filter by category if selected
          if (selectedCategory !== "all") {
            results = results.filter(
              (product) => product.categoryId === selectedCategory
            );
          }

          return results;
        } else if (selectedCategory !== "all") {
          // Filter by category only
          const response = await productsApi.getAll({
            categories: [selectedCategory],
          });
          return response.data?.data || [];
        } else {
          // Show limited products when no search query
          const response = await productsApi.getAll({}, 1, 20);
          return response.data?.data || [];
        }
      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    },
    enabled: true, // Always enable to allow category filtering
  });

  const handleAddToCart = async (productId: string, productName: string) => {
    await addItem(productId, 1);
    toast.success(
      "Đã thêm vào giỏ",
      `${productName} đã được thêm vào giỏ hàng của bạn`
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return null; // Don't show empty state while loading
    }

    if (debouncedQuery && debouncedQuery.trim()) {
      return (
        <EmptyState
          icon="search-outline"
          title="Không tìm thấy sản phẩm"
          description={`Không tìm thấy sản phẩm nào cho "${debouncedQuery}". Thử tìm kiếm với từ khóa khác.`}
          actionLabel="Xóa tìm kiếm"
          onActionPress={() => setSearchQuery("")}
        />
      );
    }

    if (selectedCategory !== "all") {
      return (
        <EmptyState
          icon="basket-outline"
          title="Không có sản phẩm"
          description="Danh mục này hiện chưa có sản phẩm nào."
          actionLabel="Xem tất cả"
          onActionPress={() => setSelectedCategory("all")}
        />
      );
    }

    return (
      <EmptyState
        icon="basket-outline"
        title="Không có sản phẩm"
        description="Hãy thử tìm kiếm sản phẩm hoặc chọn danh mục."
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="px-4 py-4 border-b border-neutral-100">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          rightIcon={searchQuery ? "close-circle" : undefined}
          onRightIconPress={searchQuery ? () => setSearchQuery("") : undefined}
        />
      </View>

      {/* Category Filter */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Search Results */}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onAddToCart={handleAddToCart} />
        )}
        numColumns={2}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListEmptyComponent={renderEmptyState()}
        onRefresh={() => {
          // Trigger refetch
        }}
        refreshing={isLoading}
      />

      {/* Search Results Count */}
      {searchResults.length > 0 && !isLoading && (
        <View className="px-4 py-2 border-t border-neutral-100 bg-neutral-50">
          <Text className="text-sm text-neutral-600 text-center">
            Tìm thấy {searchResults.length} sản phẩm
            {debouncedQuery &&
              debouncedQuery.trim() &&
              ` cho "${debouncedQuery}"`}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
