import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
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
import { productsApi } from "../../../src/shared/data/api";
import { useCart, useLocalization } from "../../../src/shared/hooks";
import { useToast } from "../../../src/shared/ui/toast";
import {
  formatCurrency,
  formatDate,
  getStockStatus,
} from "../../../src/shared/lib/utils";

const { width: screenWidth } = Dimensions.get("window");

const ImageGallery = ({ images }: { images: string[] }) => {
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
          const newIndex = event.nativeEvent.contentOffset.x / slideSize;
          setCurrentIndex(Math.round(newIndex));
        }}
      >
        {images.map((image, index) => (
          <View key={index} className="relative">
            <Image
              source={{ uri: image }}
              style={{ width: screenWidth, height: 400 }}
              contentFit="cover"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.1)"]}
              className="absolute inset-0"
            />
          </View>
        ))}
      </ScrollView>

      {/* Header Controls */}
      <View className="absolute top-12 left-4 right-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="heart-outline" size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="share-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image indicators */}
      {images.length > 1 && (
        <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-2">
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
    </View>
  );
};

const ProductInfo = ({ product }: { product: any }) => {
  const { t } = useLocalization();
  const stockInfo = getStockStatus(product.stock);
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <View className="space-y-6">
      {/* Product Name & Rating */}
      <View className="space-y-3">
        <Text className="text-2xl font-bold text-neutral-900 leading-8">
          {product.name}
        </Text>

        <View className="flex-row items-center space-x-4">
          <RatingDisplay
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="md"
          />
        </View>
      </View>

      {/* Price */}
      <Card variant="fresh" padding="lg">
        <View className="space-y-3">
          <View className="flex-row items-center space-x-3">
            <View className="flex-row items-baseline space-x-1">
              <Text className="text-3xl font-bold text-primary-600">
                {formatCurrency(product.price)}
              </Text>
              <Text className="text-lg text-neutral-600 font-medium">/bó</Text>
            </View>
            {hasDiscount && (
              <View className="flex-row items-center space-x-2">
                <Text className="text-lg text-neutral-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </Text>
                <Badge
                  text={`-${discountPercent}%`}
                  variant="error"
                  size="sm"
                />
              </View>
            )}
          </View>
        </View>
      </Card>

      {/* Stock & Availability */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
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
          <Badge text="Miễn phí giao hàng" variant="secondary" size="sm" />
        </View>
      </View>

      {/* Product Highlights */}
      <View className="space-y-3">
        <Text className="text-lg font-semibold text-neutral-900">
          Điểm Nổi Bật
        </Text>
        <View className="space-y-2">
          {product.origin && (
            <View className="flex-row items-center space-x-3">
              <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center">
                <Ionicons name="location" size={12} color="#00623A" />
              </View>
              <Text className="text-neutral-700">
                Nguồn gốc: {product.origin}
              </Text>
            </View>
          )}

          {product.harvestDate && (
            <View className="flex-row items-center space-x-3">
              <View className="w-6 h-6 bg-organic-100 rounded-full items-center justify-center">
                <Ionicons name="calendar" size={12} color="#b8860b" />
              </View>
              <Text className="text-neutral-700">
                Thu hoạch: {formatDate(product.harvestDate)}
              </Text>
            </View>
          )}

          <View className="flex-row items-center space-x-3">
            <View className="w-6 h-6 bg-success-100 rounded-full items-center justify-center">
              <Ionicons name="shield-checkmark" size={12} color="#16a34a" />
            </View>
            <Text className="text-neutral-700">
              Chứng nhận an toàn thực phẩm
            </Text>
          </View>

          <View className="flex-row items-center space-x-3">
            <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="leaf" size={12} color="#2563eb" />
            </View>
            <Text className="text-neutral-700">
              100% tự nhiên, không hóa chất
            </Text>
          </View>
        </View>
      </View>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <View className="space-y-3">
          <Text className="text-lg font-semibold text-neutral-900">Tags</Text>
          <View className="flex-row flex-wrap gap-2">
            {product.tags.map((tag: string) => (
              <Badge key={tag} text={tag} variant="outline" size="sm" />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const ProductDetails = ({ product }: { product: any }) => {
  const [activeTab, setActiveTab] = useState<
    "description" | "nutrition" | "reviews"
  >("description");

  const tabs = [
    { id: "description", label: "Mô Tả" },
    { id: "nutrition", label: "Dinh Dưỡng" },
    { id: "reviews", label: "Đánh Giá" },
  ];

  return (
    <Card padding="none" variant="elevated">
      {/* Tab Headers */}
      <View className="flex-row border-b border-neutral-100">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === tab.id ? "border-primary-500" : "border-transparent"
            }`}
          >
            <Text
              className={`font-medium ${
                activeTab === tab.id ? "text-primary-600" : "text-neutral-600"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View className="p-6">
        {activeTab === "description" && (
          <View className="space-y-4">
            <Text className="text-neutral-700 leading-7 text-base">
              {product.description}
            </Text>

            <View className="space-y-4 pt-4 border-t border-neutral-100">
              <Text className="text-lg font-semibold text-neutral-900">
                Thông Tin Chi Tiết
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between py-2">
                  <Text className="text-neutral-600">Mã sản phẩm</Text>
                  <Text className="text-neutral-900 font-medium">
                    {product.sku}
                  </Text>
                </View>

                {product.origin && (
                  <View className="flex-row justify-between py-2">
                    <Text className="text-neutral-600">Xuất xứ</Text>
                    <Text className="text-neutral-900 font-medium">
                      {product.origin}
                    </Text>
                  </View>
                )}

                {product.harvestDate && (
                  <View className="flex-row justify-between py-2">
                    <Text className="text-neutral-600">Ngày thu hoạch</Text>
                    <Text className="text-neutral-900 font-medium">
                      {formatDate(product.harvestDate)}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between py-2">
                  <Text className="text-neutral-600">Bảo quản</Text>
                  <Text className="text-neutral-900 font-medium">
                    Nơi khô ráo, thoáng mát
                  </Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-neutral-600">Hạn sử dụng</Text>
                  <Text className="text-neutral-900 font-medium">3-5 ngày</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === "nutrition" && (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-neutral-900">
              Thông Tin Dinh Dưỡng
            </Text>
            <Text className="text-sm text-neutral-600 mb-4">
              Trên 100g sản phẩm
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-neutral-100">
                <Text className="text-neutral-700">Calo</Text>
                <Text className="text-neutral-900 font-medium">25 kcal</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-neutral-100">
                <Text className="text-neutral-700">Protein</Text>
                <Text className="text-neutral-900 font-medium">2.5g</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-neutral-100">
                <Text className="text-neutral-700">Carbohydrate</Text>
                <Text className="text-neutral-900 font-medium">4.8g</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-neutral-100">
                <Text className="text-neutral-700">Chất xơ</Text>
                <Text className="text-neutral-900 font-medium">2.1g</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-neutral-100">
                <Text className="text-neutral-700">Vitamin C</Text>
                <Text className="text-neutral-900 font-medium">80mg</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === "reviews" && (
          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-neutral-900">
                Đánh Giá Khách Hàng
              </Text>
              <TouchableOpacity>
                <Text className="text-primary-600 font-medium">
                  Viết đánh giá
                </Text>
              </TouchableOpacity>
            </View>

            {/* Review Summary */}
            <View className="bg-neutral-50 rounded-xl p-4">
              <View className="flex-row items-center space-x-4">
                <View className="items-center">
                  <Text className="text-3xl font-bold text-neutral-900">
                    {product.rating || 4.5}
                  </Text>
                  <RatingDisplay rating={product.rating || 4.5} size="sm" />
                  <Text className="text-sm text-neutral-600 mt-1">
                    {product.reviewCount || 124} đánh giá
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
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
      toast.error("Lỗi", "Thêm sản phẩm vào giỏ thất bại");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      await addItem(product.id, quantity);
      router.push("/(app)/(tabs)/cart");
    } catch (error) {
      toast.error("Lỗi", "Thêm sản phẩm vào giỏ thất bại");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-neutral-600">Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <EmptyState
          icon="alert-circle-outline"
          title="Không tìm thấy sản phẩm"
          description="Chúng tôi không thể tìm thấy sản phẩm này. Nó có thể đã bị xóa hoặc tạm thời không có sẵn."
          actionLabel="Trở về danh mục"
          onActionPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ImageGallery images={product.images} />

        <View className="px-4 py-6 space-y-6">
          <ProductInfo product={product} />

          {/* Quantity Selector */}
          <Card variant="elevated" padding="lg">
            <View className="space-y-6">
              <Text className="text-lg font-semibold text-neutral-900">
                Chọn Số Lượng
              </Text>

              <View className="space-y-4">
                <View className="flex-row items-center justify-center">
                  <QuantityStepper
                    value={quantity}
                    onValueChange={setQuantity}
                    min={1}
                    max={Math.min(product.stock, 99)}
                    size="md"
                  />
                </View>

                <View className="flex-row items-center justify-between pt-2 border-t border-neutral-100">
                  <Text className="text-sm text-neutral-600">
                    Tối đa {Math.min(product.stock, 99)} sản phẩm
                  </Text>

                  <View className="items-end">
                    <Text className="text-sm text-neutral-600">Tổng tiền</Text>
                    <Text className="text-xl font-bold text-primary-600">
                      {formatCurrency(product.price * quantity)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          <View className="mt-2">
            <ProductDetails product={product} />
          </View>

          <View className="h-24" />
        </View>
      </ScrollView>

      {/* Sticky Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200">
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,1)"]}
          className="px-4 py-3"
        >
          {product.isInStock ? (
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleAddToCart}
                className="flex-1 bg-white border-2 border-primary-500 rounded-xl py-4 items-center justify-center"
                style={{
                  shadowColor: "#00623A",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center space-x-2">
                  <Ionicons name="basket-outline" size={20} color="#00623A" />
                  <Text className="text-primary-600 font-semibold text-base">
                    Thêm Vào Giỏ
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBuyNow}
                className="flex-1 bg-primary-500 rounded-xl py-4 items-center justify-center"
                style={{
                  shadowColor: "#00623A",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center space-x-2">
                  <Ionicons name="flash" size={20} color="white" />
                  <Text className="text-white font-semibold text-base">
                    Mua Ngay
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              disabled
              className="w-full bg-neutral-300 rounded-xl py-4 items-center justify-center"
            >
              <Text className="text-neutral-500 font-semibold text-base">
                Hết Hàng
              </Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    </View>
  );
}
