import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { addressesApi } from "../../../src/shared/data/api";
import { useToast } from "../../../src/shared/ui/toast";
import { useProvinceData } from "../../../src/shared/hooks";
import {
  LocationPicker,
  AddressFormField,
} from "../../../src/features/address/components";
import {
  validateAddressForm,
  cleanPhoneNumber,
  formatPhoneNumber,
  AddressValidationErrors,
} from "../../../src/shared/utils/addressValidation";

interface AddressFormData {
  customerName: string;
  phoneNumber: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  street: string;
  isDefault: boolean;
}

export default function AddAddressScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    provinces,
    getDistrictsByProvince,
    getWardsByDistrict,
    findProvince,
    findDistrict,
    findWard,
  } = useProvinceData();

  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    customerName: "",
    phoneNumber: "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    street: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<AddressValidationErrors>({});
  const [pickerState, setPickerState] = useState<{
    visible: boolean;
    type: "province" | "district" | "ward" | null;
  }>({
    visible: false,
    type: null,
  });

  // Cascading data
  const availableDistricts = useMemo(
    () => getDistrictsByProvince(formData.provinceCode),
    [formData.provinceCode, getDistrictsByProvince]
  );

  const availableWards = useMemo(
    () => getWardsByDistrict(formData.provinceCode, formData.districtCode),
    [formData.provinceCode, formData.districtCode, getWardsByDistrict]
  );

  // Display names
  const selectedProvinceName = findProvince(formData.provinceCode)?.name || "";
  const selectedDistrictName =
    findDistrict(formData.provinceCode, formData.districtCode)?.name || "";
  const selectedWardName =
    findWard(formData.provinceCode, formData.districtCode, formData.wardCode)
      ?.name || "";

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: addressesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Thành công 🎉", "Địa chỉ đã được thêm");
      router.back();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra", "Vui lòng thử lại");
    },
  });

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleUpdateField = useCallback(
    (field: keyof AddressFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field (only if it's a field that can have errors)
      if (field in errors && errors[field as keyof AddressValidationErrors]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof AddressValidationErrors];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handlePhoneChange = useCallback(
    (text: string) => {
      const cleaned = cleanPhoneNumber(text);
      handleUpdateField("phoneNumber", cleaned);
    },
    [handleUpdateField]
  );

  const handleProvinceSelect = useCallback(
    (item: { code: string; name: string }) => {
      setFormData((prev) => ({
        ...prev,
        provinceCode: item.code,
        districtCode: "", // Reset district
        wardCode: "", // Reset ward
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.provinceCode;
        delete newErrors.districtCode;
        delete newErrors.wardCode;
        return newErrors;
      });
    },
    []
  );

  const handleDistrictSelect = useCallback(
    (item: { code: string; name: string }) => {
      setFormData((prev) => ({
        ...prev,
        districtCode: item.code,
        wardCode: "", // Reset ward
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.districtCode;
        delete newErrors.wardCode;
        return newErrors;
      });
    },
    []
  );

  const handleWardSelect = useCallback(
    (item: { code: string; name: string }) => {
      handleUpdateField("wardCode", item.code);
    },
    [handleUpdateField]
  );

  const openPicker = useCallback(
    (type: "province" | "district" | "ward") => {
      setPickerState({ visible: true, type });
    },
    []
  );

  const closePicker = useCallback(() => {
    setPickerState({ visible: false, type: null });
  }, []);

  const handleSubmit = useCallback(() => {
    // Validate
    const validationErrors = validateAddressForm({
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      provinceCode: formData.provinceCode,
      districtCode: formData.districtCode,
      wardCode: formData.wardCode,
      street: formData.street,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Thông tin chưa đầy đủ", "Vui lòng kiểm tra lại các trường");
      // Scroll to first error
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // Submit
    const province = findProvince(formData.provinceCode);
    const district = findDistrict(formData.provinceCode, formData.districtCode);
    const ward = findWard(
      formData.provinceCode,
      formData.districtCode,
      formData.wardCode
    );

    createAddressMutation.mutate({
      customerName: formData.customerName.trim(),
      phoneNumber: formData.phoneNumber,
      province: province?.name || "",
      district: district?.name || "",
      ward: ward?.name || "",
      street: formData.street.trim(),
      isDefault: formData.isDefault,
    });
  }, [formData, findProvince, findDistrict, findWard, createAddressMutation]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm Địa Chỉ</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Contact Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={22} color="#00A86B" />
              <Text style={styles.cardTitle}>Thông Tin Liên Hệ</Text>
            </View>

            <AddressFormField
              label="Tên người nhận"
              required
              placeholder="Nhập tên người nhận"
              value={formData.customerName}
              onChangeText={(text) => handleUpdateField("customerName", text)}
              error={errors.customerName}
              maxLength={100}
            />

            <AddressFormField
              label="Số điện thoại"
              required
              placeholder="Nhập số điện thoại"
              value={formatPhoneNumber(formData.phoneNumber)}
              onChangeText={handlePhoneChange}
              error={errors.phoneNumber}
              keyboardType="phone-pad"
              maxLength={13}
            />
          </View>

          {/* Address Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={22} color="#00A86B" />
              <Text style={styles.cardTitle}>Địa Chỉ Chi Tiết</Text>
            </View>

            <AddressFormField
              label="Tỉnh/Thành phố"
              required
              placeholder="Chọn Tỉnh/Thành phố"
              value={selectedProvinceName}
              onPress={() => openPicker("province")}
              error={errors.provinceCode}
              editable={false}
            />

            <AddressFormField
              label="Quận/Huyện"
              required
              placeholder="Chọn Quận/Huyện"
              value={selectedDistrictName}
              onPress={() => openPicker("district")}
              error={errors.districtCode}
              disabled={!formData.provinceCode}
              editable={false}
            />

            <AddressFormField
              label="Phường/Xã"
              required
              placeholder="Chọn Phường/Xã"
              value={selectedWardName}
              onPress={() => openPicker("ward")}
              error={errors.wardCode}
              disabled={!formData.districtCode}
              editable={false}
            />

            <AddressFormField
              label="Địa chỉ cụ thể"
              required
              placeholder="Số nhà, tên đường..."
              value={formData.street}
              onChangeText={(text) => handleUpdateField("street", text)}
              error={errors.street}
              multiline
              numberOfLines={3}
              maxLength={255}
            />
          </View>

          {/* Default Address Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              handleUpdateField("isDefault", !formData.isDefault)
            }
            activeOpacity={0.7}
          >
            <View style={styles.defaultContainer}>
              <View style={styles.defaultLeft}>
                <Ionicons
                  name="star-outline"
                  size={22}
                  color="#00A86B"
                  style={styles.defaultIcon}
                />
                <View style={styles.defaultTextContainer}>
                  <Text style={styles.defaultTitle}>
                    Đặt làm địa chỉ mặc định
                  </Text>
                  <Text style={styles.defaultSubtitle}>
                    Sử dụng địa chỉ này cho các đơn hàng tiếp theo
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.checkbox,
                  formData.isDefault && styles.checkboxActive,
                ]}
              >
                {formData.isDefault && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.footer}>
          <LinearGradient
            colors={["rgba(249,250,251,0.98)", "rgba(249,250,251,1)"]}
            style={styles.footerGradient}
          >
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={createAddressMutation.isPending}
              style={[
                styles.submitButton,
                createAddressMutation.isPending && styles.submitButtonDisabled,
              ]}
              activeOpacity={0.8}
            >
              {createAddressMutation.isPending ? (
                <LinearGradient
                  colors={["#D1D5DB", "#D1D5DB"]}
                  style={styles.submitGradient}
                >
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitText}>Đang lưu...</Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={["#00A86B", "#009E60"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Lưu Địa Chỉ</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>

      {/* Location Pickers */}
      <LocationPicker
        visible={pickerState.visible && pickerState.type === "province"}
        title="Chọn Tỉnh/Thành phố"
        items={provinces.map((p) => ({ code: p.code, name: p.name }))}
        selectedCode={formData.provinceCode}
        onSelect={handleProvinceSelect}
        onClose={closePicker}
        searchPlaceholder="Tìm tỉnh/thành phố..."
      />

      <LocationPicker
        visible={pickerState.visible && pickerState.type === "district"}
        title="Chọn Quận/Huyện"
        items={availableDistricts.map((d) => ({ code: d.code, name: d.name }))}
        selectedCode={formData.districtCode}
        onSelect={handleDistrictSelect}
        onClose={closePicker}
        searchPlaceholder="Tìm quận/huyện..."
      />

      <LocationPicker
        visible={pickerState.visible && pickerState.type === "ward"}
        title="Chọn Phường/Xã"
        items={availableWards.map((w) => ({ code: w.code, name: w.name }))}
        selectedCode={formData.wardCode}
        onSelect={handleWardSelect}
        onClose={closePicker}
        searchPlaceholder="Tìm phường/xã..."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 10,
  },
  defaultContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  defaultLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  defaultIcon: {
    marginRight: 12,
  },
  defaultTextContainer: {
    flex: 1,
  },
  defaultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  defaultSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  checkboxActive: {
    backgroundColor: "#00A86B",
    borderColor: "#00A86B",
  },
  bottomSpacer: {
    height: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerGradient: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  submitButton: {
    borderRadius: 26,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#00A86B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
