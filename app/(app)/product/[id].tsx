import React, { useRef, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    Button,
    Card,
    Badge,
    Skeleton,
    RatingDisplay,
    QuantityStepper,
} from "../../../src/shared/ui";
import FeedbackList, {
    FeedbackListItem,
} from "../../../src/shared/ui/feedback-list";
import { ProductService } from "../../../src/api/services/ProductService";
import { feedbackApi } from "../../../src/shared/data/api";
import { useAuth, useCart } from "../../../src/shared/hooks";
import { useToast } from "../../../src/shared/ui/toast";
import { normalizeUnit } from "../../../src/shared/lib/utils";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const { addItem } = useCart();
    const toast = useToast();
    const queryClient = useQueryClient();

    const [refreshing, setRefreshing] = React.useState(false);
    const [quantity, setQuantity] = React.useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
    const [addedToCart, setAddedToCart] = React.useState(false);

    // Animation values
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const priceSlideAnim = useRef(new Animated.Value(20)).current;
    const quantityScaleAnim = useRef(new Animated.Value(1)).current;
    const cartButtonScaleAnim = useRef(new Animated.Value(1)).current;

    const productId = parseInt(id || "0", 10);

    // Entrance animations
    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(priceSlideAnim, {
                toValue: 0,
                duration: 500,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // 获取产品详情
    const {
        data: product,
        isLoading: isProductLoading,
        error: productError,
        refetch: refetchProduct,
    } = useQuery({
        queryKey: ["product", productId],
        queryFn: () => ProductService.getApiV1ProductsGetProduct({ productId }),
        enabled: !!productId,
    });

    // 获取产品评价
    const {
        data: feedbackData,
        isLoading: isFeedbackLoading,
        refetch: refetchFeedback,
    } = useQuery({
        queryKey: ["feedback", productId],
        queryFn: async () => {
            const result = await feedbackApi.getByProduct(productId);
            return result.success ? result.data : [];
        },
        enabled: !!productId,
    });


    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchProduct(), refetchFeedback()]);
        setRefreshing(false);
    }, [refetchProduct, refetchFeedback]);


    // Animate quantity change
    const handleQuantityChange = (newQuantity: number) => {
        setQuantity(newQuantity);
        Animated.sequence([
            Animated.timing(quantityScaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(quantityScaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleAddToCart = async () => {
        if (!product?.data) return;

        // Button press animation
        Animated.sequence([
            Animated.timing(cartButtonScaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(cartButtonScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        try {
            await addItem(productId.toString(), quantity);
            setAddedToCart(true);
            toast.success(
                "Đã thêm vào giỏ ✓",
                `${product.data.productName} (x${quantity}) đã được thêm vào giỏ hàng`
            );

            // Reset added state after 2 seconds
            setTimeout(() => {
                setAddedToCart(false);
            }, 2000);
        } catch (error) {
            toast.error("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng");
        }
    };



    // Parallax effect for image
    const imageTranslateY = scrollY.interpolate({
        inputRange: [0, 300],
        outputRange: [0, -50],
        extrapolate: 'clamp',
    });

    const imageScale = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: [1.3, 1],
        extrapolate: 'clamp',
    });

    if (isProductLoading) {
        return (
            <View className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <SafeAreaView className="flex-1">
                    <ScrollView className="flex-1 px-5 py-4">
                        <Skeleton className="w-full h-80 rounded-3xl mb-6" />
                        <Skeleton className="w-3/4 h-6 rounded-xl mb-3" />
                        <Skeleton className="w-1/2 h-8 rounded-xl mb-4" />
                        <Skeleton className="w-full h-32 rounded-2xl mb-6" />
                        <View className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="w-full h-20 rounded-2xl" />
                            ))}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }

    if (productError || !product?.data) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-5">
                <Ionicons name="alert-circle" size={64} color="#ef4444" />
                <Text className="text-xl font-semibold text-neutral-900 mt-4 mb-2">
                    Không tìm thấy sản phẩm
                </Text>
                <Text className="text-neutral-600 text-center mb-6">
                    Sản phẩm này có thể đã bị xóa hoặc không tồn tại
                </Text>
                <Button
                    title="Quay lại"
                    onPress={() => router.back()}
                    className="px-8"
                />
            </SafeAreaView>
        );
    }

    const productData = product?.data;
    // Parse feedback data - feedbackData is already an array from getByProduct
    const feedbacks: FeedbackListItem[] = Array.isArray(feedbackData) ? feedbackData : [];

    // 计算平均评分
    const averageRating = feedbacks.length > 0
        ? feedbacks.reduce((acc, feedback) => acc + (feedback.rating || 0), 0) / feedbacks.length
        : (productData?.rating || 0);

    const hasDiscount =
        productData?.originalPrice && productData.originalPrice > productData.price;
    const discountPercent = hasDiscount
        ? Math.round(
            ((productData.originalPrice - productData.price) /
                productData.originalPrice) *
            100
        )
        : 0;

    return (
        <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Premium Header - Minimal & Clean */}
            <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
                <View className="flex-row items-center justify-between px-5 py-3">
                    {/* Back Button */}
                    <Pressable
                        onPress={() => router.back()}
                        className="w-11 h-11 rounded-full items-center justify-center"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                    >
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </Pressable>

                    {/* Title - Subtle */}
                    <Animated.Text
                        className="text-base font-semibold flex-1 text-center mx-4"
                        style={{
                            color: '#111827',
                            letterSpacing: 0.3,
                            opacity: scrollY.interpolate({
                                inputRange: [100, 150],
                                outputRange: [0, 1],
                                extrapolate: 'clamp',
                            })
                        }}
                        numberOfLines={1}
                    >
                        Chi tiết sản phẩm
                    </Animated.Text>
                </View>
            </SafeAreaView>

            <Animated.ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A86B" />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Premium Product Image with Parallax */}
                <Animated.View
                    className="overflow-hidden"
                    style={{
                        height: screenHeight * 0.5,
                        transform: [{ translateY: imageTranslateY }]
                    }}
                >
                    {/* Gradient Background */}
                    <LinearGradient
                        colors={['#FFFFFF', '#F6FFF8', '#FFFFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        className="absolute inset-0"
                    />

                    <Animated.View
                        style={{
                            flex: 1,
                            opacity: fadeAnim,
                            transform: [{ scale: Animated.multiply(scaleAnim, imageScale) }]
                        }}
                    >
                        {(() => {
                            // Handle both string and array formats for images
                            let imagesToShow: string[] = [];

                            if (productData?.images) {
                                if (Array.isArray(productData.images)) {
                                    imagesToShow = productData.images.filter((img: string) => img && img.trim() !== '');
                                } else if (typeof productData.images === 'string' && productData.images.trim() !== '') {
                                    imagesToShow = [productData.images];
                                }
                            }

                            if (imagesToShow.length === 0 && productData?.image) {
                                imagesToShow = [productData.image];
                            }

                            return imagesToShow.length > 0 ? (
                                <ScrollView
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    onMomentumScrollEnd={(e) => {
                                        const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                                        setSelectedImageIndex(index);
                                    }}
                                >
                                    {imagesToShow.map((image: string, index: number) => (
                                        <View
                                            key={index}
                                            className="items-center justify-center"
                                            style={{ width: screenWidth, height: screenHeight * 0.5 }}
                                        >
                                            <Image
                                                source={{ uri: image }}
                                                style={{
                                                    width: screenWidth * 0.85,
                                                    height: screenHeight * 0.4,
                                                    borderRadius: 0,
                                                }}
                                                contentFit="contain"
                                            />
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <View className="flex-1 items-center justify-center">
                                    <Ionicons name="leaf-outline" size={64} color="#9ca3af" />
                                    <Text className="text-neutral-400 mt-3" style={{ fontSize: 14 }}>Không có hình ảnh</Text>
                                </View>
                            );
                        })()}
                    </Animated.View>

                    {/* Subtle Indicators */}
                    {(() => {
                        let imagesToShow: string[] = [];
                        if (productData?.images) {
                            if (Array.isArray(productData.images)) {
                                imagesToShow = productData.images.filter((img: string) => img && img.trim() !== '');
                            } else if (typeof productData.images === 'string' && productData.images.trim() !== '') {
                                imagesToShow = [productData.images];
                            }
                        }
                        if (imagesToShow.length === 0 && productData?.image) {
                            imagesToShow = [productData.image];
                        }

                        return imagesToShow.length > 1 && (
                            <View className="absolute bottom-8 left-0 right-0 flex-row justify-center space-x-1.5">
                                {imagesToShow.map((_: any, index: number) => (
                                    <View
                                        key={index}
                                        style={{
                                            width: index === selectedImageIndex ? 24 : 6,
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: index === selectedImageIndex ? "#00A86B" : "#D1D5DB",
                                            opacity: index === selectedImageIndex ? 1 : 0.5,
                                        }}
                                    />
                                ))}
                            </View>
                        );
                    })()}
                </Animated.View>

                {/* Premium Product Info Section */}
                <View className="px-6 pt-6">
                    {/* Product Name - Apple Style */}
                    <Animated.View
                        className="mb-2"
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: priceSlideAnim }]
                        }}
                    >
                        <Text
                            className="font-semibold mb-1"
                            style={{
                                fontSize: 28,
                                color: '#111827',
                                letterSpacing: -0.5,
                                lineHeight: 36,
                            }}
                        >
                            {productData?.productName}
                        </Text>
                    </Animated.View>

                    {/* Price - Premium Style */}
                    <Animated.View
                        className="mb-6"
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: priceSlideAnim }]
                        }}
                    >
                        <View className="flex-row items-baseline mb-1">
                            <Text
                                className="font-bold"
                                style={{
                                    fontSize: 32,
                                    color: '#00A86B',
                                    letterSpacing: -0.5,
                                }}
                            >
                                {(productData?.price || 0).toLocaleString('vi-VN')}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 20,
                                    color: '#00A86B',
                                    opacity: 0.7,
                                    marginLeft: 2,
                                }}
                            >
                                ₫
                            </Text>
                            {(() => {
                                const normalizedUnit = normalizeUnit(productData?.unit);
                                return normalizedUnit && (
                                    <Text
                                        className="ml-2"
                                        style={{
                                            fontSize: 16,
                                            color: '#6B7280',
                                            fontWeight: '400',
                                        }}
                                    >
                                        /{normalizedUnit}
                                    </Text>
                                );
                            })()}
                        </View>

                        {hasDiscount && (
                            <View className="flex-row items-center mt-1">
                                <Text
                                    className="line-through mr-2"
                                    style={{
                                        fontSize: 16,
                                        color: '#9CA3AF',
                                    }}
                                >
                                    {(productData?.originalPrice || 0).toLocaleString('vi-VN')}₫
                                </Text>
                                <View
                                    className="px-2 py-1 rounded-full"
                                    style={{ backgroundColor: '#FEE2E2' }}
                                >
                                    <Text style={{ fontSize: 12, color: '#DC2626', fontWeight: '600' }}>
                                        Tiết kiệm {discountPercent}%
                                    </Text>
                                </View>
                            </View>
                        )}

                        {averageRating > 0 && (
                            <View className="mt-3">
                                <RatingDisplay
                                    rating={averageRating}
                                    reviewCount={feedbacks.length}
                                    size="sm"
                                />
                            </View>
                        )}
                    </Animated.View>

                    {/* Premium Product Details Card */}
                    <View
                        className="mb-6 p-5"
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 20,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 10,
                            elevation: 2,
                        }}
                    >
                        <View className="flex-row items-center mb-4">
                            <Text
                                className="font-semibold flex-1"
                                style={{
                                    fontSize: 18,
                                    color: '#111827',
                                    letterSpacing: -0.3,
                                }}
                            >
                                Thông tin sản phẩm
                            </Text>
                            <Text style={{ fontSize: 20 }}>🍃</Text>
                        </View>

                        {productData?.description && (
                            <Text
                                className="mb-4 leading-6"
                                style={{
                                    fontSize: 15,
                                    color: '#4B5563',
                                    lineHeight: 24,
                                }}
                            >
                                {productData?.description}
                            </Text>
                        )}

                        <View className="space-y-3">
                            {productData.origin && (
                                <View className="flex-row items-center py-1.5">
                                    <View
                                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: '#F3F4F6' }}
                                    >
                                        <Ionicons name="location" size={18} color="#00A86B" />
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>
                                            Xuất xứ
                                        </Text>
                                        <Text style={{ fontSize: 15, color: '#111827', fontWeight: '500' }}>
                                            {productData.origin}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {productData.harvestDate && (
                                <View className="flex-row items-center py-1.5">
                                    <View
                                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: '#F3F4F6' }}
                                    >
                                        <Ionicons name="calendar" size={18} color="#00A86B" />
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>
                                            Ngày thu hoạch
                                        </Text>
                                        <Text style={{ fontSize: 15, color: '#111827', fontWeight: '500' }}>
                                            {new Date(productData.harvestDate).toLocaleDateString("vi-VN")}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {productData.soldCount && (
                                <View className="flex-row items-center py-1.5">
                                    <View
                                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: '#F0FDF4' }}
                                    >
                                        <Ionicons name="checkmark-circle" size={18} color="#00A86B" />
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>
                                            Đã bán
                                        </Text>
                                        <Text style={{ fontSize: 15, color: '#111827', fontWeight: '500' }}>
                                            {productData.soldCount.toLocaleString()} sản phẩm
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Premium Quantity Selector */}
                    <View
                        className="mb-6 p-5"
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 20,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 10,
                            elevation: 2,
                        }}
                    >
                        <Text
                            className="font-semibold mb-4"
                            style={{
                                fontSize: 18,
                                color: '#111827',
                                letterSpacing: -0.3,
                            }}
                        >
                            Chọn số lượng
                        </Text>

                        {/* Custom Quantity Stepper */}
                        <View className="flex-row items-center mb-4">
                            <Pressable
                                onPress={() => quantity > 1 && handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                                className="w-11 h-11 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: quantity <= 1 ? '#F3F4F6' : '#FFFFFF',
                                    borderWidth: 1,
                                    borderColor: quantity <= 1 ? '#E5E7EB' : '#D1D5DB',
                                }}
                            >
                                <Ionicons
                                    name="remove"
                                    size={20}
                                    color={quantity <= 1 ? '#9CA3AF' : '#111827'}
                                />
                            </Pressable>

                            <Animated.View
                                className="flex-1 items-center justify-center mx-4"
                                style={{ transform: [{ scale: quantityScaleAnim }] }}
                            >
                                <Text
                                    className="font-semibold"
                                    style={{
                                        fontSize: 24,
                                        color: '#111827',
                                    }}
                                >
                                    {quantity}
                                </Text>
                            </Animated.View>

                            <Pressable
                                onPress={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= (productData?.stock || 99)}
                                className="w-11 h-11 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: quantity >= (productData?.stock || 99) ? '#F3F4F6' : '#00A86B',
                                    borderWidth: 1,
                                    borderColor: quantity >= (productData?.stock || 99) ? '#E5E7EB' : '#00A86B',
                                }}
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color={quantity >= (productData?.stock || 99) ? '#9CA3AF' : '#FFFFFF'}
                                />
                            </Pressable>
                        </View>

                        {/* Premium Add to Cart Button */}
                        <Animated.View style={{ transform: [{ scale: cartButtonScaleAnim }] }}>
                            <Pressable
                                onPress={handleAddToCart}
                                disabled={productData?.isInStock === false}
                                style={{
                                    height: 52,
                                    borderRadius: 26,
                                    overflow: 'hidden',
                                }}
                            >
                                <LinearGradient
                                    colors={addedToCart ? ['#00A86B', '#00A86B'] : ['#00A86B', '#009E60']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="flex-1 flex-row items-center justify-center"
                                >
                                    <Ionicons
                                        name={addedToCart ? "checkmark-circle" : "cart"}
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                    <Text
                                        className="ml-2 font-semibold"
                                        style={{
                                            fontSize: 16,
                                            color: '#FFFFFF',
                                            letterSpacing: 0.2,
                                        }}
                                    >
                                        {addedToCart ? 'Đã thêm vào giỏ ✓' : 'Thêm vào giỏ'}
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </Animated.View>

                        {productData?.stock && productData.stock < 10 && (
                            <View className="mt-3 flex-row items-center">
                                <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                                <Text
                                    className="ml-2"
                                    style={{
                                        fontSize: 13,
                                        color: '#F59E0B',
                                    }}
                                >
                                    Chỉ còn {productData.stock} sản phẩm
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Premium Reviews Section */}
                    <View
                        className="mb-6 p-5"
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 20,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 10,
                            elevation: 2,
                        }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center flex-1">
                                <Text
                                    className="font-semibold"
                                    style={{
                                        fontSize: 18,
                                        color: '#111827',
                                        letterSpacing: -0.3,
                                    }}
                                >
                                    Đánh giá sản phẩm
                                </Text>
                            </View>
                        </View>

                        {isFeedbackLoading ? (
                            <View className="py-12 items-center">
                                <ActivityIndicator size="small" color="#00A86B" />
                                <Text
                                    className="mt-3"
                                    style={{
                                        fontSize: 14,
                                        color: '#9CA3AF',
                                    }}
                                >
                                    Đang tải đánh giá...
                                </Text>
                            </View>
                        ) : feedbacks.length === 0 ? (
                            <View className="py-12 items-center">
                                <View
                                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                                    style={{ backgroundColor: '#F9FAFB' }}
                                >
                                    <Ionicons name="chatbubble-outline" size={28} color="#9CA3AF" />
                                </View>
                                <Text
                                    className="mb-2"
                                    style={{
                                        fontSize: 15,
                                        color: '#6B7280',
                                        fontWeight: '500',
                                    }}
                                >
                                    Chưa có đánh giá nào
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: '#9CA3AF',
                                    }}
                                >
                                    Hãy là người đầu tiên đánh giá sản phẩm này
                                </Text>
                            </View>
                        ) : (
                            <FeedbackList
                                data={feedbacks}
                                currentUserPhone={user?.phone}
                                onEditPress={(feedback) => {
                                }}
                            />
                        )}
                    </View>
                </View>
            </Animated.ScrollView>


            {/* Premium Floating Bottom Bar */}
            <View
                className="absolute bottom-0 left-0 right-0"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                <SafeAreaView edges={["bottom"]}>
                    <View className="px-6 py-4">
                        <View className="flex-row items-center">
                            {/* Cart Icon Button */}
                            <Pressable
                                onPress={() => router.push("/(app)/(tabs)/cart")}
                                className="w-14 h-14 rounded-full items-center justify-center mr-3"
                                style={{
                                    backgroundColor: '#F3F4F6',
                                }}
                            >
                                <Ionicons name="cart-outline" size={26} color="#111827" />
                            </Pressable>

                            {/* Buy Now Button - Premium Gradient */}
                            <Pressable
                                onPress={() => {
                                    handleAddToCart();
                                    router.push("/(app)/(tabs)/cart");
                                }}
                                disabled={productData.isInStock === false}
                                className="flex-1"
                                style={{
                                    height: 56,
                                    borderRadius: 28,
                                    overflow: 'hidden',
                                }}
                            >
                                <LinearGradient
                                    colors={productData.isInStock === false
                                        ? ['#D1D5DB', '#9CA3AF']
                                        : ['#00A86B', '#009E60']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="flex-1 items-center justify-center"
                                >
                                    <Text
                                        className="font-bold"
                                        style={{
                                            fontSize: 17,
                                            color: '#FFFFFF',
                                            letterSpacing: 0.3,
                                        }}
                                    >
                                        {productData.isInStock === false ? 'Hết hàng' : 'Mua ngay'}
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}
