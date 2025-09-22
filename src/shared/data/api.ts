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
  FeedbackService,
  CreateFeedbackDTO,
} from "../../api";
import env from "../../config/env";

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
        return {
          success: false,
          data: null as any,
          message: "No token returned",
        };
      }
      await authStorage.setTokens(token);
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
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: { user, token } };
    } catch (error) {
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

// Cart API (using local storage)
export const cartApi = {
  async getItems(): Promise<ApiResponse<CartItem[]>> {
    const items =
      (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
    return {
      success: true,
      data: await withDelay(items),
    };
  },

  async addItem(
    productId: string,
    quantity = 1
  ): Promise<ApiResponse<CartItem[]>> {
    await sleep(300);

    // Fetch product from backend instead of using fixtures
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

  async updateQuantity(
    itemId: string,
    quantity: number
  ): Promise<ApiResponse<CartItem[]>> {
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

  async removeItem(itemId: string): Promise<ApiResponse<CartItem[]>> {
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

  async clear(): Promise<ApiResponse<null>> {
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

  async create(
    checkoutData: CheckoutFormData & { manualAddress?: string }
  ): Promise<ApiResponse<Order>> {
    try {
      const cartItems =
        (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
      if (!cartItems.length) {
        return { success: false, data: null as any, message: "Cart is empty" };
      }

      OpenAPI.BASE = env.API_URL;
      const requestBody: any = {
        orderItems: cartItems.map((ci) => ({
          productId: Number(ci.productId),
          stockQuantity: ci.quantity,
        })),
        shippingAddress: checkoutData.manualAddress || "",
      };

      const result = await OrderService.postApiV1OrderCreate({
        requestBody,
      });

      // Clear cart on success
      await storage.removeItem(STORAGE_KEYS.CART_ITEMS);

      const o: any = (result as any)?.data ?? (result as any);
      const order: Order = {
        id: String(o.orderId ?? o.id ?? generateId("order")),
        orderNumber: o.orderNumber ?? `ORD-${String(Date.now()).slice(-6)}`,
        userId: String(o.userId ?? ""),
        items: cartItems,
        status: String(o.status ?? "PLACED") as any,
        statusHistory: [],
        shippingAddress: {
          id: "",
          name: "",
          phone: "",
          street: String(
            o.shippingAddress ?? requestBody.shippingAddress ?? ""
          ),
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
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cartItems.reduce((sum, item) => sum + item.subtotal, 0),
        shippingFee: Number(o.shippingFee ?? 0),
        discount: Number(o.discount ?? 0),
        total: Number(o.total ?? 0),
        notes: checkoutData.notes,
        estimatedDelivery: o.estimatedDelivery ?? undefined,
        trackingNumber: o.trackingNumber ?? undefined,
        createdAt: o.createdAt ?? new Date().toISOString(),
        updatedAt: o.updatedAt ?? new Date().toISOString(),
      };

      return { success: true, data: order };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to create order",
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
        description: "",
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
