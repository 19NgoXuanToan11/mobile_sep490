export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "GUEST" | "CUSTOMER";
  gender?: string; // "male", "female", hoặc null
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  images: string[];
  rating: number;
  reviewCount: number;
  soldCount?: number; // Number of items sold for trust building
  certifications?: string[]; // e.g., ["VietGAP", "Organic", "GlobalGAP"]
  stock: number;
  isInStock: boolean;
  isFeatured: boolean;
  tags: string[];
  unit: string; // kg, piece, pack, etc.
  origin?: string;
  harvestDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
  selected: boolean; // Cho phép người dùng chọn sản phẩm để thanh toán
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

export interface Address {
  id: string;
  customerName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  // Legacy fields for backward compatibility
  name?: string;
  phone?: string;
  city?: string;
}

export interface PaymentMethod {
  id: string;
  type: "COD" | "BANK_TRANSFER" | "CREDIT_CARD" | "E_WALLET";
  name: string;
  description: string;
  isActive: boolean;
}

export interface OrderStatus {
  id: string;
  status:
    | "PLACED"
    | "CONFIRMED"
    | "PACKED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  status: OrderStatus["status"];
  statusHistory: OrderStatus[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  notes?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingNumber?: string;
  images?: string[]; // Hình ảnh đơn hàng từ backend
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  ctaText?: string;
  ctaAction?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: "DISCOUNT_PERCENT" | "DISCOUNT_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number;
  code?: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CheckoutFormData {
  addressId: string;
  paymentMethodId: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  sortBy: "name" | "price_asc" | "price_desc" | "rating" | "newest";
  inStockOnly: boolean;
}

// Navigation types
export interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}
