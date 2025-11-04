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

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
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
          toast.error(
            "Đăng ký thất bại",
            "Email này đã được sử dụng hoặc thông tin không hợp lệ"
          );
        }
      } catch (error) {
        toast.error(
          "Đăng ký thất bại",
          "Vui lòng kiểm tra kết nối mạng và thử lại"
        );
      }
    },
    [register, toast]
  );

  const handleLogin = useCallback(() => {
    router.push("/(public)/auth/login");
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
              placeholder="Tạo mật khẩu"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => focusNextField(confirmPasswordRef)}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              ref={confirmPasswordRef}
              placeholder="Xác nhận mật khẩu"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />
      </View>

      {/* Create Account Button */}
      <PrimaryButton
        title="Tạo Tài Khoản"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />

      {/* Sign In Link */}
      <View style={{ alignItems: "center", marginTop: 4 }}>
        <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
          Đã có tài khoản?
        </Text>
        <LinkButton title="Đăng nhập" onPress={handleLogin} />
      </View>
    </View>
  );
};
