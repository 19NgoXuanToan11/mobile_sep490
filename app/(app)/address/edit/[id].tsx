import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card } from "../../../../src/shared/ui";
import { useToast } from "../../../../src/shared/ui/toast";
import { addressesApi } from "../../../../src/shared/data/api";
import { Address } from "../../../../src/types";

const addressSchema = z.object({
  customerName: z.string().min(1, "Vui lòng nhập tên người nhận"),
  phoneNumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  street: z.string().min(1, "Vui lòng nhập địa chỉ chi tiết"),
  ward: z.string().min(1, "Vui lòng nhập phường/xã"),
  province: z.string().min(1, "Vui lòng nhập tỉnh/thành phố"),
  isDefault: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required = false, error, children }) => (
  <View className="mb-6">
    <Text className="text-base font-medium text-neutral-900 mb-2">
      {label} {required && <Text className="text-red-500">*</Text>}
    </Text>
    {children}
    {error && (
      <View className="flex-row items-center mt-2">
        <Ionicons name="warning-outline" size={14} color="#ef4444" />
        <Text className="text-sm text-red-500 ml-1">{error}</Text>
      </View>
    )}
  </View>
);

const CustomTextInput: React.FC<{
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "phone-pad" | "email-address";
}> = ({
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View
        className={`border-2 rounded-2xl px-4 ${multiline ? "py-4" : "py-3.5"
          } bg-white ${isFocused ? "border-primary-500" : "border-neutral-200"}`}
        style={{
          shadowColor: isFocused ? "#00623A" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused ? 0.1 : 0.03,
          shadowRadius: 4,
          elevation: isFocused ? 2 : 1,
        }}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "auto"}
          keyboardType={keyboardType}
          className="text-neutral-900 text-base"
          style={{
            fontSize: 16,
            minHeight: multiline ? 80 : undefined,
            lineHeight: multiline ? undefined : 20,
            paddingVertical: multiline ? undefined : 0,
            includeFontPadding: false,
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    );
  };

export default function EditAddressScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string }>();
  const addressId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: addressDetail } = useQuery({
    queryKey: ["address", addressId],
    enabled: !!addressId,
    queryFn: async () => {
      const res = await addressesApi.getById(addressId!);
      return res.data as Address;
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) =>
      addressesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["address", addressId] });
      toast.success("Thành công", "Địa chỉ đã được cập nhật");
      router.back();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra", "Vui lòng thử lại");
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      street: "",
      ward: "",
      province: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (addressDetail) {
      reset({
        customerName: addressDetail.customerName || addressDetail.name || "",
        phoneNumber: addressDetail.phoneNumber || addressDetail.phone || "",
        street: addressDetail.street || "",
        ward: addressDetail.ward || "",
        province: addressDetail.province || addressDetail.city || "",
        isDefault: addressDetail.isDefault || false,
      });
    }
  }, [addressDetail, reset]);

  const watchedIsDefault = watch("isDefault");

  const onSubmit = (data: AddressFormData) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn cập nhật địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Lưu",
        onPress: () =>
          updateAddressMutation.mutate({
            id: addressId!,
            data: {
              ...data,
              district: data.province, // Use province as district since they are the same level now
            }
          }),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="p-4 space-y-6">
            <Card variant="elevated" padding="lg">
              <View className="space-y-6">
                <View className="flex-row items-center space-x-2 mb-2">
                  <Ionicons name="person-outline" size={20} color="#00623A" />
                  <Text className="text-lg font-semibold text-neutral-900">
                    Thông Tin Liên Hệ
                  </Text>
                </View>

                <FormField
                  label="Tên người nhận"
                  required
                  error={errors.customerName?.message}
                >
                  <Controller
                    control={control}
                    name="customerName"
                    render={({ field: { onChange, value } }) => (
                      <CustomTextInput
                        placeholder="Nhập tên người nhận"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="Số điện thoại"
                  required
                  error={errors.phoneNumber?.message}
                >
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, value } }) => (
                      <CustomTextInput
                        placeholder="Nhập số điện thoại"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="phone-pad"
                      />
                    )}
                  />
                </FormField>
              </View>
            </Card>

            <Card variant="elevated" padding="lg">
              <View className="space-y-6">
                <View className="flex-row items-center space-x-2 mb-2">
                  <Ionicons name="location-outline" size={20} color="#00623A" />
                  <Text className="text-lg font-semibold text-neutral-900">
                    Địa Chỉ Chi Tiết
                  </Text>
                </View>

                <FormField
                  label="Tỉnh/Thành phố"
                  required
                  error={errors.province?.message}
                >
                  <Controller
                    control={control}
                    name="province"
                    render={({ field: { onChange, value } }) => (
                      <CustomTextInput
                        placeholder="Nhập tỉnh/thành phố"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="Phường/Xã"
                  required
                  error={errors.ward?.message}
                >
                  <Controller
                    control={control}
                    name="ward"
                    render={({ field: { onChange, value } }) => (
                      <CustomTextInput
                        placeholder="Nhập phường/xã"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="Địa chỉ cụ thể"
                  required
                  error={errors.street?.message}
                >
                  <Controller
                    control={control}
                    name="street"
                    render={({ field: { onChange, value } }) => (
                      <CustomTextInput
                        placeholder="Số nhà, tên đường..."
                        value={value}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={3}
                      />
                    )}
                  />
                </FormField>
              </View>
            </Card>

            <Card variant="elevated" padding="lg">
              <TouchableOpacity
                onPress={() => setValue("isDefault", !watchedIsDefault)}
                className="flex-row items-center justify-between"
              >
                <View className="flex-row items-center space-x-3 flex-1">
                  <Ionicons name="star-outline" size={20} color="#00623A" />
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-neutral-900">
                      Đặt làm địa chỉ mặc định
                    </Text>
                    <Text className="text-sm text-neutral-600 mt-1">
                      Sử dụng địa chỉ này cho các đơn hàng tiếp theo
                    </Text>
                  </View>
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${watchedIsDefault
                    ? "border-primary-500 bg-primary-500"
                    : "border-neutral-300"
                    }`}
                >
                  {watchedIsDefault && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            </Card>
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0">
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,1)"]}
            className="px-4 py-3 border-t border-neutral-100"
          >
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || updateAddressMutation.isPending}
              className={`rounded-2xl py-4 items-center justify-center ${!isValid || updateAddressMutation.isPending
                ? "bg-neutral-300"
                : "bg-primary-500"
                }`}
              style={{
                shadowColor: "#00623A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: updateAddressMutation.isPending ? 0 : 0.3,
                shadowRadius: 8,
                elevation: updateAddressMutation.isPending ? 0 : 6,
              }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center space-x-2">
                {updateAddressMutation.isPending ? (
                  <>
                    <View className="w-5 h-5 rounded-full animate-spin" />
                    <Text className="text-neutral-500 font-semibold text-lg">
                      Đang lưu...
                    </Text>
                  </>
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Lưu Thay Đổi
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
