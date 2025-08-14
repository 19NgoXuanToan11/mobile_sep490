import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Button,
  Card,
  Badge,
  QuantityStepper,
  RatingDisplay,
  EmptyState,
} from "../../../src/shared/ui";
import { productsApi, cartApi } from "../../../src/shared/data/api";
import { useCart, useLocalization } from "../../../src/shared/hooks";
import { useToast } from "../../../src/shared/ui/toast";
import {
  formatCurrency,
  formatDate,
  getStockStatus,
} from "../../../src/shared/lib/utils";

const { width: screenWidth } = Dimensions.get("window");

const ImageGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <View className="relative">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideSize = event.nativeEvent.layoutMeasurement.width;
          const currentIndex = event.nativeEvent.contentOffset.x / slideSize;
          setCurrentIndex(Math.round(currentIndex));
        }}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={{ width: screenWidth, height: 300 }}
            contentFit="cover"
          />
        ))}
      </ScrollView>

      {/* Image indicators */}
      {images.length > 1 && (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-2">
          {images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </View>
      )}

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 w-10 h-10 bg-black/20 rounded-full items-center justify-center"
      >
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const ProductInfo: React.FC<{ product: any }> = ({ product }) => {
  const { t } = useLocalization();
  const stockInfo = getStockStatus(product.stock);

  return (
    <View className="space-y-4">
      <View className="space-y-2">
        <Text className="text-2xl font-bold text-neutral-900">
          {product.name}
        </Text>

        <RatingDisplay
          rating={product.rating}
          reviewCount={product.reviewCount}
          size="md"
        />
      </View>

      <View className="flex-row items-center space-x-4">
        <Text className="text-2xl font-bold text-primary-600">
          {formatCurrency(product.price)}
        </Text>
        {product.originalPrice && (
          <Text className="text-lg text-neutral-500 line-through">
            {formatCurrency(product.originalPrice)}
          </Text>
        )}
        <Text className="text-sm text-neutral-600">per {product.unit}</Text>
      </View>

      <View className="flex-row items-center space-x-4">
        <Badge
          text={stockInfo.text}
          variant={
            stockInfo.status === "in_stock"
              ? "success"
              : stockInfo.status === "low_stock"
              ? "warning"
              : "error"
          }
          size="sm"
        />
        <Text className="text-sm text-neutral-600">
          {product.stock} units available
        </Text>
      </View>

      {product.tags.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag} text={tag} variant="outline" size="sm" />
          ))}
        </View>
      )}
    </View>
  );
};

const ProductDetails: React.FC<{ product: any }> = ({ product }) => {
  const { t } = useLocalization();

  return (
    <Card padding="lg">
      <View className="space-y-4">
        <Text className="text-lg font-semibold text-neutral-900">
          {t("product.details")}
        </Text>

        <Text className="text-neutral-700 leading-6">
          {product.description}
        </Text>

        <View className="space-y-3 pt-2 border-t border-neutral-100">
          {product.origin && (
            <View className="flex-row justify-between">
              <Text className="text-neutral-600">{t("product.origin")}</Text>
              <Text className="text-neutral-900 font-medium">
                {product.origin}
              </Text>
            </View>
          )}

          {product.harvestDate && (
            <View className="flex-row justify-between">
              <Text className="text-neutral-600">
                {t("product.harvestDate")}
              </Text>
              <Text className="text-neutral-900 font-medium">
                {formatDate(product.harvestDate)}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between">
            <Text className="text-neutral-600">SKU</Text>
            <Text className="text-neutral-900 font-medium">{product.sku}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLocalization();
  const toast = useToast();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id!).then((res) => res.data),
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addItem(product.id, quantity);
      toast.success(
        t("product.addedToCart"),
        `${quantity}x ${product.name} added to cart`
      );
    } catch (error) {
      toast.error("Error", "Failed to add item to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      await addItem(product.id, quantity);
      router.push("/(app)/cart");
    } catch (error) {
      toast.error("Error", "Failed to add item to cart");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-neutral-600">Loading product...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <EmptyState
          icon="alert-circle-outline"
          title="Product not found"
          description="We couldn't find this product. It may have been removed or is temporarily unavailable."
          actionLabel="Back to Catalog"
          onActionPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Product Images */}
        <ImageGallery images={product.images} />

        <View className="p-4 space-y-6">
          {/* Product Info */}
          <ProductInfo product={product} />

          {/* Quantity Selector */}
          <Card padding="lg">
            <View className="space-y-4">
              <Text className="text-lg font-semibold text-neutral-900">
                {t("product.quantity")}
              </Text>

              <View className="flex-row items-center justify-between">
                <QuantityStepper
                  value={quantity}
                  onValueChange={setQuantity}
                  min={1}
                  max={Math.min(product.stock, 99)}
                  size="md"
                />

                <View className="items-end">
                  <Text className="text-sm text-neutral-600">Total</Text>
                  <Text className="text-xl font-bold text-primary-600">
                    {formatCurrency(product.price * quantity)}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Product Details */}
          <ProductDetails product={product} />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0)",
          "rgba(255,255,255,0.9)",
          "rgba(255,255,255,1)",
        ]}
        className="absolute bottom-0 left-0 right-0 pt-4"
      >
        <View className="p-4 space-y-3">
          {product.isInStock ? (
            <>
              <Button
                title={t("product.buyNow")}
                onPress={handleBuyNow}
                fullWidth
                size="lg"
              />

              <Button
                title={t("product.addToCart")}
                variant="outline"
                onPress={handleAddToCart}
                fullWidth
                size="lg"
              />
            </>
          ) : (
            <Button
              title={t("product.outOfStock")}
              disabled
              fullWidth
              size="lg"
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
