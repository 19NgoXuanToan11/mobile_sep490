/**
 * Address & Phone Validation Utilities
 * Apple Premium - Vietnam specifics
 */

/**
 * Remove Vietnamese diacritics for search
 */
export function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Format phone number for display (add spaces)
 * Example: 0786485999 → 078 648 5999
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return cleaned;
}

/**
 * Validate Vietnamese phone number
 * Rules:
 * - Starts with 0
 * - 9-11 digits total
 * - Valid prefixes: 03, 05, 07, 08, 09
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");

  // Check length
  if (cleaned.length < 9 || cleaned.length > 11) {
    return false;
  }

  // Must start with 0
  if (!cleaned.startsWith("0")) {
    return false;
  }

  // Check valid Vietnamese prefixes
  const validPrefixes = ["03", "05", "07", "08", "09"];
  const prefix = cleaned.slice(0, 2);

  return validPrefixes.includes(prefix);
}

/**
 * Get phone validation error message
 */
export function getPhoneErrorMessage(phone: string): string | null {
  if (!phone || phone.trim() === "") {
    return "Vui lòng nhập số điện thoại";
  }

  const cleaned = phone.replace(/\D/g, "");

  if (!cleaned.startsWith("0")) {
    return "Số điện thoại phải bắt đầu bằng 0";
  }

  if (cleaned.length < 9) {
    return "Số điện thoại phải có ít nhất 9 số";
  }

  if (cleaned.length > 11) {
    return "Số điện thoại không được quá 11 số";
  }

  const validPrefixes = ["03", "05", "07", "08", "09"];
  const prefix = cleaned.slice(0, 2);

  if (!validPrefixes.includes(prefix)) {
    return "Số điện thoại không hợp lệ";
  }

  return null;
}

/**
 * Auto-format phone as user types
 * Returns cleaned digits only (for storage)
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Validate full address form
 */
export interface AddressFormData {
  customerName: string;
  phoneNumber: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  street: string;
}

export interface AddressValidationErrors {
  customerName?: string;
  phoneNumber?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  street?: string;
}

export function validateAddressForm(
  data: Partial<AddressFormData>
): AddressValidationErrors {
  const errors: AddressValidationErrors = {};

  // Customer name
  if (!data.customerName || data.customerName.trim() === "") {
    errors.customerName = "Vui lòng nhập tên người nhận";
  } else if (data.customerName.trim().length < 2) {
    errors.customerName = "Tên phải có ít nhất 2 ký tự";
  }

  // Phone number
  const phoneError = getPhoneErrorMessage(data.phoneNumber || "");
  if (phoneError) {
    errors.phoneNumber = phoneError;
  }

  // Province
  if (!data.provinceCode || data.provinceCode.trim() === "") {
    errors.provinceCode = "Vui lòng chọn Tỉnh/Thành phố";
  }

  // District
  if (!data.districtCode || data.districtCode.trim() === "") {
    errors.districtCode = "Vui lòng chọn Quận/Huyện";
  }

  // Ward
  if (!data.wardCode || data.wardCode.trim() === "") {
    errors.wardCode = "Vui lòng chọn Phường/Xã";
  }

  // Street address
  if (!data.street || data.street.trim() === "") {
    errors.street = "Vui lòng nhập địa chỉ cụ thể";
  } else if (data.street.trim().length < 5) {
    errors.street = "Địa chỉ phải có ít nhất 5 ký tự";
  } else if (data.street.length > 255) {
    errors.street = "Địa chỉ không được quá 255 ký tự";
  }

  return errors;
}

/**
 * Check if address form is valid
 */
export function isAddressFormValid(data: Partial<AddressFormData>): boolean {
  const errors = validateAddressForm(data);
  return Object.keys(errors).length === 0;
}
