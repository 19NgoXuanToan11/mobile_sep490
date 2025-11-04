import React, { useRef, useCallback } from "react";
import { View, Text, TextInput } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../shared/hooks";
import { useToast } from "../../shared/ui/toast";
import {
  TextField,
  PasswordField,
  PrimaryButton,
  LinkButton,
} from "./components";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email là bắt buộc")
    .email("Vui lòng nhập email hợp lệ"),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();

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
      email: "cus03@email.com",
      password: "123123",
    },
  });

  const focusNextField = useCallback(
    (nextFieldRef: React.RefObject<TextInput | null>) => {
      nextFieldRef.current?.focus();
    },
    []
  );

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        const success = await login(data.email, data.password);

        if (success) {
          toast.success("Chào mừng bạn trở lại!");
          router.replace("/(app)/(tabs)/catalog");
        } else {
          toast.error(
            "Thông tin đăng nhập không hợp lệ",
            "Vui lòng kiểm tra email và mật khẩu"
          );
        }
      } catch (error) {
        toast.error("Đăng nhập thất bại", "Vui lòng thử lại");
      }
    },
    [login, toast]
  );

  const handleRegister = useCallback(() => {
    router.push("/(public)/auth/register");
  }, []);

  return (
    <View style={{ gap: 20 }}>
      {/* Input Fields */}
      <View style={{ gap: 16 }}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
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
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              ref={passwordRef}
              placeholder="Mật khẩu"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />
      </View>

      {/* Sign In Button */}
      <PrimaryButton
        title="Đăng Nhập"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />

      {/* Divider */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          marginTop: 8,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
        <Text style={{ fontSize: 14, color: "#6B7280" }}>hoặc</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
      </View>

      {/* Sign Up Link */}
      <View style={{ alignItems: "center", marginTop: 4 }}>
        <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
          Chưa có tài khoản?
        </Text>
        <LinkButton title="Tạo tài khoản" onPress={handleRegister} />
      </View>
    </View>
  );
};
