import React, { useRef, useCallback, useState } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Pressable,
} from "react-native";
import { Stack, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    changePasswordSchema,
    type ChangePasswordFormData,
} from "../../../src/features/profile/schemas/changePasswordSchema";
import { useChangePassword } from "../../../src/features/profile/hooks/useChangePassword";
import { PasswordField } from "../../../src/features/auth/components/PasswordField";
import { PasswordStrengthHint } from "../../../src/features/profile/components/PasswordStrengthHint";

/**
 * ChangePasswordScreen - Apple Premium Style
 * Clean, performant, with smooth animations (120-160ms)
 */
export default function ChangePasswordScreen() {
    const insets = useSafeAreaInsets();
    const changePassword = useChangePassword();

    // Refs for focus management
    const oldPasswordRef = useRef<TextInput>(null);
    const newPasswordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    // Local state for password strength display
    const [newPasswordValue, setNewPasswordValue] = useState("");

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange", // Real-time validation
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const focusNextField = useCallback(
        (nextFieldRef: React.RefObject<TextInput | null>) => {
            setTimeout(() => nextFieldRef.current?.focus(), 100);
        },
        []
    );

    const onSubmit = useCallback(
        (data: ChangePasswordFormData) => {
            if (changePassword.isPending) return; // Anti-double-submit

            changePassword.mutate({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            });
        },
        [changePassword]
    );

    const isSubmitDisabled = !isValid || changePassword.isPending;

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Đổi mật khẩu",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: "600",
                        color: "#111827",
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            style={{ marginLeft: Platform.OS === "ios" ? 0 : 8 }}
                        >
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: "#FFFFFF",
                    },
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1, backgroundColor: "#F9FAFB" }}
            >
                <ScrollView
                    contentContainerStyle={{
                        paddingTop: 24,
                        paddingHorizontal: 20,
                        paddingBottom: Math.max(insets.bottom, 24) + 80,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Form Card */}
                    <View
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: 20,
                            padding: 24,
                            shadowColor: "#000000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 12,
                            elevation: 3,
                            gap: 20,
                        }}
                    >
                        {/* Old Password */}
                        <View>
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "#374151",
                                    marginBottom: 8,
                                }}
                            >
                                Mật khẩu hiện tại
                            </Text>
                            <Controller
                                control={control}
                                name="oldPassword"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <PasswordField
                                        ref={oldPasswordRef}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.oldPassword?.message}
                                        returnKeyType="next"
                                        onSubmitEditing={() => focusNextField(newPasswordRef)}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        textContentType="password"
                                    />
                                )}
                            />
                        </View>

                        {/* New Password */}
                        <View>
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "#374151",
                                    marginBottom: 8,
                                }}
                            >
                                Mật khẩu mới
                            </Text>
                            <Controller
                                control={control}
                                name="newPassword"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <>
                                        <PasswordField
                                            ref={newPasswordRef}
                                            placeholder="Nhập mật khẩu mới"
                                            value={value}
                                            onChangeText={(text) => {
                                                onChange(text);
                                                setNewPasswordValue(text);
                                            }}
                                            onBlur={onBlur}
                                            error={errors.newPassword?.message}
                                            returnKeyType="next"
                                            onSubmitEditing={() => focusNextField(confirmPasswordRef)}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            textContentType="newPassword"
                                        />
                                        {/* Password Strength Hint */}
                                        <PasswordStrengthHint password={newPasswordValue} />
                                    </>
                                )}
                            />

                            {/* Password Requirements Hint */}
                            {!errors.newPassword && (
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: "#6B7280",
                                        marginTop: 8,
                                        lineHeight: 16,
                                    }}
                                >
                                    Tối thiểu 8 ký tự, gồm ít nhất 1 chữ cái và 1 số
                                </Text>
                            )}
                        </View>

                        {/* Confirm Password */}
                        <View>
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "#374151",
                                    marginBottom: 8,
                                }}
                            >
                                Xác nhận mật khẩu mới
                            </Text>
                            <Controller
                                control={control}
                                name="confirmPassword"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <PasswordField
                                        ref={confirmPasswordRef}
                                        placeholder="Nhập lại mật khẩu mới"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.confirmPassword?.message}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSubmit(onSubmit)}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        textContentType="newPassword"
                                    />
                                )}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Submit Button - Fixed at Bottom */}
                <View
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        paddingHorizontal: 20,
                        paddingBottom: Math.max(insets.bottom, 16),
                        paddingTop: 16,
                        backgroundColor: "#FFFFFF",
                        borderTopWidth: 1,
                        borderTopColor: "#E5E7EB",
                        shadowColor: "#000000",
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <Pressable
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitDisabled}
                        style={({ pressed }) => ({
                            height: 52,
                            borderRadius: 26,
                            backgroundColor: isSubmitDisabled ? "#D1D5DB" : "#00A86B",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            shadowColor: isSubmitDisabled ? "transparent" : "#00A86B",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isSubmitDisabled ? 0 : 0.2,
                            shadowRadius: 8,
                            elevation: isSubmitDisabled ? 0 : 4,
                            transform: [{ scale: pressed && !isSubmitDisabled ? 0.98 : 1 }],
                        })}
                    >
                        {changePassword.isPending && (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        )}
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: "#FFFFFF",
                                letterSpacing: 0.3,
                            }}
                        >
                            {changePassword.isPending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}

