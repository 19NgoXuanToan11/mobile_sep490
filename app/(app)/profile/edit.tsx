import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../src/shared/hooks";
import { profileApi } from "../../../src/shared/data/api";
import {
  AvatarEditCard,
  FormInput,
  GenderPicker,
  SaveButton,
  Toast,
} from "../../../src/features/profile/components";
import { useToast } from "../../../src/features/profile/hooks/useToast";

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
  const { toast, showToast, hideToast } = useToast();
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
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
    }

    if (formData.address && formData.address.length > 255) {
      newErrors.address = "Địa chỉ không được vượt quá 255 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast("Vui lòng kiểm tra lại thông tin", "error");
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
        showToast("Cập nhật thành công 🎉", "success");
        // Wait for toast to show before navigating back
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        showToast(
          response.message || "Không thể cập nhật, vui lòng thử lại",
          "error"
        );
      }
    } catch (error) {
      showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = useCallback(async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showToast("Cần quyền truy cập thư viện ảnh", "error");
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
      showToast("Ảnh đã được chọn", "success");
    }
  }, [showToast]);

  const updateField = useCallback(
    (field: keyof EditProfileForm, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleGenderSelect = useCallback(
    (value: number) => {
      updateField("gender", value);
      setShowGenderPicker(false);
    },
    [updateField]
  );

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>

          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          {/* Avatar Section */}
          <AvatarEditCard
            fullName={formData.name}
            avatarUri={formData.avatar}
            onPress={handlePickImage}
          />

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

            <View style={styles.formContent}>
              {/* Name Input */}
              <FormInput
                ref={nameRef}
                label="Họ và tên"
                icon="person-outline"
                placeholder="Nhập họ và tên"
                value={formData.name}
                onChangeText={(text) => updateField("name", text)}
                error={errors.name}
                required
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => focusNextField(phoneRef)}
              />

              {/* Email Input (Disabled) */}
              <FormInput
                label="Email"
                icon="mail-outline"
                placeholder="Email đăng nhập"
                value={formData.email}
                disabled
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Phone Input */}
              <FormInput
                ref={phoneRef}
                label="Số điện thoại"
                icon="call-outline"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChangeText={(text) => updateField("phone", text)}
                error={errors.phone}
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="next"
                onSubmitEditing={() => focusNextField(addressRef)}
              />

              {/* Address Input */}
              <FormInput
                ref={addressRef}
                label="Địa chỉ"
                icon="location-outline"
                placeholder="Nhập địa chỉ (tối đa 255 ký tự)"
                value={formData.address}
                onChangeText={(text) => updateField("address", text)}
                error={errors.address}
                multiline
                numberOfLines={3}
                maxLength={255}
                returnKeyType="done"
              />

              {/* Gender Picker */}
              <View style={styles.genderContainer}>
                <Text style={styles.genderLabel}>Giới tính</Text>
                <TouchableOpacity
                  onPress={() => setShowGenderPicker(true)}
                  activeOpacity={0.7}
                  style={styles.genderButton}
                >
                  <View style={styles.genderButtonContent}>
                    <Ionicons
                      name="transgender-outline"
                      size={20}
                      color="#6B7280"
                      style={styles.genderIcon}
                    />
                    <Text style={styles.genderValue}>
                      {getGenderLabel(formData.gender)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomButtonContainer}>
          <SaveButton
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Gender Picker Modal */}
      <GenderPicker
        visible={showGenderPicker}
        selectedValue={formData.gender}
        onSelect={handleGenderSelect}
        onClose={() => setShowGenderPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formSection: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  formContent: {
    gap: 4,
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  genderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  genderButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  genderIcon: {
    marginRight: 10,
  },
  genderValue: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
    letterSpacing: 0.3,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
