export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "GUEST" | "CUSTOMER";
  gender?: string;
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
  soldCount?: number;
  certifications?: string[];
  stock: number;
  isInStock: boolean;
  isFeatured: boolean;
  tags: string[];
  unit: string;
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
  selected: boolean;
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
  name?: string;
  phoneNumber: string;
  phone?: string;
  city?: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
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
    | "FAILED"
    | "PACKED"
    | "PENDING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
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
  images?: string[];
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
