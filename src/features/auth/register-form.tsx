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

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const toast = useToast();
  const { t } = useLocalization();

  // Refs for input focus management
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const focusNextField = useCallback(
    (nextFieldRef: React.RefObject<TextInput | null>) => {
      nextFieldRef.current?.focus();
    },
    []
  );

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const success = await register(data.name, data.email, data.password);

      if (success) {
        toast.success("Account created successfully!");
        router.replace("/(app)/(tabs)/catalog");
      } else {
        toast.error("Registration failed", "Please try again");
      }
    } catch (error) {
      toast.error("Registration failed", "Please try again");
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
    <View className="flex-1" style={{ minHeight: 400 }}>
      {/* Input Fields */}
      <View style={{ gap: 16 }}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={nameRef}
              placeholder="Full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="givenName"
              returnKeyType="next"
              onSubmitEditing={() => focusNextField(emailRef)}
              size="lg"
              className="bg-neutral-50 border-0 rounded-2xl text-base py-4 px-5"
            />
          )}
        />

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
              placeholder="Create password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => focusNextField(confirmPasswordRef)}
              size="lg"
              className="bg-neutral-50 border-0 rounded-2xl text-base py-4 px-5"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={confirmPasswordRef}
              placeholder="Confirm password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              size="lg"
              className="bg-neutral-50 border-0 rounded-2xl text-base py-4 px-5"
            />
          )}
        />
      </View>

      {/* Create Account Button */}
      <View style={{ marginTop: 28 }}>
        <PremiumButton
          title="Create Account"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          variant="primary"
        />
      </View>

      {/* Sign In Link */}
      <View
        className="items-center"
        style={{ marginTop: 20, marginBottom: 40 }}
      >
        <Text className="text-neutral-600 text-sm mb-2">
          Already have an account?
        </Text>
        <Link href="/(public)/auth/login" asChild>
          <TouchableOpacity>
            <Text className="text-primary-500 text-base font-medium">
              Sign In
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};
