import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 3 }, (_, i) => ({
    id: i,
    animValue: useRef(new Animated.Value(0)).current,
    size: Math.random() * 4 + 2,
    delay: i * 1000,
  }));

  useEffect(() => {
    particles.forEach((particle) => {
      const animate = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.animValue, {
              toValue: 1,
              duration: 8000 + Math.random() * 4000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.animValue, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      setTimeout(animate, particle.delay);
    });
  }, []);

  return (
    <View className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => {
        const translateY = particle.animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [screenHeight + 50, -50],
        });

        const opacity = particle.animValue.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 0.6, 0.6, 0],
        });

        return (
          <Animated.View
            key={particle.id}
            className="absolute bg-primary-300 rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: Math.random() * screenWidth,
              transform: [{ translateY }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
};

// Minimalist logo component with breathing animation
const Logo = ({ size = 80 }: { size?: number }) => {
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const timer = setTimeout(() => {
      breathingAnimation.start();
    }, 1000);

    return () => {
      clearTimeout(timer);
      breathingAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: breatheAnim }],
      }}
    >
      <View
        className="items-center justify-center rounded-full bg-primary-500"
        style={{
          width: size,
          height: size,
          shadowColor: "#00623A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <Ionicons name="leaf" size={size * 0.5} color="white" />
      </View>
    </Animated.View>
  );
};

// Animated welcome text component
const WelcomeText = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="items-center space-y-4"
    ></Animated.View>
  );
};

export default function WelcomeScreen() {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigation after 2 seconds with smooth fade-out
    const navigationTimer = setTimeout(() => {
      // Start fade-out animation
      Animated.timing(screenFadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Navigate to onboarding after fade-out completes
        router.replace("/(public)/onboarding");
      });
    }, 2000);

    return () => clearTimeout(navigationTimer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        className="flex-1"
        style={{
          opacity: screenFadeAnim,
        }}
      >
        {/* Subtle gradient background */}
        <LinearGradient
          colors={["#f0f9f5", "#ffffff", "#ffffff"]}
          className="absolute inset-0"
        />

        {/* Floating particles */}
        <FloatingParticles />

        <View className="flex-1 items-center justify-center px-8">
          {/* Logo section - perfectly centered */}
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <Logo size={120} />
          </Animated.View>
        </View>

        {/* Subtle decorative elements */}
        <View className="absolute top-20 right-8 opacity-5">
          <Ionicons name="leaf-outline" size={24} color="#00623A" />
        </View>
        <View className="absolute bottom-32 left-8 opacity-5">
          <Ionicons name="leaf-outline" size={16} color="#00623A" />
        </View>
        <View className="absolute top-40 left-12 opacity-5">
          <Ionicons name="leaf-outline" size={12} color="#00623A" />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
