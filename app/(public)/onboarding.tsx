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

// Premium onboarding slides for farm management
const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "Smart Farm Management",
    subtitle:
      "Monitor your livestock with IoT technology and real-time data analytics",
    image:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=600&fit=crop&crop=center",
    gradient: ["#f0f9f5", "#ffffff"],
  },
  {
    id: 2,
    title: "Health Monitoring",
    subtitle: "Track animal health, weight, and behavior with advanced sensors",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop&crop=center",
    gradient: ["#f0f9f5", "#ffffff"],
  },
  {
    id: 3,
    title: "Sustainable Future",
    subtitle:
      "Optimize resources and maximize yield with eco-friendly farming practices",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&crop=center",
    gradient: ["#f0f9f5", "#ffffff"],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
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
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    // Navigate based on authentication status
    // Don't save any onboarding completion flag - always show onboarding on app restart
    if (isAuthenticated) {
      router.replace("/(app)/(tabs)/home");
    } else {
      // Navigate to the old catalog page (renamed from welcome) or login
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Floating decorative elements */}
      <View className="absolute top-20 left-8 opacity-5">
        <Ionicons name="leaf-outline" size={20} color="#00623A" />
      </View>
      <View className="absolute top-32 right-12 opacity-5">
        <Ionicons name="leaf-outline" size={16} color="#00623A" />
      </View>
      <View className="absolute bottom-40 left-12 opacity-5">
        <Ionicons name="leaf-outline" size={14} color="#00623A" />
      </View>

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <View className="absolute top-safe-top right-6 z-10 mt-4">
          <TouchableOpacity onPress={handleSkip}>
            <BlurView
              intensity={20}
              tint="light"
              className="rounded-full px-4 py-2"
            >
              <Text className="text-neutral-600 text-base font-medium">
                Skip
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      )}

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
        <View className="space-y-4">
          <ActionButton
            title={
              currentIndex === slides.length - 1 ? "Get Started" : "Continue"
            }
            onPress={handleNext}
            variant="primary"
            icon={
              currentIndex === slides.length - 1
                ? "arrow-forward"
                : "chevron-forward"
            }
          />

          {currentIndex < slides.length - 1 && (
            <ActionButton
              title="Skip for now"
              onPress={handleSkip}
              variant="secondary"
            />
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
