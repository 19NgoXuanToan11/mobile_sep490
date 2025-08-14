import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../../src/shared/ui";
import { usePreferences } from "../../src/shared/hooks";
import { useQuery } from "@tanstack/react-query";
import { onboardingApi } from "../../src/shared/data/api";

const { width: screenWidth } = Dimensions.get("window");

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setOnboardingCompleted } = usePreferences();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const { data: slides = [] } = useQuery({
    queryKey: ["onboarding-slides"],
    queryFn: () => onboardingApi.getSlides().then((res) => res.data),
  });

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

  const handleGetStarted = async () => {
    await setOnboardingCompleted(true);
    router.replace("/(public)/welcome");
  };

  const renderDots = () => {
    return (
      <View className="flex-row items-center justify-center space-x-2">
        {slides.map((_, index) => {
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
              className="w-2 h-2 rounded-full bg-primary-500"
              style={{ opacity }}
            />
          );
        })}
      </View>
    );
  };

  const renderSlide = (slide: (typeof slides)[0], index: number) => {
    return (
      <View
        key={slide.id}
        className="flex-1 items-center justify-center px-6"
        style={{ width: screenWidth }}
      >
        <View className="flex-1 items-center justify-center space-y-8">
          <View className="w-80 h-80 rounded-2xl overflow-hidden shadow-lg">
            <Image
              source={{ uri: slide.image }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>

          <View className="space-y-4 text-center">
            <Text className="text-3xl font-bold text-neutral-900 text-center">
              {slide.title}
            </Text>
            <Text className="text-lg text-neutral-600 text-center leading-7 max-w-sm">
              {slide.subtitle}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (slides.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-neutral-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["rgba(34, 197, 94, 0.05)", "rgba(255, 255, 255, 0)"]}
        className="absolute top-0 left-0 right-0 h-1/2"
      />

      {/* Skip Button */}
      <View className="absolute top-safe-top right-6 z-10 mt-4">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-neutral-500 text-base">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map(renderSlide)}
      </ScrollView>

      {/* Bottom Section */}
      <View className="px-6 pb-8 space-y-6">
        {renderDots()}

        <View className="space-y-3">
          <Button
            title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            fullWidth
            size="lg"
          />

          {currentIndex < slides.length - 1 && (
            <Button
              title="Skip for now"
              variant="ghost"
              onPress={handleSkip}
              fullWidth
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
