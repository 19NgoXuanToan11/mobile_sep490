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

  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.email, data.password);

      if (success) {
        toast.success(t("auth.welcomeBack"));
        router.replace("/(app)/(tabs)/home");
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

  return (
    <View className="space-y-6">
      <View className="space-y-4">
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
              placeholder="Enter your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              leftIcon="lock-closed-outline"
              secureTextEntry
              autoComplete="password"
              required
            />
          )}
        />
      </View>

      <View className="space-y-4">
        <Button
          title={t("auth.signIn")}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
        />

        <TouchableOpacity className="items-center">
          <Text className="text-primary-500 text-sm">
            {t("auth.forgotPassword")}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-center space-x-2">
        <Text className="text-neutral-600 text-sm">
          {t("auth.dontHaveAccount")}
        </Text>
        <Link href="/(public)/auth/register" asChild>
          <TouchableOpacity>
            <Text className="text-primary-500 text-sm font-medium">
              {t("auth.signUp")}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Demo credentials hint */}
      <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <Text className="text-blue-800 text-sm font-medium mb-2">
          Demo Credentials:
        </Text>
        <Text className="text-blue-700 text-sm">Email: demo@ifms.com</Text>
        <Text className="text-blue-700 text-sm">Password: password</Text>
      </View>
    </View>
  );
};
