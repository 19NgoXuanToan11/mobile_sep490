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
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAuth } from "../../src/shared/hooks";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "Nông Sản Tươi Ngon",
    subtitle:
      "Khám phá những sản phẩm nông nghiệp tươi ngon, sạch và chất lượng",
    image: require("../../assets/onboarding-1.jpg"),
    gradient: ["#f0f9f5", "#ffffff"],
  },
  {
    id: 2,
    title: "Dễ Dàng Đặt Hàng",
    subtitle:
      "Chọn lựa và đặt hàng những sản phẩm chỉ với vài thao tác đơn giản",
    image: require("../../assets/onboarding-2.jpg"),
    gradient: ["#f0f9f5", "#ffffff"],
  },
  {
    id: 3,
    title: "Sản Phẩm Đa Dạng",
    subtitle: "Kho sản phẩm phong phú, luôn cập nhật nguồn hàng tươi ngon",
    image: require("../../assets/onboarding-3.jpg"),
    gradient: ["#f0f9f5", "#ffffff"],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "android") return;
      try {
        const nav = require("expo-navigation-bar");
        if (nav && nav.setBackgroundColorAsync) {
          await nav.setBackgroundColorAsync("transparent");
        }
        if (nav && nav.setBehaviorAsync) {
          await nav.setBehaviorAsync("overlay-swipe");
        }
      } catch (e) {
      }
    })();
  }, []);
  const { isAuthenticated } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slides = ONBOARDING_SLIDES;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    }
  );

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;

      setCurrentIndex(nextIndex);

      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleGetStarted();
  };

  const handleGetStarted = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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
      router.replace("/(app)/(tabs)/home");
    });
  };

  const renderDots = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];

          const pillScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          const pillOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          });

          return (
            <View
              key={index}
              style={{
                width: 28,
                height: 12,
                marginHorizontal: 4,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 6,
                  backgroundColor: "rgba(255,255,255,0.6)",
                }}
              />

              <Animated.View
                style={{
                  position: "absolute",
                  width: 28,
                  height: 6,
                  borderRadius: 6,
                  backgroundColor: "#00D662",
                  opacity: pillOpacity,
                  transform: [{ scaleX: pillScale }],
                  shadowColor: "#00D662",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              />
            </View>
          );
        })}
      </View>
    );
  };

  const renderSlide = (slide: (typeof slides)[0], index: number) => {
    const imageTranslateX = scrollX.interpolate({
      inputRange: [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      outputRange: [-50, 0, 50],
      extrapolate: "clamp",
    });

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
        style={{ width: screenWidth, height: screenHeight }}
      >
        <Animated.View
          style={{
            position: "absolute",
            inset: 0,
            transform: [{ translateX: imageTranslateX }, { scale: imageScale }],
            opacity: index === currentIndex ? imageAnim : contentOpacity,
          }}
        >
          <Image
            source={typeof slide.image === "string" ? { uri: slide.image } : slide.image}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            placeholder={{
              blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
              width: 400,
              height: 600,
            }}
          />
          <LinearGradient
            colors={
              index === 0
                ? ["rgba(0,0,0,0.15)", "rgba(0,0,0,0.7)"]
                : ["rgba(0,0,0,0.35)", "rgba(0,0,0,0.08)"]
            }
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: index === 0 ? 180 : 160,
            alignItems:
              index === slides.length - 1
                ? "flex-start"
                : index === 1
                  ? "flex-start"
                  : "center",
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
          {index === slides.length - 1 ? (
            (() => {
              const parts = slide.title.split(" ");
              const firstPart = parts.slice(0, 2).join(" ");
              const secondPart = parts.slice(2).join(" ");

              return (
                <>
                  <Animated.View
                    style={{
                      marginBottom: 12,
                      alignItems: "flex-start",
                      opacity: index === currentIndex ? titleAnim : contentOpacity,
                      transform: [
                        {
                          scale: index === currentIndex
                            ? titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.02] })
                            : 1,
                        },
                      ],
                    }}
                  >
                    <Animated.View
                      style={{
                        backgroundColor: "transparent",
                        borderRadius: 0,
                        paddingHorizontal: 0,
                        paddingVertical: 0,
                      }}
                    >
                      <Animated.Text
                        style={{
                          color: "white",
                          fontSize: 34,
                          fontWeight: "800",
                          textAlign: "left",
                          opacity: index === currentIndex ? titleAnim : contentOpacity,
                        }}
                      >
                        {firstPart}
                      </Animated.Text>
                      <Animated.Text
                        style={{
                          color: "#00D662",
                          fontSize: 40,
                          fontWeight: "900",
                          textAlign: "left",
                          opacity: index === currentIndex ? titleAnim : contentOpacity,
                          marginTop: 4,
                        }}
                      >
                        {secondPart}
                      </Animated.Text>
                    </Animated.View>
                  </Animated.View>

                  {index !== slides.length - 1 && (
                    <Animated.Text
                      style={{
                        color: "rgba(255,255,255,0.95)",
                        fontSize: 16,
                        textAlign: "right",
                        lineHeight: 24,
                        opacity: index === currentIndex ? subtitleAnim : contentOpacity,
                        transform: [
                          {
                            translateY:
                              index === currentIndex
                                ? subtitleAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] })
                                : 0,
                          },
                        ],
                        maxWidth: "80%",
                      }}
                    >
                      {slide.subtitle}
                    </Animated.Text>
                  )}
                </>
              );
            })()
          ) : index === 1 ? (
            (() => {
              const parts = slide.title.split(" ");
              const firstPart = parts.slice(0, 2).join(" ");
              const secondPart = parts.slice(2).join(" ");

              return (
                <>
                  <Animated.Text
                    style={{
                      color: "#00D662",
                      fontSize: 34,
                      fontWeight: "800",
                      textAlign: "left",
                      marginBottom: 4,
                      opacity: index === currentIndex ? titleAnim : contentOpacity,
                      transform: [
                        {
                          translateY:
                            index === currentIndex
                              ? titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] })
                              : 0,
                        },
                      ],
                    }}
                  >
                    {firstPart}
                  </Animated.Text>
                  <Animated.Text
                    style={{
                      color: "white",
                      fontSize: 40,
                      fontWeight: "900",
                      textAlign: "left",
                      marginBottom: 8,
                      opacity: index === currentIndex ? titleAnim : contentOpacity,
                      transform: [
                        {
                          translateY:
                            index === currentIndex
                              ? titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] })
                              : 0,
                        },
                      ],
                    }}
                  >
                    {secondPart}
                  </Animated.Text>
                </>
              );
            })()
          ) : (
            <>
              <Animated.Text
                style={{
                  color: "white",
                  fontSize: index === 0 ? 40 : 34,
                  fontWeight: index === 0 ? "900" : "800",
                  textAlign: "center",
                  marginBottom: index === 0 ? 8 : 12,
                  textShadowColor: index === 0 ? "rgba(0,0,0,0.6)" : undefined,
                  textShadowOffset: index === 0 ? { width: 0, height: 2 } : undefined,
                  textShadowRadius: index === 0 ? 6 : undefined,
                  opacity: index === currentIndex ? titleAnim : contentOpacity,
                  transform: [
                    {
                      translateY:
                        index === currentIndex
                          ? titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] })
                          : 0,
                    },
                  ],
                }}
              >
                {slide.title}
              </Animated.Text>
            </>
          )}

          <Animated.Text
            style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: index === 0 ? 18 : 16,
              textAlign: index === 1 || index === slides.length - 1 ? "left" : "center",
              lineHeight: index === 0 ? 26 : 24,
              marginTop: index === 0 ? 6 : 0,
              opacity: index === currentIndex ? subtitleAnim : contentOpacity,
              transform: [
                {
                  translateY:
                    index === currentIndex
                      ? subtitleAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] })
                      : 0,
                },
              ],
              maxWidth: index === 1 || index === slides.length - 1 ? "80%" : undefined,
              alignSelf: index === 1 || index === slides.length - 1 ? "flex-start" : undefined,
            }}
          >
            {slide.subtitle}
          </Animated.Text>
        </Animated.View>
      </View>
    );
  };

  const ActionButton = ({
    title,
    onPress,
    variant = "primary",
    icon,
    style,
    textStyle,
  }: {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
    icon?: keyof typeof Ionicons.glyphMap;
    style?: any;
    textStyle?: any;
  }) => {
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shadowAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      setIsPressed(true);
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
            className={`flex-row items-center justify-center rounded-2xl py-4 px-8 ${isPrimary ? "bg-primary-500" : "bg-neutral-100"
              }`}
            style={style}
          >
            <Animated.Text
              className={`text-lg font-medium tracking-wide ${isPrimary ? "text-white" : "text-neutral-600"
                }`}
              style={[
                {
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0.95, 1],
                        outputRange: [0.98, 1],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                },
                textStyle,
              ]}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }} edges={[]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View className="absolute top-20 left-8 opacity-5">
        <Ionicons name="bag-outline" size={20} color="#00623A" />
      </View>
      <View className="absolute top-32 right-12 opacity-5">
        <Ionicons name="leaf-outline" size={16} color="#00623A" />
      </View>
      <View className="absolute bottom-40 left-12 opacity-5">
        <Ionicons name="car-outline" size={14} color="#00623A" />
      </View>

      {currentIndex < slides.length - 1 && (
        <Pressable
          onPress={handleSkip}
          style={{
            position: "absolute",
            top: 52,
            right: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: "rgba(0,0,0,0.35)",
            borderRadius: 20,
            zIndex: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>Bỏ qua</Text>
        </Pressable>
      )}

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

      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 24,
          bottom: 84,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          zIndex: 30,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, paddingLeft: 12, alignItems: "flex-start" }}>{renderDots()}</View>

          {currentIndex < slides.length - 1 ? (
            <View style={{ marginLeft: 12, transform: [{ translateY: -6 }] }}>
              <ActionButton
                title="Tiếp"
                onPress={handleNext}
                variant="primary"
                style={{
                  width: 140,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#00D662",
                  justifyContent: "center",
                }}
                textStyle={{ fontSize: 18, fontWeight: "700", color: "white" }}
              />
            </View>
          ) : (
            <View style={{ marginLeft: 12, transform: [{ translateY: -6 }] }}>
              <ActionButton
                title="Bắt Đầu"
                onPress={handleGetStarted}
                variant="primary"
                style={{
                  width: 140,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#00D662",
                  justifyContent: "center",
                }}
                textStyle={{ fontSize: 18, fontWeight: "700", color: "white" }}
              />
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
