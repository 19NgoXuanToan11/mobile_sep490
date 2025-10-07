/**
 * Cart API Service - Real backend integration for authenticated users
 * Dịch vụ API giỏ hàng - Tích hợp backend thực cho người dùng đã xác thực
 */

import { OpenAPI } from "../../api/core/OpenAPI";
import { request as __request } from "../../api/core/request";
import { ProductService } from "../../api";
import env from "../../config/env";
import { CartItem, Product, ApiResponse } from "../../types";
import { generateId } from "../lib/utils";

// Backend cart response structure
interface BackendCartResponse {
  paymentStatus?: number;
  createdAt?: string;
  updatedAt?: string;
  expereAt?: string;
  cartItems?: BackendCartItem[];
}

// Backend cart item structure
interface BackendCartItem {
  cartItemId?: number;
  cartId?: number;
  productId?: number;
  quantity?: number;
  priceQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
  product?: BackendProduct;
}

// Backend product structure
interface BackendProduct {
  productId?: number;
  productName?: string;
  price?: number;
  originalPrice?: number;
  images?: string | string[];
  description?: string;
  stockQuantity?: number;
  categoryId?: number;
  unit?: string;
  origin?: string;
  harvestDate?: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Unified response parser for backend API responses
 * Handles different response formats: { success, message, data } or { code, result } or direct data
 */
function parseApiResponse<T>(response: any): {
  success: boolean;
  data: T | null;
  message?: string;
} {
  // Handle axios response wrapper
  const payload = response?.data ?? response;

  // Format 1: { success, message, data }
  if (typeof payload === "object" && "success" in payload) {
    return {
      success: payload.success,
      data: payload.data ?? null,
      message: payload.message,
    };
  }

  // Format 2: { code, result }
  if (typeof payload === "object" && "code" in payload) {
    return {
      success: payload.code === 200 || payload.code === 0,
      data: payload.result ?? null,
      message: payload.message,
    };
  }

  // Format 3: Direct data or string response
  if (typeof payload === "string") {
    return {
      success: true,
      data: null,
      message: payload,
    };
  }

  // Format 4: Direct data object
  return {
    success: true,
    data: payload as T,
    message: undefined,
  };
}

/**
 * Transform backend cart item to frontend CartItem format
 */
async function transformCartItem(
  item: BackendCartItem
): Promise<CartItem | null> {
  if (!item.productId) return null;

  let product: Product;

  // If backend provides full product data, use it
  if (item.product) {
    const p = item.product;
    product = {
      id: String(p.productId ?? item.productId),
      name: p.productName ?? "",
      slug: (p.productName ?? "").toLowerCase().replace(/\s+/g, "-"),
      sku: String(p.productId ?? item.productId ?? ""),
      description: p.description ?? "",
      price: Number(p.price ?? 0),
      originalPrice: Number(p.originalPrice ?? p.price ?? 0),
      categoryId: String(p.categoryId ?? ""),
      images: Array.isArray(p.images) ? p.images : p.images ? [p.images] : [],
      rating: Number(p.rating ?? 0),
      reviewCount: Number(p.reviewCount ?? 0),
      soldCount: Number(p.soldCount ?? 0),
      stock: Number(p.stockQuantity ?? 0),
      isInStock: (p.stockQuantity ?? 0) > 0,
      isFeatured: Boolean(p.isFeatured ?? false),
      tags: Array.isArray(p.tags) ? p.tags : [],
      unit: p.unit ?? "kg",
      origin: p.origin ?? undefined,
      harvestDate: p.harvestDate ?? undefined,
      createdAt: p.createdAt ?? new Date().toISOString(),
      updatedAt: p.updatedAt ?? new Date().toISOString(),
    };
  } else {
    // If no product data, fetch it directly from ProductService
    try {
      OpenAPI.BASE = env.API_URL;
      const res = await ProductService.getApiV1ProductsGetProduct({
        productId: Number(item.productId),
      });
      const p: any = res?.data ?? res;
      product = {
        id: String(p.productId ?? p.id),
        name: p.productName ?? p.name ?? "",
        slug: (p.productName ?? p.name ?? "")
          .toLowerCase()
          .replace(/\s+/g, "-"),
        sku: String(p.productId ?? p.id ?? ""),
        description: p.description ?? "",
        price: Number(p.price ?? 0),
        originalPrice: Number(p.originalPrice ?? p.price ?? 0),
        categoryId: String(p.categoryId ?? ""),
        images: p.images
          ? Array.isArray(p.images)
            ? p.images
            : [p.images]
          : [],
        rating: Number(p.rating ?? 0),
        reviewCount: Number(p.reviewCount ?? 0),
        soldCount: Number(p.soldCount ?? 0),
        stock: Number(p.stockQuantity ?? p.stock ?? 0),
        isInStock: (p.stockQuantity ?? p.stock ?? 0) > 0,
        isFeatured: Boolean(p.isFeatured ?? false),
        tags: Array.isArray(p.tags) ? p.tags : [],
        unit: p.unit ?? "kg",
        origin: p.origin ?? undefined,
        harvestDate: p.harvestDate ?? undefined,
        createdAt: p.createdAt ?? new Date().toISOString(),
        updatedAt: p.updatedAt ?? new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching product ${item.productId}:`, error);
      return null;
    }
  }

  const quantity = Number(item.quantity ?? 1);
  const itemPrice = Number(item.priceQuantity ?? 0) / quantity || product.price;

  return {
    id: String(item.cartItemId ?? generateId("cart")),
    productId: String(item.productId),
    product,
    quantity,
    price: itemPrice,
    subtotal: itemPrice * quantity,
  };
}

/**
 * Real Cart API for authenticated users
 * API giỏ hàng thực cho người dùng đã xác thực
 */
export const realCartApi = {
  /**
   * Get all cart items for current user
   * Lấy tất cả mặt hàng trong giỏ hàng của người dùng hiện tại
   */
  async getItems(): Promise<{
    success: boolean;
    data: CartItem[];
    message?: string;
  }> {
    try {
      OpenAPI.BASE = env.API_URL;
      const response = await __request(OpenAPI, {
        method: "GET",
        url: "/api/v1/account/cart-items",
      });

      const parsed = parseApiResponse<BackendCartResponse>(response);
      if (!parsed.success) {
        return {
          success: false,
          data: [],
          message: parsed.message ?? "Failed to get cart items",
        };
      }

      // Extract cart items from different possible response structures
      let backendItems: BackendCartItem[] = [];
      if (parsed.data) {
        if (Array.isArray(parsed.data)) {
          // Direct array of cart items
          backendItems = parsed.data;
        } else if (parsed.data.cartItems) {
          // Cart response with cartItems array
          backendItems = parsed.data.cartItems;
        }
      }

      // Transform backend items to frontend format
      const cartItems: CartItem[] = [];
      for (const item of backendItems) {
        const transformedItem = await transformCartItem(item);
        if (transformedItem) {
          cartItems.push(transformedItem);
        }
      }

      return { success: true, data: cartItems };
    } catch (error) {
      console.error("Get cart items error:", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error ? error.message : "Failed to get cart items",
      };
    }
  },

  /**
   * Add item to cart
   * Thêm mặt hàng vào giỏ hàng
   */
  async addItem(
    productId: string,
    quantity: number = 1
  ): Promise<{ success: boolean; data: CartItem[]; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;

      // Backend expects query parameters, not request body
      const response = await __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/account/add-to-cart",
        query: {
          productId: Number(productId),
          quantity,
        },
      });

      const parsed = parseApiResponse(response);
      if (!parsed.success) {
        return {
          success: false,
          data: [],
          message: parsed.message ?? "Failed to add item to cart",
        };
      }

      // After adding, fetch updated cart
      return await this.getItems();
    } catch (error) {
      console.error("Add to cart error:", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error ? error.message : "Failed to add item to cart",
      };
    }
  },

  /**
   * Update cart item quantity
   * Cập nhật số lượng mặt hàng trong giỏ hàng
   */
  async updateQuantity(
    productId: string, // Frontend passes cartItemId, but backend expects productId
    quantity: number
  ): Promise<{ success: boolean; data: CartItem[]; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;

      // Backend expects productId in query parameters
      const response = await __request(OpenAPI, {
        method: "PUT",
        url: "/api/v1/account/update-cart-item",
        query: {
          productId: Number(productId),
          quantity,
        },
      });

      const parsed = parseApiResponse(response);
      if (!parsed.success) {
        return {
          success: false,
          data: [],
          message: parsed.message ?? "Failed to update cart item",
        };
      }

      // After updating, fetch updated cart
      return await this.getItems();
    } catch (error) {
      console.error("Update cart item error:", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error ? error.message : "Failed to update cart item",
      };
    }
  },

  /**
   * Remove item from cart
   * Xóa mặt hàng khỏi giỏ hàng
   */
  async removeItem(
    productId: string // Frontend passes cartItemId, but backend expects productId
  ): Promise<{ success: boolean; data: CartItem[]; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;

      // Backend expects productId in query parameters
      const response = await __request(OpenAPI, {
        method: "DELETE",
        url: "/api/v1/account/remove-cart-item",
        query: {
          productId: Number(productId),
        },
      });

      const parsed = parseApiResponse(response);
      if (!parsed.success) {
        return {
          success: false,
          data: [],
          message: parsed.message ?? "Failed to remove cart item",
        };
      }

      // After removing, fetch updated cart
      return await this.getItems();
    } catch (error) {
      console.error("Remove cart item error:", error);
      return {
        success: false,
        data: [],
        message:
          error instanceof Error ? error.message : "Failed to remove cart item",
      };
    }
  },

  /**
   * Clear all cart items
   * Xóa tất cả mặt hàng trong giỏ hàng
   */
  async clear(): Promise<{ success: boolean; data: null; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;
      const response = await __request(OpenAPI, {
        method: "DELETE",
        url: "/api/v1/account/clear-cart",
      });

      const parsed = parseApiResponse(response);
      if (!parsed.success) {
        return {
          success: false,
          data: null,
          message: parsed.message ?? "Failed to clear cart",
        };
      }

      return { success: true, data: null };
    } catch (error) {
      console.error("Clear cart error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Failed to clear cart",
      };
    }
  },
};
