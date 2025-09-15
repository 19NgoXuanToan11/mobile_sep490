import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RegisterForm } from "../../../src/features/auth";
import { useLocalization } from "../../../src/shared/hooks";

// Logo component with subtle animation
const Logo = () => {
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
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
      className="items-center mb-8"
    >
      <View
        className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center mb-4"
        style={{
          shadowColor: "#00623A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <Ionicons name="leaf" size={32} color="white" />
      </View>
    </Animated.View>
  );
};

export default function RegisterScreen() {
  const { t } = useLocalization();
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
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Subtle gradient background */}
      <LinearGradient
        colors={["#f0f9f5", "#ffffff", "#ffffff"]}
        className="absolute inset-0"
      />

      {/* Floating decorative elements */}
      <View className="absolute top-20 left-8 opacity-5">
        <Ionicons name="bag-outline" size={20} color="#00623A" />
      </View>
      <View className="absolute bottom-32 right-8 opacity-5">
        <Ionicons name="leaf-outline" size={16} color="#00623A" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 py-4">
              {/* Logo */}
              <View
                className="items-center"
                style={{ marginTop: 40, marginBottom: 20 }}
              >
                <Logo />
              </View>

              {/* Welcome Section */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
                className="mb-6"
              >
                <Text className="text-3xl font-light text-neutral-900 text-center mb-2 tracking-tight">
                  Tạo Tài Khoản
                </Text>
                <Text className="text-base text-neutral-600 text-center font-light">
                  Tham gia và bắt đầu mua sắm
                </Text>
              </Animated.View>

              {/* Form */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
                className="flex-1"
              >
                <RegisterForm />
              </Animated.View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
