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

const normalizeImageUrl = (url: string): string => {
  if (!url || typeof url !== "string") return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const baseUrl = env.API_URL.replace(/\/$/, "");
  const imagePath = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${imagePath}`;
};

const withDelay = async <T>(data: T, delay?: number): Promise<T> => {
  await sleep(delay ?? getRandomDelay());
  return data;
};

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

      OpenAPI.TOKEN = token;

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

    OpenAPI.TOKEN = undefined;
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

      let images: string[] = [];
      if (p.images) {
        images = Array.isArray(p.images) ? p.images : [p.images];
      } else if (p.imageUrl) {
        images = Array.isArray(p.imageUrl) ? p.imageUrl : [p.imageUrl];
      } else if (p.image) {
        images = Array.isArray(p.image) ? p.image : [p.image];
      } else if (p.image_url) {
        images = Array.isArray(p.image_url) ? p.image_url : [p.image_url];
      }

      images = images
        .filter(
          (img: any) => img && typeof img === "string" && img.trim().length > 0
        )
        .map((img: string) => normalizeImageUrl(img.trim()));
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
        images: images,
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

export interface FeedbackItem {
  id?: string;
  comment: string;
  rating?: number | null;
  createdAt?: string;
  phone?: string;
  fullName?: string;
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
  async getByProduct(productId: number) {
    try {
      OpenAPI.BASE = env.API_URL;
      const res = await FeedbackService.getApiV1FeedbackFeedbackByProduct({
        productId,
      });
      const payload: any = (res as any)?.data ?? (res as any);
      // Handle both array and object with items/data property
      let list: any[] = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (payload?.items) {
        list = payload.items;
      } else if (payload?.data) {
        list = Array.isArray(payload.data) ? payload.data : [payload.data];
      }

      const items: FeedbackItem[] = list.map((f: any, idx: number) => ({
        id: String(f.feedbackId ?? f.id ?? idx),
        comment: f.comment ?? "",
        rating: f.rating ?? null,
        createdAt:
          typeof f.createdAt === "string"
            ? f.createdAt
            : f.createdAt?.toString?.() ?? new Date().toISOString(),
        phone: f.phone ?? f.customer?.accountProfile?.phone ?? f.email,
        fullName:
          f.fullName ??
          f.customer?.accountProfile?.fullname ??
          f.customer?.fullname,
        customerId: Number(f.customerId ?? f.customer?.accountId ?? 0),
      }));
      return {
        success: true,
        data: items,
      } as const;
    } catch (error) {
      return {
        success: false,
        data: [] as FeedbackItem[],
        message:
          error instanceof Error ? error.message : "Failed to fetch feedback",
      } as const;
    }
  },
};

export const bannersApi = {
  async getActive(): Promise<ApiResponse<Banner[]>> {
    return { success: true, data: [] };
  },
};

export const cartApi = {
  async getItems(
    isAuthenticated: boolean = false
  ): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.getItems();
    }

    const items =
      (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
    return {
      success: true,
      data: await withDelay(items),
    };
  },

  async addItem(
    productId: string,
    quantity = 1,
    isAuthenticated: boolean = false
  ): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.addItem(productId, quantity);
    }

    await sleep(300);

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
        selected: true,
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
    quantity: number,
    isAuthenticated: boolean = false
  ): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.updateQuantity(itemId, quantity);
    }

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

  async removeItem(
    itemId: string,
    isAuthenticated: boolean = false
  ): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.removeItem(itemId);
    }

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

  async clear(isAuthenticated: boolean = false): Promise<ApiResponse<null>> {
    if (isAuthenticated) {
      return await realCartApi.clear();
    }

    await sleep(200);
    await storage.removeItem(STORAGE_KEYS.CART_ITEMS);
    return {
      success: true,
      data: null,
    };
  },
};

export const ordersApi = {
  async getAll(params?: {
    pageIndex?: number;
    pageSize?: number;
    status?: string;
  }): Promise<
    ApiResponse<{ orders: Order[]; totalCount: number; hasNextPage: boolean }>
  > {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { orders: [], totalCount: 0, hasNextPage: false },
          message: "Not authenticated",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      const res = await OrderService.getApiV1OrderOrderListByCurrentAccount({
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
        status: params?.status ? (params.status as any) : undefined,
      });
      const payload = res?.data ?? res;

      const list: any[] = payload?.items ?? payload?.data ?? [];
      const totalCount =
        payload?.totalItemCount ??
        payload?.totalCount ??
        payload?.total ??
        list.length;
      const hasNextPage = Boolean(
        payload?.next ??
          payload?.hasNextPage ??
          (params?.pageIndex ?? 1) * (params?.pageSize ?? 10) < totalCount
      );
      const mapped: Order[] = list.map((o: any, idx: number) => {
        const orderItemsImages = (o.orderItems ?? o.orderDetails ?? [])
          .map((item: any) => item.images)
          .filter((img: any) => img && img.trim() !== "");
        return {
          id: String(o.orderId ?? o.id ?? idx),
          orderNumber: o.orderNumber ?? String(o.orderId ?? idx),
          userId: String(o.userId ?? o.customerId ?? ""),
          items: (o.orderItems ?? o.orderDetails ?? []).map((item: any) => ({
            id: String(item.id ?? item.orderDetailId ?? idx),
            productId: String(item.productId ?? ""),
            quantity: Number(item.quantity ?? item.stockQuantity ?? 1),
            price: Number(item.price ?? item.unitPrice ?? 0),
            product: {
              id: String(item.productId ?? ""),
              name: String(item.productName ?? "Sản phẩm"),
              images: item.images
                ? [item.images]
                : item.productImages
                ? [item.productImages]
                : [],
              tags: [],
              price: Number(item.price ?? item.unitPrice ?? 0),
              description: "",
              category: {
                id: "",
                name: "",
                slug: "",
                description: "",
                image: "",
                isActive: true,
              },
              isActive: true,
              stock: 0,
              rating: 0,
              reviewCount: 0,
              discount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          })),
          status:
            String(o.status ?? "0") === "0"
              ? "PLACED" // UNPAID - Chờ thanh toán
              : String(o.status ?? "1") === "1"
              ? "CONFIRMED" // PAID - Đã thanh toán/xác nhận
              : String(o.status ?? "2") === "2"
              ? "FAILED" // UNDISCHARGED - Thanh toán thất bại
              : String(o.status ?? "3") === "3"
              ? "SHIPPED" // PENDING - Đang giao
              : String(o.status ?? "4") === "4"
              ? "CANCELLED" // CANCELLED - Đã hủy
              : String(o.status ?? "5") === "5"
              ? "COMPLETED" // COMPLETED - Hoàn thành
              : String(o.status ?? "6") === "6"
              ? "DELIVERED" // DELIVERED - Đã giao
              : "PLACED",
          statusHistory: [],
          shippingAddress: {
            id: "",
            customerName: "",
            phoneNumber: "",
            province: "",
            district: "",
            street: String(o.shippingAddress ?? ""),
            ward: "",
            isDefault: false,

            name: "",
            phone: "",
            city: "",
          },
          paymentMethod: {
            id: "cod",
            type: "COD",
            name: "Thanh toán khi nhận hàng",
            description: "",
            isActive: true,
          },
          itemCount: Number(
            o.orderItems?.length ?? o.orderDetails?.length ?? 1
          ),
          subtotal: Number(o.totalPrice ?? o.total ?? 0),
          shippingFee: 0,
          discount: 0,
          total: Number(o.totalPrice ?? o.total ?? 0),
          notes: o.notes ?? undefined,
          estimatedDelivery: o.estimatedDelivery ?? undefined,
          trackingNumber: o.trackingNumber ?? undefined,
          images: orderItemsImages.length > 0 ? orderItemsImages : undefined,
          createdAt: o.createdAt ?? new Date().toISOString(),
          updatedAt: o.updatedAt ?? new Date().toISOString(),
        };
      });
      return {
        success: true,
        data: { orders: mapped, totalCount, hasNextPage },
      };
    } catch (error) {
      return {
        success: true,
        data: { orders: [], totalCount: 0, hasNextPage: false },
        message: "Failed to fetch orders",
      };
    }
  },

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
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { orderId: 0, totalPrice: 0 },
          message: "Chưa đăng nhập - Vui lòng đăng nhập lại",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;
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

      const isSuccess =
        data.status === 1 ||
        data.status === 201 ||
        data.status === 200 ||
        (data.orderId && typeof data.orderId === "number") ||
        (data.data?.orderId && typeof data.data.orderId === "number") ||
        (data.paymentUrl && typeof data.paymentUrl === "string") ||
        (data.message && data.message.includes("Order created"));
      if (isSuccess) {
        let orderId = data.orderId || data.data?.orderId || 0;

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
            paymentUrl: data.paymentUrl,
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

  async createPaymentUrl(paymentData: {
    orderId: number;
    amount: number;
    orderDescription: string;
    name: string;
    source?: string;
  }): Promise<ApiResponse<{ paymentUrl: string }>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { paymentUrl: "" },
          message: "Chưa đăng nhập - Vui lòng đăng nhập lại",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

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
      let paymentUrl = data?.url || data?.paymentUrl;

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
      return {
        success: false,
        data: { paymentUrl: "" },
        message: error?.message || "Lỗi tạo liên kết thanh toán",
      };
    }
  },

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
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { isSuccess: false },
          message: "Chưa đăng nhập - Vui lòng đăng nhập lại",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;
      const result = await PaymentService.getApiVnpayPaymentByOrderId({
        orderId,
      });
      const data = (result as any)?.data ?? result;

      const responseData = data.data || data;

      if (data.message && data.message.includes("Không tìm thấy Payment")) {
        return {
          success: true,
          data: {
            isSuccess: false,
            transactionId: undefined,
            amount: 0,
            payDate: undefined,
            vnpayResponseCode: undefined,
            isPending: true,
          },
        };
      }
      if ((data.status === 200 && data.data) || data.success !== undefined) {
        const vnpaySuccess = responseData.vnPayResponseCode === "00";
        const backendSuccess = responseData.success === true;

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
      return {
        success: false,
        data: { isSuccess: false },
        message: error?.message || "Lỗi kiểm tra trạng thái thanh toán",
      };
    }
  },

  async createOrderPayment(
    orderId: number
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { message: "" },
          message: "Chưa đăng nhập - Vui lòng đăng nhập lại",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;
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
      const o: any = res?.data?.data ?? res?.data ?? res;

      // Map orderDetails to items
      const items = (o.orderDetails ?? []).map((item: any) => ({
        id: String(item.orderDetailId ?? ""),
        productId: String(item.productId ?? ""),
        quantity: Number(item.quantity ?? 1),
        price: Number(item.unitPrice ?? item.price ?? 0),
        subtotal:
          Number(item.quantity ?? 1) *
          Number(item.unitPrice ?? item.price ?? 0),
        selected: false,
        product: {
          id: String(item.productId ?? ""),
          name: String(
            item.product?.productName ?? item.productName ?? "Sản phẩm"
          ),
          slug: "",
          sku: "",
          description: String(item.product?.description ?? ""),
          price: Number(item.product?.price ?? item.unitPrice ?? 0),
          categoryId: String(item.product?.categoryId ?? ""),
          images: item.product?.images
            ? typeof item.product.images === "string"
              ? [item.product.images]
              : []
            : [],
          rating: 0,
          reviewCount: 0,
          stock: Number(item.product?.stockQuantity ?? 0),
          isInStock: true,
          isFeatured: false,
          tags: [],
          unit: "",
          createdAt: item.product?.createdAt ?? new Date().toISOString(),
          updatedAt: item.product?.updatedAt ?? new Date().toISOString(),
        },
      }));

      // Parse shipping address
      const shippingAddr = String(o.shippingAddress ?? "");
      const addressParts = shippingAddr.split("\n");
      const namePhone = addressParts[0]?.split(" - ") ?? [];
      const customerName = namePhone[0]?.trim() ?? "";
      const phoneNumber = namePhone[1]?.trim() ?? "";
      const fullAddress = addressParts.slice(1).join(", ");

      // Map status - Mapping theo backend enum PaymentStatus
      const statusMap: Record<string, Order["status"]> = {
        "0": "PLACED", // UNPAID - Chờ thanh toán
        "1": "CONFIRMED", // PAID - Đã thanh toán/xác nhận
        "2": "PACKED", // UNDISCHARGED - Đang chuẩn bị
        "3": "SHIPPED", // PENDING - Đang giao
        "4": "CANCELLED", // CANCELLED - Đã hủy
        "5": "COMPLETED", // COMPLETED - Hoàn thành
        "6": "DELIVERED", // DELIVERED - Đã giao
      };

      const order: Order = {
        id: String(o.orderId ?? o.id),
        orderNumber: o.orderNumber ?? String(o.orderId ?? id),
        userId: String(o.customerId ?? o.userId ?? ""),
        items: items,
        status: statusMap[String(o.status ?? "1")] ?? "PLACED",
        statusHistory: [],
        shippingAddress: {
          id: "",
          customerName: customerName,
          phoneNumber: phoneNumber,
          province: "",
          district: "",
          street: fullAddress,
          ward: "",
          isDefault: false,
        },
        paymentMethod: {
          id: "cod",
          type: "COD",
          name: "Thanh toán khi nhận hàng",
          description: "",
          isActive: true,
        },
        itemCount: items.length,
        subtotal: Number(o.totalPrice ?? 0),
        shippingFee: 0,
        discount: 0,
        total: Number(o.totalPrice ?? 0),
        notes: o.notes ?? undefined,
        estimatedDelivery: o.estimatedDelivery ?? undefined,
        trackingNumber: o.trackingNumber ?? undefined,
        images: items
          .map((item: any) => item.product?.images?.[0])
          .filter((img: any) => img),
        createdAt: o.createdAt ?? new Date().toISOString(),
        updatedAt: o.updatedAt ?? new Date().toISOString(),
      };
      return { success: true, data: order };
    } catch (error) {
      return { success: false, data: null as any, message: "Order not found" };
    }
  },

  // Get full order detail with all backend data (customer, payments, etc.)
  async getFullDetailById(id: string): Promise<ApiResponse<any>> {
    try {
      const res = await OrderService.getApiV1OrderOrder({
        orderId: Number(id),
      });
      const fullData = res?.data?.data ?? res?.data ?? res;
      return { success: true, data: fullData };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error?.message || "Order not found",
      };
    }
  },

  async getByDate(params: {
    date: string; // Format: YYYY-MM-DD
    pageIndex?: number;
    pageSize?: number;
  }): Promise<
    ApiResponse<{ orders: Order[]; totalCount: number; hasNextPage: boolean }>
  > {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { orders: [], totalCount: 0, hasNextPage: false },
          message: "Not authenticated",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      // Format date as YYYY-MM-DD for the API
      const dateStr = params.date;

      const res = await OrderService.postApiV1OrderOrderListByDate({
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 15,
        requestBody: dateStr,
      });
      const payload = res?.data ?? res;

      const list: any[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];

      const totalCount = list.length;
      const hasNextPage = Boolean(
        (params?.pageIndex ?? 1) * (params?.pageSize ?? 15) < totalCount
      );

      const mapped: Order[] = list.map((o: any, idx: number) => {
        const orderItemsImages = (o.orderItems ?? o.orderDetails ?? [])
          .map((item: any) => item.images)
          .filter((img: any) => img && img.trim() !== "");
        return {
          id: String(o.orderId ?? o.id ?? idx),
          orderNumber: o.orderNumber ?? String(o.orderId ?? idx),
          userId: String(o.userId ?? o.customerId ?? ""),
          items: (o.orderItems ?? o.orderDetails ?? []).map((item: any) => ({
            id: String(item.id ?? item.orderDetailId ?? idx),
            productId: String(item.productId ?? ""),
            quantity: Number(item.quantity ?? item.stockQuantity ?? 1),
            price: Number(item.price ?? item.unitPrice ?? 0),
            product: {
              id: String(item.productId ?? ""),
              name: String(item.productName ?? "Sản phẩm"),
              images: item.images
                ? [item.images]
                : item.productImages
                ? [item.productImages]
                : [],
              tags: [],
              price: Number(item.price ?? item.unitPrice ?? 0),
              description: "",
              category: {
                id: "",
                name: "",
                slug: "",
                description: "",
                image: "",
                isActive: true,
              },
              isActive: true,
              stock: 0,
              rating: 0,
              reviewCount: 0,
              discount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          })),
          status:
            String(o.status ?? "0") === "0"
              ? "PLACED" // UNPAID - Chờ thanh toán
              : String(o.status ?? "1") === "1"
              ? "CONFIRMED" // PAID - Đã thanh toán/xác nhận
              : String(o.status ?? "2") === "2"
              ? "PACKED" // UNDISCHARGED - Đang chuẩn bị
              : String(o.status ?? "3") === "3"
              ? "SHIPPED" // PENDING - Đang giao
              : String(o.status ?? "4") === "4"
              ? "CANCELLED" // CANCELLED - Đã hủy
              : String(o.status ?? "5") === "5"
              ? "COMPLETED" // COMPLETED - Hoàn thành
              : String(o.status ?? "6") === "6"
              ? "DELIVERED" // DELIVERED - Đã giao
              : "PLACED",
          statusHistory: [],
          shippingAddress: {
            id: "",
            customerName: "",
            phoneNumber: "",
            province: "",
            district: "",
            street: String(o.shippingAddress ?? ""),
            ward: "",
            isDefault: false,
          },
          paymentMethod: {
            id: "cod",
            type: "COD",
            name: "Thanh toán khi nhận hàng",
            description: "",
            isActive: true,
          },
          itemCount: Number(
            o.orderItems?.length ?? o.orderDetails?.length ?? 1
          ),
          subtotal: Number(o.totalPrice ?? o.total ?? 0),
          shippingFee: 0,
          discount: 0,
          total: Number(o.totalPrice ?? o.total ?? 0),
          notes: o.notes ?? undefined,
          estimatedDelivery: o.estimatedDelivery ?? undefined,
          trackingNumber: o.trackingNumber ?? undefined,
          images: orderItemsImages.length > 0 ? orderItemsImages : undefined,
          createdAt: o.createdAt ?? new Date().toISOString(),
          updatedAt: o.updatedAt ?? new Date().toISOString(),
        };
      });

      return {
        success: true,
        data: { orders: mapped, totalCount, hasNextPage },
      };
    } catch (error) {
      return {
        success: false,
        data: { orders: [], totalCount: 0, hasNextPage: false },
        message: "Failed to fetch orders by date",
      };
    }
  },

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

  async cancelOrder(
    orderId: number
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: { message: "" },
          message: "Chưa đăng nhập - Vui lòng đăng nhập lại",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;
      const result = await OrderService.putApiV1OrderUpdateCancelStatus({
        orderId,
      });
      const data = (result as any)?.data ?? result;
      return {
        success: true,
        data: { message: data.message || "Hủy đơn hàng thành công" },
      };
    } catch (error: any) {
      console.error("Cancel order error:", error);
      return {
        success: false,
        data: { message: "" },
        message: error?.message || "Lỗi hủy đơn hàng",
      };
    }
  },
};

export const addressesApi = {
  async getAll(): Promise<ApiResponse<Address[]>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: [],
          message: "Not authenticated",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;
      const result = await __request(OpenAPI, {
        method: "GET",
        url: "/api/v1/Address",
      });
      const response = (result as any)?.data ?? result;

      const addressList = response?.data ?? response ?? [];
      const addresses: Address[] = Array.isArray(addressList)
        ? addressList.map((addr: any) => ({
            id: String(addr.addressId ?? addr.id ?? ""),
            customerName: addr.customerName ?? "",
            phoneNumber: addr.phoneNumber ?? "",
            province: addr.province ?? "",
            district: addr.district ?? "",
            ward: addr.ward ?? "",
            street: addr.street ?? "",
            isDefault: Boolean(addr.isDefault ?? false),
            latitude: addr.latitude,
            longitude: addr.longitude,

            name: addr.customerName,
            phone: addr.phoneNumber,
            city: addr.province,
          }))
        : [];
      return { success: true, data: addresses };
    } catch (error) {
      return {
        success: true,
        data: [],
        message: "Failed to fetch addresses",
      };
    }
  },
  async getById(id: string): Promise<ApiResponse<Address>> {
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
      OpenAPI.TOKEN = token;
      const result = await __request(OpenAPI, {
        method: "GET",
        url: `/api/v1/Address/${id}`,
      });
      const response = (result as any)?.data ?? result;
      const addr = response?.data ?? response;
      const address: Address = {
        id: String(addr.addressId ?? addr.id ?? id),
        customerName: addr.customerName ?? "",
        phoneNumber: addr.phoneNumber ?? "",
        province: addr.province ?? "",
        district: addr.district ?? "",
        ward: addr.ward ?? "",
        street: addr.street ?? "",
        isDefault: Boolean(addr.isDefault ?? false),
        latitude: addr.latitude,
        longitude: addr.longitude,
      };
      return { success: true, data: address };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: "Address not found",
      };
    }
  },
  async create(
    addressData: Omit<Address, "id">
  ): Promise<ApiResponse<Address>> {
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
      OpenAPI.TOKEN = token;
      const requestBody = {
        customerName: addressData.customerName,
        phoneNumber: addressData.phoneNumber,
        province: addressData.province,
        district: addressData.district,
        ward: addressData.ward,
        street: addressData.street,
        isDefault: addressData.isDefault ?? false,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
      };
      const result = await __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/Address",
        body: requestBody,
        mediaType: "application/json",
      });
      const response = (result as any)?.data ?? result;
      const addr = response?.data ?? response;
      const address: Address = {
        id: String(addr.addressId ?? addr.id ?? ""),
        customerName: addr.customerName ?? addressData.customerName,
        phoneNumber: addr.phoneNumber ?? addressData.phoneNumber,
        province: addr.province ?? addressData.province,
        district: addr.district ?? addressData.district,
        ward: addr.ward ?? addressData.ward,
        street: addr.street ?? addressData.street,
        isDefault: Boolean(addr.isDefault ?? addressData.isDefault),
        latitude: addr.latitude ?? addressData.latitude,
        longitude: addr.longitude ?? addressData.longitude,
      };
      return { success: true, data: address };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to create address",
      };
    }
  },
  async update(
    id: string,
    addressData: Partial<Address>
  ): Promise<ApiResponse<Address>> {
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
      OpenAPI.TOKEN = token;
      const requestBody: any = {};
      if (addressData.customerName !== undefined)
        requestBody.customerName = addressData.customerName;
      if (addressData.phoneNumber !== undefined)
        requestBody.phoneNumber = addressData.phoneNumber;
      if (addressData.province !== undefined)
        requestBody.province = addressData.province;
      if (addressData.district !== undefined)
        requestBody.district = addressData.district;
      if (addressData.ward !== undefined) requestBody.ward = addressData.ward;
      if (addressData.street !== undefined)
        requestBody.street = addressData.street;
      if (addressData.isDefault !== undefined)
        requestBody.isDefault = addressData.isDefault;
      if (addressData.latitude !== undefined)
        requestBody.latitude = addressData.latitude;
      if (addressData.longitude !== undefined)
        requestBody.longitude = addressData.longitude;
      const result = await __request(OpenAPI, {
        method: "PUT",
        url: `/api/v1/Address/${id}`,
        body: requestBody,
        mediaType: "application/json",
      });
      const response = (result as any)?.data ?? result;
      const addr = response?.data ?? response;
      const address: Address = {
        id: String(addr.addressId ?? addr.id ?? id),
        customerName: addr.customerName ?? addressData.customerName ?? "",
        phoneNumber: addr.phoneNumber ?? addressData.phoneNumber ?? "",
        province: addr.province ?? addressData.province ?? "",
        district: addr.district ?? addressData.district ?? "",
        ward: addr.ward ?? addressData.ward ?? "",
        street: addr.street ?? addressData.street ?? "",
        isDefault: Boolean(addr.isDefault ?? addressData.isDefault ?? false),
        latitude: addr.latitude ?? addressData.latitude,
        longitude: addr.longitude ?? addressData.longitude,
      };
      return { success: true, data: address };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to update address",
      };
    }
  },
  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: null,
          message: "Not authenticated",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;
      await __request(OpenAPI, {
        method: "DELETE",
        url: `/api/v1/Address/${id}`,
      });
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Failed to delete address",
      };
    }
  },
};

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
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to upload image",
      };
    }
  },
  async changePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse<null>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: null,
          message: "Chưa đăng nhập",
        };
      }
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;
      await AccountService.putApiV1AccountUpdatePassword({
        requestBody: {
          oldPassword,
          newPassword,
          confirmPassword,
        },
      });
      return {
        success: true,
        data: null,
        message: "Đổi mật khẩu thành công",
      };
    } catch (error: any) {
      if (error?.status === 401 || error?.statusCode === 401) {
        return {
          success: false,
          data: null,
          message: "Phiên đăng nhập hết hạn",
          errors: { auth: ["Vui lòng đăng nhập lại"] },
        };
      }
      if (error?.status === 400 || error?.statusCode === 400) {
        const errorMessage =
          error?.body?.message ||
          error?.message ||
          "Mật khẩu hiện tại không đúng";
        return {
          success: false,
          data: null,
          message: errorMessage,
          errors: { oldPassword: [errorMessage] },
        };
      }
      if (error?.status === 429 || error?.statusCode === 429) {
        return {
          success: false,
          data: null,
          message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
        };
      }
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Đổi mật khẩu thất bại",
      };
    }
  },
};

const onboardingSlides: any[] = [];
export const onboardingApi = {
  async getSlides(): Promise<ApiResponse<typeof onboardingSlides>> {
    return {
      success: true,
      data: await withDelay(onboardingSlides),
    };
  },
};
