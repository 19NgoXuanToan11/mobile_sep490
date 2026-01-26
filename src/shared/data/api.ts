import { User, Category, Product, Banner, Address, PaymentMethod, Order, LoginFormData, RegisterFormData, ApiResponse, CartItem } from "../../types";
import { OpenAPI, AccountService, AccountProfileService, ProductService, CategoryService, OrderService, PaymentService, FeedbackService, CreateFeedbackDTO } from "../../api";
import { request as __request } from "../../api/core/request";
import env from "../../config/env";
import { storage, authStorage, STORAGE_KEYS } from "../lib/storage";
import { realCartApi } from "./cartApiService";
import { authService } from "../services/authService";
import { productService, categoryService } from "../services/productService";
import { sleep } from "../lib/helpers";

function normalizeOrderStatus(status: any): number {
  if (typeof status === "number" && !Number.isNaN(status)) return status;

  const raw = String(status ?? "").trim().toUpperCase();

  switch (raw) {
    case "ACTIVE":
    case "PAID":
    case "CONFIRMED":
    case "CONFIRM":
    case "PAYMENT_SUCCESS":
      return 1;
    case "PROCESSING":
    case "PROCESS":
    case "PREPARING":
    case "PACKING":
      return 2;
    case "PENDING":
    case "WAITING":
    case "UNPAID":
      return 0;
    case "SHIPPING":
    case "DELIVERING":
    case "DELIVERED":
    case "IN_DELIVERY":
      return 6;
    case "COMPLETED":
    case "DONE":
      return 5;
    case "CANCELLED":
    case "CANCELED":
    case "CANCEL":
      return 4;
    case "FAILED":
    case "FAIL":
    case "PAYMENT_FAILED":
      return 2;
    case "REFUNDED":
      return 4;
    default:
      return 0;
  }
}

function mapMobileStatus(normalized: number): Order["status"] {
  switch (normalized) {
    case 0:
      return "PLACED";
    case 1:
      return "CONFIRMED";
    case 2:
      return "FAILED";
    case 3:
      return "PENDING";
    case 4:
      return "CANCELLED";
    case 5:
      return "COMPLETED";
    case 6:
      return "DELIVERED";
    default:
      return "PLACED";
  }
}

function mapBackendStatusToMobile(status: any): Order["status"] {
  return mapMobileStatus(normalizeOrderStatus(status));
}

function extractOrderStatus(o: any): any {
  const candidates = [
    o?.paymentStatus,
    o?.paymentStatusId,
    o?.status,
    o?.statusId,
    o?.orderStatus,
    o?.orderStatusId,
    o?.payment?.status,
    o?.payment?.paymentStatus,
    o?.payment?.paymentStatusId,
    o?.paymentResult?.status,
    o?.paymentResult?.paymentStatus,
    o?.paymentTransaction?.status,
    o?.paymentTransaction?.paymentStatus,
  ];

  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== "") {
      return c;
    }
  }

  return o?.status;
}

export const authApi = {
  login: (credentials: LoginFormData) => authService.login(credentials),
  register: (userData: RegisterFormData) => authService.register(userData),
  logout: () => authService.logout(),
  getCurrentUser: () => authService.getCurrentUser(),
};

export const categoriesApi = {
  getAll: () => categoryService.getAll(),
  getById: (id: string) => categoryService.getById(id),
};

export const productsApi = {
  getAll: (filters?: any, page = 1, limit = 20) =>
    productService.getAll(filters, page, limit),
  getById: (id: string) => productService.getById(id),
  getFeatured: (limit = 6) => productService.getFeatured(limit),
  search: (query: string, limit = 20) => productService.search(query, limit),
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
      const payload: any = res?.data ?? res;
      const list: any[] = payload?.items ?? payload?.data ?? [];
      const items: FeedbackItem[] = list.map((f: any, idx: number) => ({
        id: String(f.feedbackId ?? f.id ?? idx),
        comment: f.comment ?? "",
        rating: f.rating ?? null,
        createdAt: typeof f.createdAt === "string" ? f.createdAt : f.createdAt?.toString?.() ?? new Date().toISOString(),
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
            totalPages: Math.ceil(Number(payload?.totalItemCount ?? items.length) / limit),
            hasNext: page * limit < Number(payload?.totalItemCount ?? items.length),
            hasPrev: page > 1,
          },
        },
      } as const;
    } catch {
      return {
        success: true,
        data: {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: page > 1 },
        },
        message: "Failed to fetch feedback",
      } as const;
    }
  },

  async create(input: { comment: string; rating?: number | null; customerId: number }) {
    try {
      OpenAPI.BASE = env.API_URL;
      const body: CreateFeedbackDTO = {
        comment: input.comment,
        rating: input.rating ?? null,
        customerId: input.customerId,
      } as any;
      const res = await FeedbackService.postApiV1FeedbackCreateFeedback({ requestBody: body });
      return { success: true, data: (res as any)?.data ?? (res as any) } as const;
    } catch {
      return { success: false, data: null as any, message: "Failed to create feedback" } as const;
    }
  },
};

export const bannersApi = {
  async getActive(): Promise<ApiResponse<Banner[]>> {
    return { success: true, data: [] };
  },
};

export const cartApi = {
  async getItems(isAuthenticated: boolean = false): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.getItems();
    }

    const items = (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
    return { success: true, data: items };
  },

  async addItem(productId: string, quantity = 1, isAuthenticated: boolean = false): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.addItem(productId, quantity);
    }

    await sleep(300);
    return { success: false, data: null as any, message: "Product not found" };
  },

  async updateQuantity(itemId: string, quantity: number, isAuthenticated: boolean = false): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.updateQuantity(itemId, quantity);
    }
    return { success: true, data: [] };
  },

  async removeItem(itemId: string, isAuthenticated: boolean = false): Promise<ApiResponse<CartItem[]>> {
    if (isAuthenticated) {
      return await realCartApi.removeItem(itemId);
    }
    return { success: true, data: [] };
  },

  async clear(isAuthenticated: boolean = false): Promise<ApiResponse<null>> {
    if (isAuthenticated) {
      return await realCartApi.clear();
    }
    return { success: true, data: null };
  },
};

export const ordersApi = {
  async getAll(params?: { pageIndex?: number; pageSize?: number; status?: string }): Promise<
    ApiResponse<{ orders: Order[]; totalCount: number; hasNextPage: boolean }>
  > {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: { orders: [], totalCount: 0, hasNextPage: false }, message: "Not authenticated" };
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
      const totalCount = payload?.totalItemCount ?? payload?.totalCount ?? payload?.total ?? list.length;

      const mapped: Order[] = list.map((o: any, idx: number) => {
        const orderItemsImages = (o.orderItems ?? o.orderDetails ?? []).map((item: any) => item.images).filter((img: any) => img && img.trim() !== "");
        const mobileStatus = mapBackendStatusToMobile(extractOrderStatus(o));

        return {
          id: String(o.orderId ?? o.id ?? idx),
          orderNumber: o.orderNumber ?? String(o.orderId ?? idx),
          userId: String(o.userId ?? o.customerId ?? ""),
          items: (o.orderItems ?? o.orderDetails ?? []).map((item: any) => ({
            id: String(item.orderDetailId ?? item.id ?? idx),
            productId: String(item.productId ?? ""),
            quantity: Number(item.quantity ?? item.stockQuantity ?? 1),
            price: Number(item.price ?? item.unitPrice ?? 0),
            product: { id: String(item.productId ?? ""), name: String(item.productName ?? "Sản phẩm"), images: [], tags: [], price: 0, description: "", category: { id: "", name: "", slug: "", description: "", image: "", isActive: true }, isActive: true, stock: 0, rating: 0, reviewCount: 0, discount: 0, createdAt: "", updatedAt: "" },
          })),
          status: mobileStatus,
          statusHistory: [],
          shippingAddress: { id: "", customerName: "", phoneNumber: "", province: "", district: "", street: String(o.shippingAddress ?? ""), ward: "", isDefault: false, name: "", phone: "", city: "" },
          paymentMethod: { id: "cod", type: "COD", name: "Thanh toán khi nhận hàng", description: "", isActive: true },
          itemCount: Number(o.orderItems?.length ?? o.orderDetails?.length ?? 1),
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

      return { success: true, data: { orders: mapped, totalCount, hasNextPage: Boolean(payload?.next ?? payload?.hasNextPage) } };
    } catch {
      return { success: true, data: { orders: [], totalCount: 0, hasNextPage: false }, message: "Failed to fetch orders" };
    }
  },

  async create(orderData: { orderItems: Array<{ productId: number; stockQuantity: number }>; shippingAddress: string }): Promise<ApiResponse<any>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: { orderId: 0, totalPrice: 0 }, message: "Chưa đăng nhập" };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      const result = await OrderService.postApiV1OrderCreate({
        requestBody: {
          orderItems: orderData.orderItems.map((item) => ({ productId: item.productId, stockQuantity: item.stockQuantity })),
          shippingAddress: orderData.shippingAddress,
        },
      });

      const data = (result as any)?.data ?? result;
      return { success: true, data, message: data.message || "Đơn hàng được tạo thành công" };
    } catch (error: any) {
      return { success: false, data: { orderId: 0, totalPrice: 0 }, message: error?.response?.data?.message || error?.message || "Lỗi tạo đơn hàng" };
    }
  },

  async cancelOrder(orderId: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: { message: "" }, message: "Chưa đăng nhập" };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      const result = await OrderService.putApiV1OrderUpdateCancelStatus({ orderId });
      const data = (result as any)?.data ?? result;
      return { success: true, data: { message: data.message || "Hủy đơn hàng thành công" } };
    } catch (error: any) {
      return { success: false, data: { message: "" }, message: error?.message || "Lỗi hủy đơn hàng" };
    }
  },

  async getById(id: string): Promise<ApiResponse<Order>> {
    try {
      const res = await OrderService.getApiV1OrderOrder({ orderId: Number(id) });
      const o: any = res?.data?.data ?? res?.data ?? res;
      return { success: true, data: o };
    } catch {
      return { success: false, data: null as any, message: "Order not found" };
    }
  },

  async getByDate(params: { date: string; pageIndex?: number; pageSize?: number }): Promise<ApiResponse<any>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: null, message: "Not authenticated" };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      const res = await OrderService.postApiV1OrderOrderListByDate({
        pageIndex: params.pageIndex ?? 1,
        pageSize: params.pageSize ?? 10,
        requestBody: params.date,
      });
      return { success: true, data: (res as any)?.data ?? res };
    } catch (error: any) {
      return { success: false, data: null, message: error?.message || "Failed to fetch orders by date" };
    }
  },

  async createOrderPayment(orderId: number): Promise<ApiResponse<any>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: null, message: "Not authenticated" };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      const result = await OrderService.postApiV1OrderCreateOrderPayment({ orderId });
      const data = (result as any)?.data ?? result;
      return { success: true, data, message: data.message || "Payment created" };
    } catch (error: any) {
      return { success: false, data: null, message: error?.response?.data?.message || error?.message || "Lỗi tạo thanh toán" };
    }
  },
};

export const addressesApi = {
  async getAll(): Promise<ApiResponse<Address[]>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: [], message: "Not authenticated" };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      const result = await __request(OpenAPI, { method: "GET", url: "/api/v1/Address" });
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
    } catch {
      return { success: true, data: [], message: "Failed to fetch addresses" };
    }
  },

  async create(addressData: Omit<Address, "id">): Promise<ApiResponse<Address>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: null as any, message: "Not authenticated" };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      const result = await __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/Address",
        body: {
          customerName: addressData.customerName,
          phoneNumber: addressData.phoneNumber,
          province: addressData.province,
          district: addressData.district,
          ward: addressData.ward,
          street: addressData.street,
          isDefault: addressData.isDefault ?? false,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
        },
        mediaType: "application/json",
      });

      const response = (result as any)?.data ?? result;
      return { success: true, data: response?.data ?? response };
    } catch (error) {
      return { success: false, data: null as any, message: error instanceof Error ? error.message : "Failed to create address" };
    }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: null, message: "Not authenticated" };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      await __request(OpenAPI, { method: "DELETE", url: `/api/v1/Address/${id}` });
      return { success: true, data: null };
    } catch (error) {
      return { success: false, data: null, message: error instanceof Error ? error.message : "Failed to delete address" };
    }
  },
};


export const paymentMethodsApi = {
  async getAll(): Promise<ApiResponse<PaymentMethod[]>> {
    const methods: PaymentMethod[] = [
      { id: "cod", type: "COD", name: "Thanh toán khi nhận hàng", description: "Thanh toán bằng tiền mặt khi nhận hàng", isActive: true },
      { id: "vnpay", type: "E_WALLET", name: "VNPay", description: "Thanh toán trực tuyến qua VNPay", isActive: true },
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
        return { success: false, data: null as any, message: "Not authenticated" };
      }

      OpenAPI.BASE = env.API_URL;
      const response = await AccountProfileService.getApiV1AccountProfileProfile();
      return { success: true, data: (response as any)?.data ?? (response as any) };
    } catch (error) {
      return { success: false, data: null as any, message: error instanceof Error ? error.message : "Failed to get profile" };
    }
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<ProfileData>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: null as any, message: "Not authenticated" };
      }

      OpenAPI.BASE = env.API_URL;
      const response = await AccountProfileService.putApiV1AccountProfileUpdate({ requestBody: profileData as any });
      return { success: true, data: (response as any)?.data ?? (response as any) };
    } catch (error) {
      return { success: false, data: null as any, message: error instanceof Error ? error.message : "Failed to update profile" };
    }
  },

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<null>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return { success: false, data: null, message: "Chưa đăng nhập" };
      }

      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;

      await AccountService.putApiV1AccountUpdatePassword({
        requestBody: { oldPassword, newPassword, confirmPassword },
      });

      return { success: true, data: null, message: "Đổi mật khẩu thành công" };
    } catch (error: any) {
      if (error?.status === 401 || error?.statusCode === 401) {
        return { success: false, data: null, message: "Phiên đăng nhập hết hạn", errors: { auth: ["Vui lòng đăng nhập lại"] } };
      }
      return { success: false, data: null, message: error?.body?.message || error?.message || "Đổi mật khẩu thất bại" };
    }
  },
};
