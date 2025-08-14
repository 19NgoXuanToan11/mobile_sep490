import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const success = await register(data.name, data.email, data.password);

      if (success) {
        toast.success("Account created successfully!");
        router.replace("/(app)/(tabs)/home");
      } else {
        toast.error("Registration failed", "Please try again");
      }
    } catch (error) {
      toast.error("Registration failed", "Please try again");
    }
  };

  return (
    <View className="space-y-6">
      <View className="space-y-4">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("auth.name")}
              placeholder="Enter your full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              leftIcon="person-outline"
              autoCapitalize="words"
              autoComplete="name"
              required
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("auth.email")}
              placeholder="your@email.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              required
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("auth.password")}
              placeholder="Create a password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              leftIcon="lock-closed-outline"
              secureTextEntry
              autoComplete="new-password"
              required
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t("auth.confirmPassword")}
              placeholder="Confirm your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              leftIcon="lock-closed-outline"
              secureTextEntry
              autoComplete="new-password"
              required
            />
          )}
        />
      </View>

      <View className="space-y-4">
        <Button
          title={t("auth.signUp")}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
        />

        {/* Terms and Privacy */}
        <Text className="text-xs text-neutral-500 text-center leading-5">
          By creating an account, you agree to our{" "}
          <Text className="text-primary-500">Terms of Service</Text> and{" "}
          <Text className="text-primary-500">Privacy Policy</Text>
        </Text>
      </View>

      <View className="flex-row items-center justify-center space-x-2">
        <Text className="text-neutral-600 text-sm">
          {t("auth.alreadyHaveAccount")}
        </Text>
        <Link href="/(public)/auth/login" asChild>
          <TouchableOpacity>
            <Text className="text-primary-500 text-sm font-medium">
              {t("auth.signIn")}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};
