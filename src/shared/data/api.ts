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
import { authService } from "../services/authService";
import { productService, categoryService } from "../services/productService";

const withDelay = async <T>(data: T, delay?: number): Promise<T> => {
  await sleep(delay ?? getRandomDelay());
  return data;
};

// Auth API - Uses service layer
export const authApi = {
  login: (credentials: LoginFormData) => authService.login(credentials),
  register: (userData: RegisterFormData) => authService.register(userData),
  logout: () => authService.logout(),
  getCurrentUser: () => authService.getCurrentUser(),
};

// Categories API - Uses service layer
export const categoriesApi = {
  getAll: () => categoryService.getAll(),
  getById: (id: string) => categoryService.getById(id),
};

// Products API - Uses service layer
export const productsApi = {
  getAll: (filters?: Partial<FilterState>, page = 1, limit = 20) =>
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
            id: String(item.orderDetailId ?? item.id ?? idx),
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
          status: (() => {
            const statusValue = String(o.status ?? "0");
            // Nếu status = 2 (UNDISCHARGED), hiển thị "FAILED" (Thất bại)
            // Vì khi payment failed, backend set status = 2
            // Khi payment thành công, backend set status = PAID (1), không phải 2
            if (statusValue === "2") {
              return "FAILED"; // Thanh toán thất bại
            }
            // Các status khác giữ nguyên logic cũ
            return statusValue === "0"
              ? "PLACED" // UNPAID - Chờ thanh toán
              : statusValue === "1"
              ? "CONFIRMED" // PAID - Đã thanh toán/xác nhận
              : statusValue === "3"
              ? "PENDING" // PENDING - Chờ xác nhận
              : statusValue === "4"
              ? "CANCELLED" // CANCELLED - Đã hủy
              : statusValue === "5"
              ? "COMPLETED" // COMPLETED - Hoàn thành
              : statusValue === "6"
              ? "DELIVERED" // DELIVERED - Đã giao
              : "PLACED";
          })(),
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
      // Nếu status = 2 (UNDISCHARGED), hiển thị "FAILED" (Thất bại)
      // Vì khi payment failed, backend set status = 2
      // Khi payment thành công, backend set status = PAID (1), không phải 2
      const statusValue = String(o.status ?? "0");
      let mappedStatus: Order["status"];
      if (statusValue === "2") {
        mappedStatus = "FAILED"; // Thanh toán thất bại
      } else {
        const statusMap: Record<string, Order["status"]> = {
          "0": "PLACED", // UNPAID - Chờ thanh toán
          "1": "CONFIRMED", // PAID - Đã thanh toán/xác nhận
          "3": "PENDING", // PENDING - Chờ xác nhận
          "4": "CANCELLED", // CANCELLED - Đã hủy
          "5": "COMPLETED", // COMPLETED - Hoàn thành
          "6": "DELIVERED", // DELIVERED - Đã giao
        };
        mappedStatus = statusMap[statusValue] || "PLACED";
      }

      const order: Order = {
        id: String(o.orderId ?? o.id),
        orderNumber: o.orderNumber ?? String(o.orderId ?? id),
        userId: String(o.customerId ?? o.userId ?? ""),
        items: items,
        status: mappedStatus,
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
            id: String(item.orderDetailId ?? item.id ?? idx),
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
          status: (() => {
            const statusValue = String(o.status ?? "0");
            // Nếu status = 2 (UNDISCHARGED), hiển thị "FAILED" (Thất bại)
            // Vì khi payment failed, backend set status = 2
            // Khi payment thành công, backend set status = PAID (1), không phải 2
            if (statusValue === "2") {
              return "FAILED"; // Thanh toán thất bại
            }
            // Các status khác giữ nguyên logic cũ
            return statusValue === "0"
              ? "PLACED" // UNPAID - Chờ thanh toán
              : statusValue === "1"
              ? "CONFIRMED" // PAID - Đã thanh toán/xác nhận
              : statusValue === "3"
              ? "PENDING" // PENDING - Chờ xác nhận
              : statusValue === "4"
              ? "CANCELLED" // CANCELLED - Đã hủy
              : statusValue === "5"
              ? "COMPLETED" // COMPLETED - Hoàn thành
              : statusValue === "6"
              ? "DELIVERED" // DELIVERED - Đã giao
              : "PLACED";
          })(),
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
      return {
        success: false,
        data: { message: "" },
        message: error?.message || "Lỗi hủy đơn hàng",
      };
    }
  },

  async buyAgain(orderId: number): Promise<ApiResponse<{ message: string }>> {
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

      const result = await __request(OpenAPI, {
        method: "POST",
        url: `/api/v1/account/buy-again/${orderId}`,
      });

      // Backend returns ResponseDTO with Status (capital S), Message, and Data
      // SUCCESS_CREATE_CODE = 1, FAIL_READ_CODE = -1, WARNING_NO_DATA_CODE = 4, FAIL_CREATE_CODE = -1
      const payload = (result as any)?.data ?? result;

      // Check the Status field from ResponseDTO (backend uses capital S)
      const responseStatus =
        payload?.Status ?? payload?.status ?? payload?.code;
      const message = payload?.Message ?? payload?.message ?? "";

      // SUCCESS_CREATE_CODE = 1 means success
      if (responseStatus === 1) {
        return {
          success: true,
          data: {
            message:
              message || "Đã thêm tất cả sản phẩm vào giỏ hàng thành công",
          },
        };
      }

      // FAIL_READ_CODE = -1 or WARNING_NO_DATA_CODE = 4 means bad request
      if (responseStatus === -1 || responseStatus === 4) {
        return {
          success: false,
          data: { message: "" },
          message: message || "Không thể mua lại đơn hàng này",
        };
      }

      // Any other status is an error
      return {
        success: false,
        data: { message: "" },
        message: message || "Lỗi khi thêm sản phẩm vào giỏ hàng",
      };
    } catch (error: any) {
      // Handle HTTP errors (400, 500, etc.)
      const errorPayload = error?.response?.data ?? error?.body ?? error;
      const errorStatus = errorPayload?.Status ?? errorPayload?.status;
      const errorMessage =
        errorPayload?.Message ??
        errorPayload?.message ??
        error?.message ??
        "Lỗi khi mua lại đơn hàng";

      // If backend returned a structured error with Status = 1, it's actually success
      // This handles cases where HTTP error but Status = 1 (shouldn't happen but just in case)
      if (errorStatus === 1) {
        return {
          success: true,
          data: {
            message:
              errorMessage || "Đã thêm tất cả sản phẩm vào giỏ hàng thành công",
          },
        };
      }

      return {
        success: false,
        data: { message: "" },
        message: errorMessage,
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
