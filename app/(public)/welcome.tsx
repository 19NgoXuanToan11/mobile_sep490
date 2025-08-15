import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from "react-native";
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
    >
      <Text className="text-4xl font-light text-neutral-900 text-center">
        Welcome
      </Text>
      <Text className="text-lg text-neutral-600 text-center max-w-xs leading-7">
        Farm fresh, delivered with care
      </Text>
    </Animated.View>
  );
};

// Continue button component with enhanced interactions
const ContinueButton = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 150,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 150,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Add a slight delay for the press animation to complete
    setTimeout(() => {
      router.replace("/(public)/onboarding");
    }, 100);
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="bg-primary-500 rounded-full px-10 py-4"
        style={{
          shadowColor: "#00623A",
          shadowOffset: { width: 0, height: isPressed ? 2 : 6 },
          shadowOpacity: isPressed ? 0.2 : 0.4,
          shadowRadius: isPressed ? 4 : 12,
          elevation: isPressed ? 4 : 10,
        }}
      >
        <Text className="text-white text-lg font-medium tracking-wide">
          Continue
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default function WelcomeScreen() {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

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
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Subtle gradient background */}
      <LinearGradient
        colors={["#f0f9f5", "#ffffff", "#ffffff"]}
        className="absolute inset-0"
      />

      {/* Floating particles */}
      <FloatingParticles />

      <View className="flex-1 items-center justify-center px-8">
        {/* Logo section */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
          className="mb-16"
        >
          <Logo size={120} />
        </Animated.View>

        {/* Welcome text */}
        <View className="mb-20">
          <WelcomeText />
        </View>

        {/* Continue button */}
        <ContinueButton />
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
    </SafeAreaView>
  );
}
