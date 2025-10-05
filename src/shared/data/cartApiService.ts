/**
 * Cart API Service - Real backend integration for authenticated users
 * 购物车API服务 - 为已认证用户提供真实后端集成
 */

import { OpenAPI } from "../../api/core/OpenAPI";
import { request as __request } from "../../api/core/request";
import env from "../../config/env";
import { CartItem, Product } from "../../types";
import { generateId } from "../lib/utils";

// Cart item from backend response
interface BackendCartItem {
  cartItemId?: number;
  productId?: number;
  quantity?: number;
  product?: {
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
  };
}

interface AddToCartRequest {
  productId: number;
  quantity: number;
}

interface UpdateCartItemRequest {
  cartItemId: number;
  quantity: number;
}

/**
 * Transform backend cart item to frontend CartItem format
 */
function transformCartItem(item: BackendCartItem): CartItem | null {
  if (!item.product || !item.productId) return null;

  const p = item.product;
  const product: Product = {
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

  const quantity = Number(item.quantity ?? 1);
  return {
    id: String(item.cartItemId ?? generateId("cart")),
    productId: String(item.productId),
    product,
    quantity,
    price: product.price,
    subtotal: product.price * quantity,
  };
}

/**
 * Real Cart API for authenticated users
 * 为已认证用户提供的真实购物车API
 */
export const realCartApi = {
  /**
   * Get all cart items for current user
   * 获取当前用户的所有购物车项
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

      const payload: any = (response as any)?.data ?? response;
      const items: BackendCartItem[] = Array.isArray(payload)
        ? payload
        : payload?.items ?? payload?.data ?? [];

      const cartItems = items
        .map(transformCartItem)
        .filter((item): item is CartItem => item !== null);

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
   * 添加商品到购物车
   */
  async addItem(
    productId: string,
    quantity: number = 1
  ): Promise<{ success: boolean; data: CartItem[]; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;
      const requestBody: AddToCartRequest = {
        productId: Number(productId),
        quantity,
      };

      await __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/account/add-to-cart",
        body: requestBody,
        mediaType: "application/json",
      });

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
   * 更新购物车商品数量
   */
  async updateQuantity(
    cartItemId: string,
    quantity: number
  ): Promise<{ success: boolean; data: CartItem[]; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;
      const requestBody: UpdateCartItemRequest = {
        cartItemId: Number(cartItemId),
        quantity,
      };

      await __request(OpenAPI, {
        method: "PUT",
        url: "/api/v1/account/update-cart-item",
        body: requestBody,
        mediaType: "application/json",
      });

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
   * 从购物车删除商品
   */
  async removeItem(
    cartItemId: string
  ): Promise<{ success: boolean; data: CartItem[]; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;
      await __request(OpenAPI, {
        method: "DELETE",
        url: "/api/v1/account/remove-cart-item",
        query: {
          cartItemId: Number(cartItemId),
        },
      });

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
   * 清空购物车
   */
  async clear(): Promise<{ success: boolean; data: null; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;
      await __request(OpenAPI, {
        method: "DELETE",
        url: "/api/v1/account/clear-cart",
      });

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
