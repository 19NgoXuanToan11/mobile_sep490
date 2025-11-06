
import { OpenAPI } from "../../api/core/OpenAPI";
import { request as __request } from "../../api/core/request";
import { ProductService } from "../../api";
import env from "../../config/env";
import { CartItem, Product, ApiResponse } from "../../types";
import { generateId } from "../lib/utils";

interface BackendCartResponse {
  paymentStatus?: number;
  createdAt?: string;
  updatedAt?: string;
  expereAt?: string;
  cartItems?: BackendCartItem[];
}

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

function parseApiResponse<T>(response: any): {
  success: boolean;
  data: T | null;
  message?: string;
} {

  const payload = response?.data ?? response;

  if (typeof payload === "object" && "success" in payload) {
    return {
      success: payload.success,
      data: payload.data ?? null,
      message: payload.message,
    };
  }

  if (typeof payload === "object" && "code" in payload) {
    return {
      success: payload.code === 200 || payload.code === 0,
      data: payload.result ?? null,
      message: payload.message,
    };
  }

  if (typeof payload === "string") {
    return {
      success: true,
      data: null,
      message: payload,
    };
  }

  return {
    success: true,
    data: payload as T,
    message: undefined,
  };
}

async function transformCartItem(
  item: BackendCartItem
): Promise<CartItem | null> {
  if (!item.productId) return null;
  let product: Product;

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
    selected: true,
  };
}

export const realCartApi = {

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

      let backendItems: BackendCartItem[] = [];
      if (parsed.data) {
        if (Array.isArray(parsed.data)) {

          backendItems = parsed.data;
        } else if (parsed.data.cartItems) {

          backendItems = parsed.data.cartItems;
        }
      }

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

  async addItem(
    productId: string,
    quantity: number = 1
  ): Promise<{ success: boolean; data: CartItem[]; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;

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

  async updateQuantity(
    productId: string,
    quantity: number
  ): Promise<{ success: boolean; data: CartItem[]; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;

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

  async removeItem(
    productId: string
  ): Promise<{ success: boolean; data: CartItem[]; message?: string }> {
    try {
      OpenAPI.BASE = env.API_URL;

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
