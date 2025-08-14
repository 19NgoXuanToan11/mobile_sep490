import React, { useState } from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Button, Card, Badge, Input, EmptyState } from "../../../src/shared/ui";
import { productsApi, cartApi } from "../../../src/shared/data/api";
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
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["products", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery) {
        return productsApi.search(debouncedQuery).then((res) => ({
          data: res.data,
          pagination: null,
        }));
      }
      return productsApi.getAll({}, 1, 20).then((res) => res.data);
    },
  });

  const products = data?.data || [];

  const handleAddToCart = async (productId: string, productName: string) => {
    await addItem(productId, 1);
    toast.success(
      "Added to cart",
      `${productName} has been added to your cart`
    );
  };

  const renderProduct = ({ item: product }) => (
    <Card className="mb-4 mx-4" padding="md">
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

          <Text className="text-sm text-neutral-600" numberOfLines={3}>
            {product.shortDescription || product.description}
          </Text>

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
              title="Add to Cart"
              size="sm"
              onPress={() => handleAddToCart(product.id, product.name)}
              disabled={!product.isInStock}
            />
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
        />
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <EmptyState
            icon="basket-outline"
            title={t("emptyState.noProducts")}
            description={t("emptyState.noProductsDescription")}
          />
        }
      />
    </SafeAreaView>
  );
}
