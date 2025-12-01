import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatCurrency(
  amount: number,
  locale = "vi-VN",
  currency = "VND"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
export function formatNumber(num: number, locale = "vi-VN") {
  return new Intl.NumberFormat(locale).format(num);
}
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
  locale = "vi-VN"
) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const formatted = new Intl.DateTimeFormat(locale, options).format(dateObj);
  // Ensure dd/mm/yyyy format for vi-VN locale
  if (locale === "vi-VN") {
    // Intl.DateTimeFormat with vi-VN might return different format, so we manually format
    const d = dateObj.getDate().toString().padStart(2, "0");
    const m = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const y = dateObj.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return formatted;
}
export function formatRelativeTime(date: string | Date, locale = "vi-VN") {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
        -count,
        interval.label as Intl.RelativeTimeFormatUnit
      );
    }
  }
  return "just now";
}
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
export function generateId(prefix = "") {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return prefix
    ? `${prefix}_${timestamp}_${randomPart}`
    : `${timestamp}_${randomPart}`;
}
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
export function calculateDiscount(
  originalPrice: number,
  discountedPrice: number
) {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}
export function getStockStatus(stock: number): {
  status: "in_stock" | "low_stock" | "out_of_stock";
  text: string;
  color: string;
} {
  if (stock === 0) {
    return {
      status: "out_of_stock",
      text: "Hết hàng",
      color: "text-error-500",
    };
  }
  if (stock < 10) {
    return {
      status: "low_stock",
      text: "Sắp hết hàng",
      color: "text-warning-500",
    };
  }
  return {
    status: "in_stock",
    text: "Còn hàng",
    color: "text-success-500",
  };
}
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(?:\+84|0)[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("84")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return cleaned;
  }
  return `0${cleaned}`;
}
export function getOrderStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PLACED: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-indigo-100 text-indigo-800",
    FAILED: "bg-red-100 text-red-800",
    PACKED: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-yellow-100 text-yellow-800",
    DELIVERED: "bg-cyan-100 text-cyan-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
}
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function getRandomDelay(): number {
  return Math.floor(Math.random() * 300) + 200;
}
