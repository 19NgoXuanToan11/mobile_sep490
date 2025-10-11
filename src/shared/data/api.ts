import {
  User,
  Category,
  Product,
  Banner,
  Address,
  PaymentMethod,
  Order,
  LoginFormData,
  RegisterFormData,
  CheckoutFormData,
  ApiResponse,
  PaginatedResponse,
  FilterState,
  CartItem,
} from "../../types";
import { sleep, getRandomDelay, generateId } from "../lib/utils";
import { storage, authStorage, STORAGE_KEYS } from "../lib/storage";
import {
  OpenAPI,
  AccountService,
  AccountProfileService,
  ProductService,
  CategoryService,
  OrderService,
  PaymentService,
  FeedbackService,
  CreateFeedbackDTO,
} from "../../api";
import { request as __request } from "../../api/core/request";
import env from "../../config/env";
import { realCartApi } from "./cartApiService";

// Simulate network delay
const withDelay = async <T>(data: T, delay?: number): Promise<T> => {
  await sleep(delay ?? getRandomDelay());
  return data;
};

// Authentication API
export const authApi = {
  async login(
    credentials: LoginFormData
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      OpenAPI.BASE = env.API_URL;

      const result = await AccountService.postApiV1AccountLogin({
        requestBody: {
          email: credentials.email,
          password: credentials.password,
        },
      });

      const token = result?.data?.token ?? result?.token ?? result?.accessToken;
      if (!token) {
        console.error("❌ [LOGIN] No token found in response!");
        return {
          success: false,
          data: null as any,
          message: "No token returned",
        };
      }

      await authStorage.setTokens(token);

      // Set token to OpenAPI headers before fetching profile
      OpenAPI.TOKEN = token;

      // Optionally fetch current profile
      const profileResp =
        await AccountProfileService.getApiV1AccountProfileProfile();
      const user: User = {
        id: String(
          profileResp?.data?.accountProfileId ??
            profileResp?.accountProfileId ??
            "0"
        ),
        name:
          profileResp?.data?.fullname ??
          profileResp?.fullname ??
          credentials.email.split("@")[0],
        email:
          profileResp?.data?.email ?? profileResp?.email ?? credentials.email,
        phone: profileResp?.data?.phone ?? profileResp?.phone,
        gender: profileResp?.data?.gender ?? profileResp?.gender,
        address: profileResp?.data?.address ?? profileResp?.address,
        avatar: profileResp?.data?.images ?? profileResp?.images,
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: { user, token } };
    } catch (error) {
      console.error("❌ [LOGIN] Error:", error);
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  },

  async register(
    userData: RegisterFormData
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      OpenAPI.BASE = env.API_URL;
      const result = await AccountService.postApiV1AccountRegister({
        requestBody: {
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
        } as any,
      });
      const token = result?.data?.token ?? result?.token ?? result?.accessToken;
      if (token) {
        await authStorage.setTokens(token);
        // Set token to OpenAPI headers before fetching profile
        OpenAPI.TOKEN = token;
      }
      const profileResp =
        await AccountProfileService.getApiV1AccountProfileProfile();
      const user: User = {
        id: String(
          profileResp?.data?.accountProfileId ??
            profileResp?.accountProfileId ??
            "0"
        ),
        name:
          profileResp?.data?.fullname ??
          profileResp?.fullname ??
          userData.email.split("@")[0],
        email: profileResp?.data?.email ?? profileResp?.email ?? userData.email,
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: { user, token: token ?? "" } };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : "Registration failed",
        errors: {
          general: [
            error instanceof Error ? error.message : "Registration failed",
          ],
        },
      };
    }
  },

  async logout(): Promise<ApiResponse<null>> {
    await sleep(200);
    await authStorage.clearTokens();
    return {
      success: true,
      data: null,
    };
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const token = await authStorage.getAccessToken();
    if (!token) {
      return {
        success: false,
        data: null as any,
        message: "Not authenticated",
      };
    }
    try {
      OpenAPI.BASE = env.API_URL;
      // Set token to OpenAPI headers
      OpenAPI.TOKEN = token;
      const profileResp =
        await AccountProfileService.getApiV1AccountProfileProfile();
      const user: User = {
        id: String(
          profileResp?.data?.accountProfileId ??
            profileResp?.accountProfileId ??
            "0"
        ),
        name: profileResp?.data?.fullname ?? profileResp?.fullname ?? "User",
        email: profileResp?.data?.email ?? profileResp?.email ?? "",
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to get current user",
      };
    }
  },
};

// Categories API
export const categoriesApi = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      const res = await CategoryService.getApiV1CategoryGetAll();
      const items: Category[] = (res?.data ?? res ?? []).map((c: any) => ({
        id: String(c.categoryId ?? c.id),
        name: c.categoryName ?? c.name,
        slug: (c.categoryName ?? c.name ?? "")
          .toLowerCase()
          .replace(/\s+/g, "-"),
        image: c.image || "",
        description: c.description ?? "",
        sortOrder: c.sortOrder ?? 0,
      }));
      return { success: true, data: items };
    } catch (error) {
      return { success: true, data: [], message: "Failed to fetch categories" };
    }
  },

  async getById(id: string): Promise<ApiResponse<Category>> {
    try {
      const res = await CategoryService.getApiV1Category({ id: Number(id) });
      const c: any = res?.data ?? res;
      const category: Category = {
        id: String(c.categoryId ?? c.id),
        name: c.categoryName ?? c.name,
        slug: (c.categoryName ?? c.name ?? "")
          .toLowerCase()
          .replace(/\s+/g, "-"),
        image: c.image || "",
        description: c.description ?? "",
        sortOrder: c.sortOrder ?? 0,
      };
      return { success: true, data: category };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: "Category not found",
      };
    }
  },
};

// Products API
export const productsApi = {
  async getAll(
    filters?: Partial<FilterState>,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const res = await ProductService.getApiV1ProductsProductsList({
        pageIndex: page,
        pageSize: limit,
      });
      const payload = res?.data ?? res;
      const items: Product[] = (payload?.items ?? payload?.data ?? []).map(
        (p: any) => ({
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
        })
      );
      const pagination = payload?.pagination ?? {
        page,
        limit,
        total: Number(payload?.totalItemCount ?? items.length),
        totalPages: Math.ceil(
          Number(payload?.totalItemCount ?? items.length) / limit
        ),
        hasNext: page * limit < Number(payload?.totalItemCount ?? items.length),
        hasPrev: page > 1,
      };
      return { success: true, data: { data: items, pagination } };
    } catch (error) {
      return {
        success: true,
        data: {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: page > 1,
          },
        },
        message: "Failed to fetch products",
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    try {
      const res = await ProductService.getApiV1ProductsGetProduct({
        productId: Number(id),
      });
      const p: any = res?.data ?? res;
      const product: Product = {
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
      return { success: true, data: product };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: "Product not found",
      };
    }
  },

  async getFeatured(limit = 6): Promise<ApiResponse<Product[]>> {
    const res = await ProductService.getApiV1ProductsProductFilter({
      pageIndex: 1,
      pageSize: limit,
      sortByStockAsc: false,
    });
    const payload = res?.data ?? res;
    const items: Product[] = (payload?.items ?? payload?.data ?? []).map(
      (p: any) => ({
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
      })
    );
    return { success: true, data: items };
  },

  async search(query: string, limit = 20): Promise<ApiResponse<Product[]>> {
    const res = await ProductService.getApiV1ProductsSearchProduct({
      productName: query,
      pageIndex: 1,
      pageSize: limit,
    });
    const payload = res?.data ?? res;
    const items: Product[] = (payload?.items ?? payload?.data ?? []).map(
      (p: any) => ({
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
      })
    );
    return { success: true, data: items };
  },
};

// Feedback API
export interface FeedbackItem {
  id?: string;
  comment: string;
  rating?: number | null;
  createdAt?: string;
  phone?: string;
  customerId?: number;
}

export const feedbackApi = {
  async list(page = 1, limit = 10) {
    try {
      OpenAPI.BASE = env.API_URL;
      const res = await FeedbackService.getApiV1FeedbackFeedBackList({
        pageIndex: page,
        pageSize: limit,
      });
      const payload: any = (res as any)?.data ?? (res as any);
      const list: any[] = payload?.items ?? payload?.data ?? [];
      const items: FeedbackItem[] = list.map((f: any, idx: number) => ({
        id: String(f.feedbackId ?? f.id ?? idx),
        comment: f.comment ?? "",
        rating: f.rating ?? null,
        createdAt:
          typeof f.createdAt === "string"
            ? f.createdAt
            : f.createdAt?.toString?.() ?? new Date().toISOString(),
        phone: f.phone ?? f.customer?.accountProfile?.phone,
        customerId: Number(f.customerId ?? f.customer?.accountId ?? 0),
      }));
      return {
        success: true,
        data: {
          data: items,
          pagination: {
            page,
            limit,
            total: Number(payload?.totalItemCount ?? items.length),
            totalPages: Math.ceil(
              Number(payload?.totalItemCount ?? items.length) / limit
            ),
            hasNext:
              page * limit < Number(payload?.totalItemCount ?? items.length),
            hasPrev: page > 1,
          },
        },
      } as const;
    } catch (error) {
      return {
        success: true,
        data: {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: page > 1,
          },
        },
        message: "Failed to fetch feedback",
      } as const;
    }
  },

  async create(input: {
    comment: string;
    rating?: number | null;
    customerId: number;
  }) {
    try {
      OpenAPI.BASE = env.API_URL;
      const body: CreateFeedbackDTO = {
        comment: input.comment,
        rating: input.rating ?? null,
        customerId: input.customerId,
      } as any;
      const res = await FeedbackService.postApiV1FeedbackCreateFeedback({
        requestBody: body,
      });
      return {
        success: true,
        data: (res as any)?.data ?? (res as any),
      } as const;
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to create feedback",
      } as const;
    }
  },

  async update(
    id: number,
    input: { comment: string; rating?: number | null; customerId: number }
  ) {
    try {
      OpenAPI.BASE = env.API_URL;
      const body: CreateFeedbackDTO = {
        comment: input.comment,
        rating: input.rating ?? null,
        customerId: input.customerId,
      } as any;
      const res = await FeedbackService.postApiV1FeedbackUpdateFeedback({
        id,
        requestBody: body,
      });
      return {
        success: true,
        data: (res as any)?.data ?? (res as any),
      } as const;
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to update feedback",
      } as const;
    }
  },
};

// Banners API
export const bannersApi = {
  async getActive(): Promise<ApiResponse<Banner[]>> {
    // No backend banners endpoint: return empty list (no mock data)
    return { success: true, data: [] };
  },
};

// Cart API - switches between localStorage (Guest) and real API (User)
// API giỏ hàng - chuyển đổi giữa localStorage (Khách) và API thực (Người dùng)
export const cartApi = {
  /**
   * Get cart items - uses real API if authenticated, localStorage if guest
   */
  async getItems(
    isAuthenticated: boolean = false
  ): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.getItems();
    }

    // Guest mode - use localStorage
    const items =
      (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
    return {
      success: true,
      data: await withDelay(items),
    };
  },

  /**
   * Add item to cart - uses real API if authenticated, localStorage if guest
   */
  async addItem(
    productId: string,
    quantity = 1,
    isAuthenticated: boolean = false
  ): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.addItem(productId, quantity);
    }

    // Guest mode - use localStorage
    await sleep(300);

    // Fetch product from backend
    let product: Product | null = null;
    try {
      const res = await ProductService.getApiV1ProductsGetProduct({
        productId: Number(productId),
      });
      const p: any = (res as any)?.data ?? (res as any);
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
    } catch (e) {
      return {
        success: false,
        data: null as any,
        message: "Product not found",
      };
    }

    if (!product) {
      return {
        success: false,
        data: null as any,
        message: "Product not found",
      };
    }

    const existingItems =
      (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
    const existingItemIndex = existingItems.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      existingItems[existingItemIndex].quantity += quantity;
      existingItems[existingItemIndex].subtotal =
        existingItems[existingItemIndex].quantity * product.price;
    } else {
      const newItem: CartItem = {
        id: generateId("cart"),
        productId,
        product,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      };
      existingItems.push(newItem);
    }

    await storage.setItem(STORAGE_KEYS.CART_ITEMS, existingItems);

    return {
      success: true,
      data: existingItems,
    };
  },

  /**
   * Update cart item quantity
   */
  async updateQuantity(
    itemId: string,
    quantity: number,
    isAuthenticated: boolean = false
  ): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      // For authenticated users, itemId should be productId for backend compatibility
      return await realCartApi.updateQuantity(itemId, quantity);
    }

    // Guest mode - use localStorage
    await sleep(200);

    const items =
      (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = quantity;
        items[itemIndex].subtotal = items[itemIndex].price * quantity;
      }

      await storage.setItem(STORAGE_KEYS.CART_ITEMS, items);
    }

    return {
      success: true,
      data: items,
    };
  },

  /**
   * Remove item from cart
   */
  async removeItem(
    itemId: string,
    isAuthenticated: boolean = false
  ): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      // For authenticated users, itemId should be productId for backend compatibility
      return await realCartApi.removeItem(itemId);
    }

    // Guest mode - use localStorage
    await sleep(200);

    const items =
      (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
    const filteredItems = items.filter((item) => item.id !== itemId);

    await storage.setItem(STORAGE_KEYS.CART_ITEMS, filteredItems);

    return {
      success: true,
      data: filteredItems,
    };
  },

  /**
   * Clear cart
   */
  async clear(isAuthenticated: boolean = false): Promise<ApiResponse<null>> {
    if (isAuthenticated) {
      return await realCartApi.clear();
    }

    // Guest mode - use localStorage
    await sleep(200);
    await storage.removeItem(STORAGE_KEYS.CART_ITEMS);

    return {
      success: true,
      data: null,
    };
  },
};

// Orders API
export const ordersApi = {
  async getAll(): Promise<ApiResponse<Order[]>> {
    try {
      const res = await OrderService.getApiV1OrderOrderListByCurrentAccount({
        pageIndex: 1,
        pageSize: 50,
      });
      const payload = res?.data ?? res;
      const list: any[] = payload?.items ?? payload?.data ?? [];
      const mapped: Order[] = list.map((o: any, idx: number) => ({
        id: String(o.orderId ?? o.id ?? idx),
        orderNumber: o.orderNumber ?? `ORD-${String(o.orderId ?? idx)}`,
        userId: String(o.userId ?? ""),
        items: [],
        status: String(o.status ?? "PLACED") as any,
        statusHistory: [],
        shippingAddress: {
          id: "",
          name: "",
          phone: "",
          street: String(o.shippingAddress ?? ""),
          ward: "",
          district: "",
          city: "",
          isDefault: false,
          type: "OTHER",
        },
        paymentMethod: {
          id: "cod",
          type: "COD",
          name: "Thanh toán khi nhận hàng",
          description: "",
          isActive: true,
        },
        itemCount: Number(o.itemCount ?? 0),
        subtotal: Number(o.subtotal ?? 0),
        shippingFee: Number(o.shippingFee ?? 0),
        discount: Number(o.discount ?? 0),
        total: Number(o.total ?? 0),
        notes: o.notes ?? undefined,
        estimatedDelivery: o.estimatedDelivery ?? undefined,
        trackingNumber: o.trackingNumber ?? undefined,
        createdAt: o.createdAt ?? new Date().toISOString(),
        updatedAt: o.updatedAt ?? new Date().toISOString(),
      }));
      return { success: true, data: mapped };
    } catch (error) {
      return { success: true, data: [], message: "Failed to fetch orders" };
    }
  },

  /**
   * Create new order
   */
  async create(orderData: {
    orderItems: Array<{ productId: number; stockQuantity: number }>;
    shippingAddress: string;
  }): Promise<
    ApiResponse<{
      orderId: number;
      totalPrice: number;
      message?: string;
      paymentUrl?: string;
    }>
  > {
    try {
      // Ensure authentication is set up
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { orderId: 0, totalPrice: 0 },
          message: "Chưa đăng nhập - Vui lòng đăng nhập lại",
        };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token; // Ensure token is set for this request

      const result = await OrderService.postApiV1OrderCreate({
        requestBody: {
          orderItems: orderData.orderItems.map((item) => ({
            productId: item.productId,
            stockQuantity: item.stockQuantity,
          })),
          shippingAddress: orderData.shippingAddress,
        },
      });

      const data = (result as any)?.data ?? result;

      // Check for success indicators - handle multiple possible success formats
      // Backend trả về status: 1 khi thành công
      const isSuccess =
        data.status === 1 ||
        data.status === 201 ||
        data.status === 200 ||
        (data.orderId && typeof data.orderId === "number") ||
        (data.data?.orderId && typeof data.data.orderId === "number") ||
        (data.paymentUrl && typeof data.paymentUrl === "string") ||
        (data.message && data.message.includes("Order created"));

      if (isSuccess) {
        // Lấy orderId từ nhiều nguồn có thể
        let orderId = data.orderId || data.data?.orderId || 0;

        // Nếu không có orderId, thử lấy từ vnp_TxnRef trong paymentUrl
        if (!orderId && data.paymentUrl) {
          const urlParams = new URLSearchParams(data.paymentUrl.split("?")[1]);
          const txnRef = urlParams.get("vnp_TxnRef");
          if (txnRef) {
            orderId = parseInt(txnRef);
          }
        }

        const totalPrice = data.totalPrice || data.data?.totalPrice || 0;

        return {
          success: true,
          data: {
            orderId,
            totalPrice,
            message: data.message || data.data?.message,
            paymentUrl: data.paymentUrl, // Thêm paymentUrl để có thể sử dụng sau
          },
          message: data.message || "Đơn hàng được tạo thành công",
        };
      } else {
        return {
          success: false,
          data: { orderId: 0, totalPrice: 0 },
          message:
            data.message ||
            data.data?.message ||
            "Tạo đơn hàng thất bại - response không hợp lệ",
        };
      }
    } catch (error: any) {
      console.error("Create order error:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });

      return {
        success: false,
        data: { orderId: 0, totalPrice: 0 },
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi tạo đơn hàng",
      };
    }
  },

  /**
   * Create payment URL for VNPAY
   */
  async createPaymentUrl(paymentData: {
    orderId: number;
    amount: number;
    orderDescription: string;
    name: string;
  }): Promise<ApiResponse<{ paymentUrl: string }>> {
    try {
      // Ensure authentication is set up
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { paymentUrl: "" },
          message: "Chưa đăng nhập - Vui lòng đăng nhập lại",
        };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token; // Ensure token is set for this request
      const result = await PaymentService.postApiVnpayCreatePaymentUrl({
        requestBody: {
          orderId: paymentData.orderId,
          orderType: "product",
          amount: paymentData.amount,
          orderDescription: paymentData.orderDescription,
          name: paymentData.name,
        },
      });

      const data = (result as any)?.data ?? result;
      const paymentUrl = data?.url || data?.paymentUrl;

      if (paymentUrl) {
        return {
          success: true,
          data: { paymentUrl },
        };
      } else {
        return {
          success: false,
          data: { paymentUrl: "" },
          message: "Không thể tạo liên kết thanh toán",
        };
      }
    } catch (error: any) {
      console.error("Create payment URL error:", error);
      return {
        success: false,
        data: { paymentUrl: "" },
        message: error?.message || "Lỗi tạo liên kết thanh toán",
      };
    }
  },

  /**
   * Get payment status by order ID
   */
  async getPaymentStatus(orderId: number): Promise<
    ApiResponse<{
      isSuccess: boolean;
      transactionId?: string;
      amount?: number;
      payDate?: string;
      vnpayResponseCode?: string;
      isPending?: boolean;
    }>
  > {
    try {
      // Ensure authentication is set up
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { isSuccess: false },
          message: "Chưa đăng nhập - Vui lòng đăng nhập lại",
        };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token; // Ensure token is set for this request
      const result = await PaymentService.getApiVnpayPaymentByOrderId({
        orderId,
      });

      const data = (result as any)?.data ?? result;

      // Kiểm tra cả 2 cấu trúc có thể: data.data hoặc data trực tiếp
      const responseData = data.data || data;

      // 🔥 Nếu backend trả về lỗi "Không tìm thấy Payment", có thể payment chưa được tạo
      if (data.message && data.message.includes("Không tìm thấy Payment")) {
        return {
          success: true,
          data: {
            isSuccess: false,
            transactionId: undefined,
            amount: 0,
            payDate: undefined,
            vnpayResponseCode: undefined,
            isPending: true, // Đánh dấu là đang chờ xử lý
          },
        };
      }

      if ((data.status === 200 && data.data) || data.success !== undefined) {
        // 🔥 SỬA: Đọc từ response thực tế (lowercase và camelCase)
        const vnpaySuccess = responseData.vnPayResponseCode === "00";
        const backendSuccess = responseData.success === true;

        // Chỉ coi là thành công khi cả 2 điều kiện đều true
        const finalSuccess = vnpaySuccess && backendSuccess;
        
        return {
          success: true,
          data: {
            isSuccess: finalSuccess,
            transactionId: responseData.transactionId,
            amount: responseData.amount,
            payDate: responseData.paymentTime,
            vnpayResponseCode: responseData.vnPayResponseCode,
          },
        };
      } else {
        return {
          success: false,
          data: { isSuccess: false },
          message: "Không thể lấy trạng thái thanh toán",
        };
      }
    } catch (error: any) {
      console.error("Get payment status error:", error);
      return {
        success: false,
        data: { isSuccess: false },
        message: error?.message || "Lỗi kiểm tra trạng thái thanh toán",
      };
    }
  },

  /**
   * Create order payment record
   */
  async createOrderPayment(
    orderId: number
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      // Ensure authentication is set up
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { message: "" },
          message: "Chưa đăng nhập - Vui lòng đăng nhập lại",
        };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token; // Ensure token is set for this request
      const result = await OrderService.postApiV1OrderCreateOrderPayment({
        orderId,
      });

      const data = (result as any)?.data ?? result;

      return {
        success: true,
        data: { message: data.message || "Tạo bản ghi thanh toán thành công" },
      };
    } catch (error: any) {
      console.error("Create order payment error:", error);
      return {
        success: false,
        data: { message: "" },
        message: error?.message || "Lỗi tạo bản ghi thanh toán",
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Order>> {
    try {
      const res = await OrderService.getApiV1OrderOrder({
        orderId: Number(id),
      });
      const o: any = res?.data ?? res;
      const order: Order = {
        id: String(o.orderId ?? o.id),
        orderNumber: o.orderNumber ?? `ORD-${id}`,
        userId: String(o.userId ?? ""),
        items: [],
        status: String(o.status ?? "PLACED") as any,
        statusHistory: [],
        shippingAddress: {
          id: "",
          name: "",
          phone: "",
          street: String(o.shippingAddress ?? ""),
          ward: "",
          district: "",
          city: "",
          isDefault: false,
          type: "OTHER",
        },
        paymentMethod: {
          id: "cod",
          type: "COD",
          name: "Thanh toán khi nhận hàng",
          description: "",
          isActive: true,
        },
        itemCount: Number(o.itemCount ?? 0),
        subtotal: Number(o.subtotal ?? 0),
        shippingFee: Number(o.shippingFee ?? 0),
        discount: Number(o.discount ?? 0),
        total: Number(o.total ?? 0),
        notes: o.notes ?? undefined,
        estimatedDelivery: o.estimatedDelivery ?? undefined,
        trackingNumber: o.trackingNumber ?? undefined,
        createdAt: o.createdAt ?? new Date().toISOString(),
        updatedAt: o.updatedAt ?? new Date().toISOString(),
      };
      return { success: true, data: order };
    } catch (error) {
      return { success: false, data: null as any, message: "Order not found" };
    }
  },

  // Prepare order before creation - validate stock and get order details
  async prepareOrder(): Promise<
    ApiResponse<{
      orderItems: Array<{ productId: number; stockQuantity: number }>;
      shippingAddress: string;
    }>
  > {
    try {
      OpenAPI.BASE = env.API_URL;
      const result = await __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/account/prepare-order",
        mediaType: "application/json",
      });

      const data = (result as any)?.data ?? result;
      return {
        success: true,
        data: {
          orderItems: data.orderItems || [],
          shippingAddress: data.shippingAddress || "",
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to prepare order",
      };
    }
  },
};

// Addresses API
export const addressesApi = {
  async getAll(): Promise<ApiResponse<Address[]>> {
    // No backend endpoint → return empty list
    return { success: true, data: [] };
  },

  async getById(id: string): Promise<ApiResponse<Address>> {
    return { success: false, data: null as any, message: "Address not found" };
  },

  async create(
    addressData: Omit<Address, "id">
  ): Promise<ApiResponse<Address>> {
    return { success: false, data: null as any, message: "Not supported" };
  },

  async update(
    id: string,
    addressData: Partial<Address>
  ): Promise<ApiResponse<Address>> {
    return { success: false, data: null as any, message: "Not supported" };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return { success: false, data: null, message: "Not supported" };
  },
};

// Payment Methods API
export const paymentMethodsApi = {
  async getAll(): Promise<ApiResponse<PaymentMethod[]>> {
    const methods: PaymentMethod[] = [
      {
        id: "cod",
        type: "COD",
        name: "Thanh toán khi nhận hàng",
        description: "Thanh toán bằng tiền mặt khi nhận hàng",
        isActive: true,
      },
      {
        id: "vnpay",
        type: "E_WALLET",
        name: "VNPay",
        description: "Thanh toán trực tuyến qua VNPay",
        isActive: true,
      },
    ];
    return { success: true, data: methods };
  },
};

// Profile API
export interface ProfileData {
  accountProfileId: number;
  gender?: string;
  phone?: string;
  fullname?: string;
  address?: string;
  images?: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  email: string;
}

export interface UpdateProfileRequest {
  gender?: number;
  phone?: string;
  fullname: string;
  address?: string;
  images?: string;
}

export const profileApi = {
  async getProfile(): Promise<ApiResponse<ProfileData>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: null as any,
          message: "Not authenticated",
        };
      }

      OpenAPI.BASE = env.API_URL;
      const response =
        await AccountProfileService.getApiV1AccountProfileProfile();

      return {
        success: true,
        data: (response as any)?.data ?? (response as any),
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to get profile",
      };
    }
  },

  async updateProfile(
    profileData: UpdateProfileRequest
  ): Promise<ApiResponse<ProfileData>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: null as any,
          message: "Not authenticated",
        };
      }

      OpenAPI.BASE = env.API_URL;
      const response = await AccountProfileService.putApiV1AccountProfileUpdate(
        {
          requestBody: profileData as any,
        }
      );

      return {
        success: true,
        data: (response as any)?.data ?? (response as any),
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  },

  async uploadProfileImage(
    imageUri: string
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: null as any,
          message: "Not authenticated",
        };
      }

      // Create form data for image upload
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile-image.jpg",
      } as any);

      const baseUrl = OpenAPI.BASE || env.API_URL;
      const response = await fetch(`${baseUrl}/api/v1/upload/profile-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();

      return {
        success: true,
        data: { imageUrl: result.imageUrl },
      };
    } catch (error) {
      console.error("Upload image error:", error);
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to upload image",
      };
    }
  },
};

// Onboarding API
// Minimal fallback slides (no fixtures)
const onboardingSlides: any[] = [];
export const onboardingApi = {
  async getSlides(): Promise<ApiResponse<typeof onboardingSlides>> {
    return {
      success: true,
      data: await withDelay(onboardingSlides),
    };
  },
};
