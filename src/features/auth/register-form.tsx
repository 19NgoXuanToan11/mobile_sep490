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
    email: z
      .string()
      .min(1, "Email là bắt buộc")
      .email("Vui lòng nhập email hợp lệ"),
    password: z
      .string()
      .min(1, "Mật khẩu là bắt buộc")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const toast = useToast();
  const { t } = useLocalization();
  const [serverError, setServerError] = useState<string | null>(null);

  // Refs for input focus management
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
      setServerError(null);
      const success = await register(
        data.email,
        data.password,
        data.confirmPassword
      );

      if (success) {
        toast.success(
          "Tạo tài khoản thành công!",
          "Chào mừng bạn đến với IFMS"
        );
        router.replace("/(app)/(tabs)/catalog");
      } else {
        setServerError("Email này đã được sử dụng hoặc thông tin không hợp lệ");
        toast.error(
          "Đăng ký thất bại",
          "Vui lòng kiểm tra thông tin và thử lại"
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi không mong muốn";
      setServerError(errorMessage);
      toast.error(
        "Đăng ký thất bại",
        "Vui lòng kiểm tra kết nối mạng và thử lại"
      );
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
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Start rotation animation when loading
    React.useEffect(() => {
      if (loading) {
        const rotateAnimation = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        );
        rotateAnimation.start();
        return () => rotateAnimation.stop();
      }
    }, [loading, rotateAnim]);

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
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
                marginRight: 8,
              }}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={isPrimary ? "white" : "#666"}
              />
            </Animated.View>
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
      {/* Server Error */}
      {serverError && (
        <View className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <View className="flex-row items-center">
            <Ionicons
              name="alert-circle"
              size={20}
              color="#DC2626"
              style={{ marginRight: 8 }}
            />
            <Text className="text-red-600 text-sm font-medium flex-1">
              {serverError}
            </Text>
          </View>
        </View>
      )}

      {/* Input Fields */}
      <View style={{ gap: 18 }}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={emailRef}
              placeholder="Địa chỉ email"
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
              className="bg-neutral-50 border-0 rounded-2xl text-base py-4 px-5 font-normal"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={passwordRef}
              placeholder="Tạo mật khẩu"
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
              className="bg-neutral-50 border-0 rounded-2xl text-base py-4 px-5 font-normal"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              ref={confirmPasswordRef}
              placeholder="Xác nhận mật khẩu"
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
              className="bg-neutral-50 border-0 rounded-2xl text-base py-4 px-5 font-normal"
            />
          )}
        />
      </View>

      {/* Create Account Button */}
      <View style={{ marginTop: 32 }}>
        <PremiumButton
          title="Tạo Tài Khoản"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          variant="primary"
        />
      </View>

      {/* Sign In Link */}
      <View
        className="items-center"
        style={{ marginTop: 14, marginBottom: 32 }}
      >
        <View className="flex-row items-center gap-1">
          <Text className="text-neutral-600 text-sm">Đã có tài khoản?</Text>
          <Link href="/(public)/auth/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary-500 text-sm font-medium ml-1">
                Đăng nhập
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
};
