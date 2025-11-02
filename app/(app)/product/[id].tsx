import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
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
import FeedbackFormModal from "../../../src/shared/ui/feedback-form-modal";
import { ProductService } from "../../../src/api/services/ProductService";
import { FeedbackService } from "../../../src/api/services/FeedbackService";
import { useAuth, useCart } from "../../../src/shared/hooks";
import { useToast } from "../../../src/shared/ui/toast";

const { width: screenWidth } = Dimensions.get("window");

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
    const [feedbackModalVisible, setFeedbackModalVisible] = React.useState(false);

    const productId = parseInt(id || "0", 10);

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
        queryFn: () =>
            FeedbackService.getApiV1FeedbackFeedbackByProduct({ productId }),
        enabled: !!productId,
    });

    // 创建评价
    const createFeedbackMutation = useMutation({
        mutationFn: (data: { comment: string; rating: number | null }) =>
            FeedbackService.postApiV1FeedbackCreateFeedback({
                requestBody: {
                    comment: data.comment,
                    rating: data.rating,
                    orderDetailId: 1, // 这里需要根据实际订单详情ID来设置
                },
            }),
        onSuccess: () => {
            toast.success("Đánh giá thành công", "Cảm ơn bạn đã đánh giá sản phẩm!");
            setFeedbackModalVisible(false);
            refetchFeedback();
        },
        onError: (error) => {
            console.error("Create feedback error:", error);
            toast.error("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại.");
        },
    });

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchProduct(), refetchFeedback()]);
        setRefreshing(false);
    }, [refetchProduct, refetchFeedback]);

    const handleAddToCart = async () => {
        if (!product?.data) return;

        try {
            await addItem(productId.toString(), quantity);
            toast.success(
                "Đã thêm vào giỏ",
                `${product.data.productName} (x${quantity}) đã được thêm vào giỏ hàng`
            );
        } catch (error) {
            console.error("Add to cart error:", error);
            toast.error("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng");
        }
    };

    const handleWriteFeedback = () => {
        if (!user) {
            toast.error("Đăng nhập", "Vui lòng đăng nhập để viết đánh giá");
            router.push("/(public)/auth/login");
            return;
        }
        setFeedbackModalVisible(true);
    };

    const handleSubmitFeedback = async (data: {
        comment: string;
        rating: number | null;
    }) => {
        await createFeedbackMutation.mutateAsync(data);
    };

    if (isProductLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" backgroundColor="white" />
                <ScrollView className="flex-1 px-5 py-4">
                    <Skeleton className="w-full h-80 rounded-2xl mb-6" />
                    <Skeleton className="w-3/4 h-6 rounded mb-3" />
                    <Skeleton className="w-1/2 h-8 rounded mb-4" />
                    <Skeleton className="w-full h-32 rounded-xl mb-6" />
                    <View className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="w-full h-20 rounded-xl" />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
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
    const feedbacks: FeedbackListItem[] = feedbackData?.data || [];

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
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* Header */}
            <SafeAreaView>
                <View className="flex-row items-center justify-between px-5 py-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={20} color="#374151" />
                    </TouchableOpacity>

                    <Text className="text-lg font-semibold text-neutral-900 flex-1 text-center mx-4" numberOfLines={1}>
                        Chi tiết sản phẩm
                    </Text>

                    <TouchableOpacity className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center">
                        <Ionicons name="heart-outline" size={20} color="#374151" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Product Images */}
                <View className="mb-6">
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                            setSelectedImageIndex(index);
                        }}
                    >
                        {(() => {
                            // Handle both string and array formats for images
                            let imagesToShow: string[] = [];

                            if (productData?.images) {
                                if (Array.isArray(productData.images)) {
                                    // If images is an array
                                    imagesToShow = productData.images.filter((img: string) => img && img.trim() !== '');
                                } else if (typeof productData.images === 'string' && productData.images.trim() !== '') {
                                    // If images is a string (single image URL)
                                    imagesToShow = [productData.images];
                                }
                            }

                            // Fallback to single image field if no images found
                            if (imagesToShow.length === 0 && productData?.image) {
                                imagesToShow = [productData.image];
                            }

                            return imagesToShow.length > 0 ? (
                                imagesToShow.map((image: string, index: number) => (
                                    <View
                                        key={index}
                                        className="relative"
                                        style={{ width: screenWidth }}
                                    >
                                        <Image
                                            source={{ uri: image }}
                                            style={{ width: screenWidth, height: 300 }}
                                            contentFit="cover"
                                        />

                                        {/* Badges Overlay */}
                                        <View className="absolute top-4 left-4 space-y-2">
                                            {hasDiscount && (
                                                <Badge
                                                    text={`-${discountPercent}%`}
                                                    variant="error"
                                                    size="sm"
                                                />
                                            )}
                                            {productData?.isFeatured && (
                                                <Badge text="HOT" variant="warning" size="sm" />
                                            )}
                                            {productData?.tags?.includes("organic") && (
                                                <Badge text="Organic" variant="success" size="sm" />
                                            )}
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View
                                    className="bg-neutral-100 items-center justify-center"
                                    style={{ width: screenWidth, height: 300 }}
                                >
                                    <Ionicons name="image-outline" size={64} color="#9ca3af" />
                                    <Text className="text-neutral-500 mt-2">Không có hình ảnh</Text>
                                </View>
                            );
                        })()}
                    </ScrollView>

                    {/* Image Indicators */}
                    {(() => {
                        // Use same logic as above for consistency
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
                            <View className="flex-row justify-center mt-3 space-x-2">
                                {imagesToShow.map((_: any, index: number) => (
                                    <View
                                        key={index}
                                        className={`w-2 h-2 rounded-full ${index === selectedImageIndex ? "bg-primary-500" : "bg-neutral-300"
                                            }`}
                                    />
                                ))}
                            </View>
                        );
                    })()}
                </View>

                {/* Product Info */}
                <View className="px-5">
                    {/* Product Name & Rating */}
                    <View className="mb-4">
                        <Text className="text-2xl font-bold text-neutral-900 mb-2">
                            {productData?.productName}
                        </Text>

                        {averageRating > 0 && (
                            <RatingDisplay
                                rating={averageRating}
                                reviewCount={feedbacks.length}
                                size="md"
                            />
                        )}
                    </View>

                    {/* Price */}
                    <View className="mb-6">
                        <View className="flex-row items-baseline space-x-3 mb-2">
                            <Text className="text-3xl font-bold text-primary-600">
                                {formatCurrency(productData?.price || 0)}
                            </Text>
                            {productData?.unit && (
                                <Text className="text-lg text-neutral-500">/{productData?.unit}</Text>
                            )}
                        </View>

                        {hasDiscount && (
                            <View className="flex-row items-center space-x-3">
                                <Text className="text-lg text-neutral-400 line-through">
                                    {formatCurrency(productData?.originalPrice || 0)}
                                </Text>
                                <Badge text={`Tiết kiệm ${discountPercent}%`} variant="error" size="sm" />
                            </View>
                        )}
                    </View>

                    {/* Product Details */}
                    <Card className="mb-6" padding="lg">
                        <Text className="text-lg font-semibold text-neutral-900 mb-3">
                            Thông tin sản phẩm
                        </Text>

                        <View className="space-y-3">
                            {productData.origin && (
                                <View className="flex-row items-center">
                                    <Ionicons name="location-outline" size={18} color="#6b7280" />
                                    <Text className="ml-3 text-neutral-800">
                                        Xuất xứ: {productData.origin}
                                    </Text>
                                </View>
                            )}

                            {productData.harvestDate && (
                                <View className="flex-row items-center">
                                    <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                                    <Text className="ml-3 text-neutral-800">
                                        Ngày thu hoạch:{" "}
                                        {new Date(productData.harvestDate).toLocaleDateString("vi-VN")}
                                    </Text>
                                </View>
                            )}

                            {productData.soldCount && (
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                                    <Text className="ml-3 text-neutral-800">
                                        Đã bán: {productData.soldCount.toLocaleString()}
                                    </Text>
                                </View>
                            )}

                            {productData.certifications?.length > 0 && (
                                <View className="flex-row items-center">
                                    <Ionicons name="shield-checkmark" size={18} color="#2563eb" />
                                    <Text className="ml-3 text-neutral-800">
                                        Chứng nhận: {productData.certifications.join(", ")}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {productData?.description && (
                            <View className="mt-4 pt-4 border-t border-neutral-200">
                                <Text className="text-neutral-800 leading-6">
                                    {productData?.description}
                                </Text>
                            </View>
                        )}
                    </Card>

                    {/* Quantity & Add to Cart */}
                    <Card className="mb-6" padding="lg">
                        <Text className="text-lg font-semibold text-neutral-900 mb-4">
                            Chọn số lượng
                        </Text>

                        <View className="flex-row items-center justify-between">
                            <QuantityStepper
                                value={quantity}
                                onValueChange={setQuantity}
                                min={1}
                                max={productData?.stock || 99}
                            />

                            <View className="flex-1 ml-4">
                                <Button
                                    title={`Thêm vào giỏ`}
                                    onPress={handleAddToCart}
                                    disabled={productData?.isInStock === false}
                                    className="bg-primary-500"
                                />
                            </View>
                        </View>

                        {productData?.stock && productData.stock < 10 && (
                            <Text className="text-orange-600 text-sm mt-2">
                                ⚠️ Chỉ còn {productData.stock} sản phẩm
                            </Text>
                        )}
                    </Card>

                    {/* Reviews Section */}
                    <Card className="mb-6" padding="lg">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-neutral-900">
                                Đánh giá sản phẩm ({feedbacks.length})
                            </Text>
                            <TouchableOpacity
                                onPress={handleWriteFeedback}
                                className="bg-primary-500 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-medium">Viết đánh giá</Text>
                            </TouchableOpacity>
                        </View>

                        {isFeedbackLoading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator size="small" color="#059669" />
                                <Text className="text-neutral-500 mt-2">Đang tải đánh giá...</Text>
                            </View>
                        ) : (
                            <FeedbackList
                                data={feedbacks}
                                currentUserPhone={user?.phone}
                                onEditPress={(feedback) => {
                                }}
                            />
                        )}
                    </Card>
                </View>
            </ScrollView>

            {/* Feedback Modal */}
            <FeedbackFormModal
                visible={feedbackModalVisible}
                onClose={() => setFeedbackModalVisible(false)}
                onSubmit={handleSubmitFeedback}
                submitting={createFeedbackMutation.isPending}
            />

            {/* Bottom Action Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-5 py-4">
                <SafeAreaView edges={["bottom"]}>
                    <View className="flex-row space-x-3">
                        <TouchableOpacity
                            onPress={() => router.push("/(app)/(tabs)/cart")}
                            className="w-12 h-12 bg-neutral-100 rounded-xl items-center justify-center"
                        >
                            <Ionicons name="basket-outline" size={24} color="#374151" />
                        </TouchableOpacity>

                        <Button
                            title="Mua ngay"
                            onPress={() => {
                                handleAddToCart();
                                router.push("/(app)/(tabs)/cart");
                            }}
                            disabled={productData.isInStock === false}
                            className="flex-1 bg-primary-500"
                        />
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}
