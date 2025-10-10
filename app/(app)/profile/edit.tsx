import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Button, Card, Input } from "../../../src/shared/ui";
import { useAuth } from "../../../src/shared/hooks";
import { User } from "../../../src/types";
import { profileApi } from "../../../src/shared/data/api";

interface EditProfileForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: number; // 0: Không xác định, 1: Nam, 2: Nữ
  avatar?: string;
}

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditProfileForm>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    gender: 0,
    avatar: user?.avatar,
  });
  const [errors, setErrors] = useState<Partial<EditProfileForm>>({});
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Refs for input focus management
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);

  const focusNextField = useCallback(
    (nextFieldRef: React.RefObject<TextInput | null>) => {
      nextFieldRef.current?.focus();
    },
    []
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<EditProfileForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên không được để trống";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (formData.address && formData.address.length > 255) {
      newErrors.address = "Địa chỉ không được vượt quá 255 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Call real API to update profile
      const response = await profileApi.updateProfile({
        fullname: formData.name,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        images: formData.avatar,
      });

      if (response.success) {
        Alert.alert(
          "Thành công",
          "Thông tin cá nhân đã được cập nhật thành công",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Có lỗi xảy ra khi cập nhật thông tin"
        );
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Thông báo",
        "Ứng dụng cần quyền truy cập thư viện ảnh để đổi avatar"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData((prev) => ({
        ...prev,
        avatar: result.assets[0].uri,
      }));
    }
  };

  const updateField = (
    field: keyof EditProfileForm,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getGenderLabel = (value: number): string => {
    switch (value) {
      case 1:
        return "Nam";
      case 2:
        return "Nữ";
      default:
        return "Không xác định";
    }
  };

  const handleGenderSelect = (value: number) => {
    updateField("gender", value);
    setShowGenderPicker(false);
  };

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileApi.getProfile();
        if (response.success && response.data) {
          setFormData({
            name: response.data.fullname || user?.name || "",
            email: response.data.email || user?.email || "",
            phone: response.data.phone || user?.phone || "",
            address: response.data.address || "",
            gender: response.data.gender ? Number(response.data.gender) : 0,
            avatar: response.data.images || user?.avatar,
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [user]);

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <SafeAreaView
        edges={["top"]}
        className="bg-white border-b border-neutral-200"
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-neutral-900">
            Chỉnh sửa thông tin
          </Text>
          <View className="w-8" />
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Avatar Section */}
        <Card className="mx-4 mt-6" padding="lg" variant="elevated">
          <View className="items-center space-y-4">
            <View className="relative">
              <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  // In a real app, you'd use an Image component here
                  <Text className="text-3xl font-bold text-primary-600">
                    {formData.name.charAt(0).toUpperCase() || "N"}
                  </Text>
                ) : (
                  <Text className="text-3xl font-bold text-primary-600">
                    {formData.name.charAt(0).toUpperCase() || "N"}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handlePickImage}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full items-center justify-center"
              >
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handlePickImage}>
              <Text className="text-primary-600 font-medium">
                Thay đổi ảnh đại diện
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Form Section */}
        <Card className="mx-4 mt-6" padding="lg" variant="elevated">
          <Text className="text-lg font-semibold text-neutral-900 mb-6">
            Thông tin cá nhân
          </Text>

          <View className="space-y-6">
            <Input
              ref={nameRef}
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              value={formData.name}
              onChangeText={(text) => updateField("name", text)}
              error={errors.name}
              required
              leftIcon="person-outline"
              autoCapitalize="words"
              autoComplete="name"
              size="lg"
              returnKeyType="next"
              onSubmitEditing={() => focusNextField(emailRef)}
            />

            <Input
              ref={emailRef}
              label="Email"
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              error={errors.email}
              required
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              size="lg"
              returnKeyType="next"
              onSubmitEditing={() => focusNextField(phoneRef)}
            />

            <Input
              ref={phoneRef}
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChangeText={(text) => updateField("phone", text)}
              error={errors.phone}
              required
              leftIcon="call-outline"
              keyboardType="phone-pad"
              autoComplete="tel"
              size="lg"
              returnKeyType="next"
              onSubmitEditing={() => focusNextField(addressRef)}
            />

            <Input
              ref={addressRef}
              label="Địa chỉ"
              placeholder="Nhập địa chỉ (tối đa 255 ký tự)"
              value={formData.address}
              onChangeText={(text) => updateField("address", text)}
              error={errors.address}
              leftIcon="location-outline"
              multiline
              numberOfLines={3}
              size="lg"
              maxLength={255}
              returnKeyType="done"
            />

            <View>
              <Text className="text-sm font-medium text-neutral-700 mb-2">
                Giới tính
              </Text>
              <TouchableOpacity
                onPress={() => setShowGenderPicker(true)}
                className="border border-neutral-300 rounded-lg bg-white px-4 py-3 flex-row items-center justify-between"
              >
                <Text className="text-base text-neutral-900">
                  {getGenderLabel(formData.gender)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Save Button */}
        <View className="mx-4 mt-8 mb-8">
          <Button
            title={loading ? "Đang lưu..." : "Lưu thay đổi"}
            onPress={handleSave}
            disabled={loading}
            fullWidth
            size="lg"
            variant="primary"
          />
        </View>
      </ScrollView>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowGenderPicker(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="px-4 py-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-neutral-900">
                  Chọn giới tính
                </Text>
                <TouchableOpacity
                  onPress={() => setShowGenderPicker(false)}
                  className="p-2"
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="space-y-2">
                <TouchableOpacity
                  onPress={() => handleGenderSelect(0)}
                  className={`p-4 rounded-lg border ${
                    formData.gender === 0
                      ? "bg-primary-50 border-primary-600"
                      : "bg-white border-neutral-200"
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      formData.gender === 0
                        ? "text-primary-600"
                        : "text-neutral-900"
                    }`}
                  >
                    Không xác định
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleGenderSelect(1)}
                  className={`p-4 rounded-lg border ${
                    formData.gender === 1
                      ? "bg-primary-50 border-primary-600"
                      : "bg-white border-neutral-200"
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      formData.gender === 1
                        ? "text-primary-600"
                        : "text-neutral-900"
                    }`}
                  >
                    Nam
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleGenderSelect(2)}
                  className={`p-4 rounded-lg border ${
                    formData.gender === 2
                      ? "bg-primary-50 border-primary-600"
                      : "bg-white border-neutral-200"
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      formData.gender === 2
                        ? "text-primary-600"
                        : "text-neutral-900"
                    }`}
                  >
                    Nữ
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
