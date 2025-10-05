import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LoginForm } from "../../../src/features/auth";
import { useLocalization } from "../../../src/shared/hooks";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Logo component with subtle animation
const Logo = ({ scale = 1 }: { scale?: number }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: scale,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
      className="items-center"
    >
      <View
        className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center"
        style={{
          shadowColor: "#00623A",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Ionicons name="leaf" size={28} color="white" />
      </View>
    </Animated.View>
  );
};

export default function LoginScreen() {
  const { t } = useLocalization();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const containerTranslateY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        const keyboardHeight = e.duration || 250;

        Animated.parallel([
          Animated.timing(containerTranslateY, {
            toValue: SCREEN_HEIGHT > 700 ? -40 : -60,
            duration: keyboardHeight,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 0.7,
            duration: keyboardHeight,
            useNativeDriver: true,
          }),
          Animated.timing(headerOpacity, {
            toValue: 0.5,
            duration: keyboardHeight,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        setKeyboardVisible(false);
        const keyboardHeight = e.duration || 250;

        Animated.parallel([
          Animated.timing(containerTranslateY, {
            toValue: 0,
            duration: keyboardHeight,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: keyboardHeight,
            useNativeDriver: true,
          }),
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: keyboardHeight,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Subtle gradient background */}
      <LinearGradient
        colors={["#f0f9f5", "#ffffff", "#ffffff"]}
        className="absolute inset-0"
      />

      {/* Floating decorative elements */}
      <View className="absolute top-20 right-8 opacity-5">
        <Ionicons name="leaf-outline" size={24} color="#00623A" />
      </View>
      <View className="absolute bottom-32 left-8 opacity-5">
        <Ionicons name="leaf-outline" size={16} color="#00623A" />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View
          className="flex-1 px-6 justify-center"
          style={{
            transform: [{ translateY: containerTranslateY }],
          }}
        >
          {/* Logo */}
          <Animated.View
            className="items-center"
            style={{
              marginBottom: isKeyboardVisible ? 16 : 24,
              transform: [{ scale: logoScale }],
            }}
          >
            <Logo />
          </Animated.View>

          {/* Welcome Section */}
          <Animated.View
            style={{
              opacity: Animated.multiply(fadeAnim, headerOpacity),
              transform: [{ translateY: slideAnim }],
              marginBottom: isKeyboardVisible ? 20 : 32,
            }}
          >
            <Text className="text-3xl font-light text-neutral-900 text-center mb-2 tracking-tight">
              Chào Mừng Trở Lại
            </Text>
            <Text className="text-base text-neutral-600 text-center font-light">
              Đăng nhập vào tài khoản của bạn
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <LoginForm />
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
