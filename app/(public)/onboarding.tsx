import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Pressable,
  Easing,
} from "react-native";
import * as Haptics from "expo-haptics";
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

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isAuthenticated } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slides = ONBOARDING_SLIDES;

  // Premium entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations for premium feel
    const createStaggeredAnimation = () => {
      return Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.stagger(150, [
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(imageAnim, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(titleAnim, {
            toValue: 1,
            tension: 70,
            friction: 9,
            useNativeDriver: true,
          }),
          Animated.spring(subtitleAnim, {
            toValue: 1,
            tension: 70,
            friction: 9,
            useNativeDriver: true,
          }),
        ]),
      ]);
    };

    const entranceSequence = createStaggeredAnimation();
    entranceSequence.start();
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const newIndex = Math.round(
          event.nativeEvent.contentOffset.x / slideSize
        );

        if (
          newIndex !== currentIndex &&
          newIndex >= 0 &&
          newIndex < slides.length
        ) {
          setCurrentIndex(newIndex);
          // Subtle haptic feedback on slide change
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    }
  );

  const handleNext = () => {
    // Haptic feedback for premium feel
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;

      // Update state immediately for smooth UX
      setCurrentIndex(nextIndex);

      // Use ScrollView's native smooth scrolling
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      // Navigate directly after slides
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleGetStarted();
  };

  const handleGetStarted = () => {
    // Success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Smooth exit animation before navigation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate based on authentication status
      if (isAuthenticated) {
        router.replace("/(app)/(tabs)/home");
      } else {
        router.replace("/(public)/auth/login");
      }
    });
  };

  const renderDots = () => {
    return (
      <View className="flex-row items-center justify-center">
        {slides.map((_, index) => {
          const scaleX = scrollX.interpolate({
            inputRange: [
              (index - 1) * screenWidth,
              index * screenWidth,
              (index + 1) * screenWidth,
            ],
            outputRange: [1, 4, 1], // Scale from 8px to 32px (32/8 = 4)
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

          const scale = scrollX.interpolate({
            inputRange: [
              (index - 1) * screenWidth,
              index * screenWidth,
              (index + 1) * screenWidth,
            ],
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: "clamp",
          });

          return (
            <View
              key={index}
              className="items-center justify-center"
              style={{
                width: 40, // Fixed container width to prevent overlap
                height: 8,
                marginHorizontal: 2, // Extra spacing between containers
              }}
            >
              <Animated.View
                className="h-1 rounded-full bg-primary-500"
                style={{
                  width: 8, // Base dot width
                  opacity,
                  transform: [{ scaleX }, { scale }],
                  shadowColor: "#22C55E",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              />
            </View>
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
            transform: [
              { scale: contentScale },
              {
                translateY:
                  index === currentIndex
                    ? Animated.multiply(slideAnim, 0.5)
                    : 0,
              },
            ],
          }}
        >
          {/* Image Container with Premium Parallax */}
          <Animated.View
            className="w-72 h-72 rounded-3xl overflow-hidden bg-white shadow-2xl"
            style={{
              opacity: index === currentIndex ? imageAnim : contentOpacity,
              transform: [
                {
                  scale:
                    index === currentIndex
                      ? Animated.multiply(imageAnim, 0.1).interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        })
                      : contentScale,
                },
              ],
            }}
          >
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
          </Animated.View>

          {/* Content with Staggered Animations */}
          <View className="space-y-6 items-center max-w-sm">
            <Animated.Text
              className="text-3xl font-light text-neutral-900 text-center tracking-tight"
              style={{
                opacity: index === currentIndex ? titleAnim : contentOpacity,
                transform: [
                  {
                    translateY:
                      index === currentIndex
                        ? titleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          })
                        : 0,
                  },
                ],
              }}
            >
              {slide.title}
            </Animated.Text>
            <Animated.Text
              className="text-lg text-neutral-600 text-center leading-8 font-light"
              style={{
                opacity: index === currentIndex ? subtitleAnim : contentOpacity,
                transform: [
                  {
                    translateY:
                      index === currentIndex
                        ? subtitleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [15, 0],
                          })
                        : 0,
                  },
                ],
              }}
            >
              {slide.subtitle}
            </Animated.Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Premium button component with premium micro-animations
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
    const shadowAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      setIsPressed(true);
      // Gentle haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 0.4,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      setIsPressed(false);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(shadowAnim, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePress = () => {
      // Success haptic for primary, light for secondary
      if (variant === "primary") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    };

    const isPrimary = variant === "primary";

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <Animated.View
          style={{
            shadowColor: isPrimary ? "#00623A" : "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: shadowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, isPrimary ? 0.3 : 0.15],
            }),
            shadowRadius: shadowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [4, 12],
            }),
            elevation: shadowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 8],
            }),
          }}
        >
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className={`flex-row items-center justify-center rounded-2xl py-4 px-8 ${
              isPrimary ? "bg-primary-500" : "bg-neutral-100"
            }`}
          >
            <Animated.Text
              className={`text-lg font-medium tracking-wide ${
                isPrimary ? "text-white" : "text-neutral-600"
              }`}
              style={{
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0.95, 1],
                      outputRange: [0.98, 1],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              }}
            >
              {title}
            </Animated.Text>
            {icon && (
              <Animated.View
                style={{
                  marginLeft: 8,
                  transform: [
                    {
                      translateX: scaleAnim.interpolate({
                        inputRange: [0.95, 1],
                        outputRange: [-2, 0],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                }}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={isPrimary ? "white" : "#666"}
                />
              </Animated.View>
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  };

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
          bounces={false}
          overScrollMode="never"
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
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
            title={currentIndex === slides.length - 1 ? "Bắt Đầu" : "Tiếp Tục"}
            onPress={handleNext}
            variant="primary"
            icon={
              currentIndex === slides.length - 1 ? undefined : "chevron-forward"
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
