import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAuth } from "../../src/shared/hooks";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Premium onboarding slides for farming e-commerce
const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "Nông Sản Tươi Ngon",
    subtitle:
      "Khám phá những sản phẩm nông nghiệp tươi ngon, sạch và chất lượng từ trang trại đến bàn ăn",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop&crop=center",
    gradient: ["#f0f9f5", "#ffffff"],
  },
  {
    id: 2,
    title: "Dễ Dàng Đặt Hàng",
    subtitle:
      "Chọn lựa và đặt hàng những sản phẩm yêu thích chỉ với vài thao tác đơn giản",
    image:
      "https://i.pinimg.com/1200x/d1/c9/16/d1c916e908888e5c89777c4ac3bc3ae6.jpg",
    gradient: ["#f0f9f5", "#ffffff"],
  },
  {
    id: 3,
    title: "Giao Hàng Nhanh Chóng",
    subtitle:
      "Nhận sản phẩm tươi ngon được giao đến tận nhà với dịch vụ theo dõi realtime",
    image:
      "https://i.pinimg.com/736x/86/1a/1b/861a1b634f7afb186906200a989394d3.jpg",
    gradient: ["#f0f9f5", "#ffffff"],
  },
];

// Categories for preference selection
const PRODUCT_CATEGORIES = [
  {
    id: "vegetables",
    name: "Rau Xanh",
    icon: "leaf-outline" as keyof typeof Ionicons.glyphMap,
    color: "#dcf2e6",
    description: "Rau củ tươi ngon",
  },
  {
    id: "fruits",
    name: "Trái Cây",
    icon: "nutrition-outline" as keyof typeof Ionicons.glyphMap,
    color: "#fef3c7",
    description: "Trái cây tươi mát",
  },
  {
    id: "meat",
    name: "Thịt Cá",
    icon: "fish-outline" as keyof typeof Ionicons.glyphMap,
    color: "#fee2e2",
    description: "Thịt cá tươi sống",
  },
  {
    id: "dairy",
    name: "Sữa & Trứng",
    icon: "egg-outline" as keyof typeof Ionicons.glyphMap,
    color: "#f3f4f6",
    description: "Sản phẩm từ sữa",
  },
  {
    id: "grains",
    name: "Gạo & Ngũ Cốc",
    icon: "restaurant-outline" as keyof typeof Ionicons.glyphMap,
    color: "#fbefd9",
    description: "Gạo và ngũ cốc",
  },
  {
    id: "herbs",
    name: "Gia Vị & Thảo Mộc",
    icon: "flower-outline" as keyof typeof Ionicons.glyphMap,
    color: "#f0fdf4",
    description: "Gia vị tự nhiên",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const { isAuthenticated } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slides = ONBOARDING_SLIDES;

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const currentIndex = event.nativeEvent.contentOffset.x / slideSize;
        setCurrentIndex(Math.round(currentIndex));
      },
    }
  );

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      // Show category selection after slides
      setShowCategorySelection(true);
    }
  };

  const handleSkip = () => {
    setShowCategorySelection(true);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleGetStarted = () => {
    // Save selected categories to preferences (you can implement storage later)
    console.log("Selected categories:", selectedCategories);

    // Navigate based on authentication status
    if (isAuthenticated) {
      router.replace("/(app)/(tabs)/home");
    } else {
      router.replace("/(public)/auth/login");
    }
  };

  const renderDots = () => {
    return (
      <View className="flex-row items-center justify-center space-x-3">
        {slides.map((_, index) => {
          const width = scrollX.interpolate({
            inputRange: [
              (index - 1) * screenWidth,
              index * screenWidth,
              (index + 1) * screenWidth,
            ],
            outputRange: [8, 32, 8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * screenWidth,
              index * screenWidth,
              (index + 1) * screenWidth,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              className="h-1 rounded-full bg-primary-500"
              style={{ width, opacity }}
            />
          );
        })}
      </View>
    );
  };

  const renderSlide = (slide: (typeof slides)[0], index: number) => {
    // Parallax effect for image
    const imageTranslateX = scrollX.interpolate({
      inputRange: [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      outputRange: [-50, 0, 50],
      extrapolate: "clamp",
    });

    // Fade and scale effects for content
    const contentOpacity = scrollX.interpolate({
      inputRange: [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    const contentScale = scrollX.interpolate({
      inputRange: [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    const imageScale = scrollX.interpolate({
      inputRange: [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      outputRange: [1.1, 1, 1.1],
      extrapolate: "clamp",
    });

    return (
      <View
        key={slide.id}
        className="flex-1 items-center justify-center px-8"
        style={{ width: screenWidth }}
      >
        <LinearGradient
          colors={slide.gradient as [string, string]}
          className="absolute inset-0"
        />

        <Animated.View
          className="flex-1 items-center justify-center space-y-12"
          style={{
            opacity: contentOpacity,
            transform: [{ scale: contentScale }],
          }}
        >
          {/* Image Container with Parallax */}
          <View className="w-72 h-72 rounded-3xl overflow-hidden bg-white shadow-2xl">
            <Animated.View
              style={{
                transform: [
                  { translateX: imageTranslateX },
                  { scale: imageScale },
                ],
              }}
              className="w-full h-full"
            >
              <Image
                source={{ uri: slide.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
                placeholder={{
                  blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
                  width: 288,
                  height: 288,
                }}
              />
            </Animated.View>

            {/* Subtle overlay gradient */}
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.1)"]}
              className="absolute inset-0"
            />
          </View>

          {/* Content */}
          <View className="space-y-6 items-center max-w-sm">
            <Text className="text-3xl font-light text-neutral-900 text-center tracking-tight">
              {slide.title}
            </Text>
            <Text className="text-lg text-neutral-600 text-center leading-8 font-light">
              {slide.subtitle}
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Premium button component with micro-animations
  const ActionButton = ({
    title,
    onPress,
    variant = "primary",
    icon,
  }: {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
    icon?: keyof typeof Ionicons.glyphMap;
  }) => {
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      setIsPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        tension: 200,
        friction: 7,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      setIsPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 7,
        useNativeDriver: true,
      }).start();
    };

    const isPrimary = variant === "primary";

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={`flex-row items-center justify-center rounded-2xl py-4 px-8 ${
            isPrimary ? "bg-primary-500" : "bg-neutral-100"
          }`}
          style={{
            shadowColor: isPrimary ? "#00623A" : "#000",
            shadowOffset: { width: 0, height: isPressed ? 2 : 6 },
            shadowOpacity: isPressed ? 0.1 : isPrimary ? 0.3 : 0.1,
            shadowRadius: isPressed ? 4 : 12,
            elevation: isPressed ? 2 : 8,
          }}
        >
          <Text
            className={`text-lg font-medium tracking-wide ${
              isPrimary ? "text-white" : "text-neutral-600"
            }`}
          >
            {title}
          </Text>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={isPrimary ? "white" : "#666"}
              style={{ marginLeft: 8 }}
            />
          )}
        </Pressable>
      </Animated.View>
    );
  };

  // Category Selection Component
  const CategorySelectionScreen = () => (
    <View className="flex-1 bg-white px-6 py-8">
      <LinearGradient
        colors={["#f0f9f5", "#ffffff"]}
        className="absolute inset-0"
      />

      <View className="flex-1 justify-center">
        <View className="space-y-6 mb-8">
          <Text className="text-3xl font-light text-neutral-900 text-center">
            Sở Thích Của Bạn
          </Text>
          <Text className="text-lg text-neutral-600 text-center leading-7">
            Chọn những loại sản phẩm bạn quan tâm để chúng tôi gợi ý tốt hơn
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-center gap-4 mb-8">
          {PRODUCT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => toggleCategory(category.id)}
              className={`w-28 h-28 rounded-2xl items-center justify-center border-2 ${
                selectedCategories.includes(category.id)
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 bg-white"
              }`}
              style={{
                shadowColor: selectedCategories.includes(category.id)
                  ? "#00623A"
                  : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: selectedCategories.includes(category.id)
                  ? 0.2
                  : 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              activeOpacity={0.8}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                style={{ backgroundColor: category.color }}
              >
                <Ionicons
                  name={category.icon}
                  size={24}
                  color={
                    selectedCategories.includes(category.id)
                      ? "#00623A"
                      : "#6b7280"
                  }
                />
              </View>
              <Text
                className={`text-xs font-medium text-center ${
                  selectedCategories.includes(category.id)
                    ? "text-primary-700"
                    : "text-neutral-700"
                }`}
                numberOfLines={2}
              >
                {category.name}
              </Text>

              {selectedCategories.includes(category.id) && (
                <View className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View className="space-y-4">
          <ActionButton
            title="Bắt Đầu Mua Sắm"
            onPress={handleGetStarted}
            variant="primary"
            icon="bag"
          />

          <TouchableOpacity onPress={handleGetStarted}>
            <Text className="text-neutral-500 text-center">
              Bỏ qua, tôi sẽ chọn sau
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (showCategorySelection) {
    return (
      <SafeAreaView className="flex-1">
        <CategorySelectionScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Floating decorative elements */}
      <View className="absolute top-20 left-8 opacity-5">
        <Ionicons name="bag-outline" size={20} color="#00623A" />
      </View>
      <View className="absolute top-32 right-12 opacity-5">
        <Ionicons name="leaf-outline" size={16} color="#00623A" />
      </View>
      <View className="absolute bottom-40 left-12 opacity-5">
        <Ionicons name="car-outline" size={14} color="#00623A" />
      </View>

      {/* Slides */}
      <Animated.View
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1"
          decelerationRate="fast"
        >
          {slides.map(renderSlide)}
        </ScrollView>
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        className="px-8 pb-8 space-y-8"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Dots Indicator */}
        {renderDots()}

        {/* Action Buttons */}
        <View className="w-full" style={{ rowGap: 8 }}>
          <ActionButton
            title={currentIndex === slides.length - 1 ? "Tiếp Tục" : "Tiếp Tục"}
            onPress={handleNext}
            variant="primary"
            icon={
              currentIndex === slides.length - 1
                ? "chevron-forward"
                : "chevron-forward"
            }
          />

          {currentIndex < slides.length - 1 && (
            <ActionButton
              title="Bỏ Qua"
              onPress={handleSkip}
              variant="secondary"
            />
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
