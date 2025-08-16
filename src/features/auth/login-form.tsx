import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
  TextInput,
} from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input } from "../../shared/ui";
import { useAuth } from "../../shared/hooks";
import { useToast } from "../../shared/ui/toast";
import { useLocalization } from "../../shared/hooks";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();
  const { t } = useLocalization();

  // Refs for input focus management
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo@ifms.com",
      password: "password",
    },
  });

  const focusNextField = useCallback(
    (nextFieldRef: React.RefObject<TextInput | null>) => {
      nextFieldRef.current?.focus();
    },
    []
  );

  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.email, data.password);

      if (success) {
        toast.success("Welcome back!");
        router.replace("/(app)/(tabs)/catalog");
      } else {
        toast.error(
          "Invalid credentials",
          "Please check your email and password"
        );
      }
    } catch (error) {
      toast.error("Login failed", "Please try again");
    }
  };

  // Premium button component
  const PremiumButton = ({
    title,
    onPress,
    loading = false,
    variant = "primary",
  }: {
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: "primary" | "secondary";
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
          disabled={loading}
          className={`flex-row items-center justify-center rounded-2xl py-4 px-8 ${
            isPrimary ? "bg-primary-500" : "bg-neutral-100"
          } ${loading ? "opacity-70" : ""}`}
          style={{
            shadowColor: isPrimary ? "#00623A" : "#000",
            shadowOffset: { width: 0, height: isPressed ? 2 : 6 },
            shadowOpacity: isPressed ? 0.1 : isPrimary ? 0.3 : 0.1,
            shadowRadius: isPressed ? 4 : 12,
            elevation: isPressed ? 2 : 8,
          }}
        >
          {loading && (
            <Ionicons
              name="refresh"
              size={20}
              color={isPrimary ? "white" : "#666"}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            className={`text-lg font-medium tracking-wide ${
              isPrimary ? "text-white" : "text-neutral-600"
            }`}
          >
            {title}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View className="justify-center" style={{ minHeight: 320 }}>
      {/* Input Fields */}
      <View style={{ gap: 16 }}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={emailRef}
              placeholder="Email address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => focusNextField(passwordRef)}
              size="lg"
              className="bg-neutral-50 border-0 rounded-2xl text-base py-4 px-5"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={passwordRef}
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              size="lg"
              className="bg-neutral-50 border-0 rounded-2xl text-base py-4 px-5"
            />
          )}
        />
      </View>

      {/* Sign In Button */}
      <View style={{ marginTop: 28 }}>
        <PremiumButton
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          variant="primary"
        />
      </View>

      {/* Forgot Password */}
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity className="items-center">
          <Text className="text-primary-500 text-sm font-medium">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View
        className="flex-row items-center"
        style={{ marginTop: 24, gap: 16 }}
      >
        <View className="flex-1 h-px bg-neutral-200" />
        <Text className="text-neutral-500 text-sm">or</Text>
        <View className="flex-1 h-px bg-neutral-200" />
      </View>

      {/* Sign Up Link */}
      <View
        className="items-center"
        style={{ marginTop: 20, marginBottom: 20 }}
      >
        <Text className="text-neutral-600 text-sm mb-2">
          Don't have an account?
        </Text>
        <Link href="/(public)/auth/register" asChild>
          <TouchableOpacity>
            <Text className="text-primary-500 text-base font-medium">
              Create Account
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};
