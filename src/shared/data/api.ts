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
import {
  onboardingSlides,
  categories,
  products,
  banners,
  sampleUser,
  addresses,
  paymentMethods,
  orders,
} from "./fixtures";
import { sleep, getRandomDelay, generateId } from "../lib/utils";
import { storage, authStorage, STORAGE_KEYS } from "../lib/storage";
import { apiClient } from "../config/api";
import API_CONFIG from "../config/api";

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
    await sleep(getRandomDelay());

    // Simple validation for demo
    if (
      credentials.email === "demo@ifms.com" &&
      credentials.password === "password"
    ) {
      const token = `fake_token_${generateId()}`;
      await authStorage.setTokens(token);

      return {
        success: true,
        data: {
          user: sampleUser,
          token,
        },
      };
    }

    return {
      success: false,
      data: null as any,
      message: "Invalid email or password",
      errors: {
        email: ["Invalid credentials"],
      },
    };
  },

  async register(
    userData: RegisterFormData
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiClient.post<{
        user: User;
        token: string;
      }>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      });

      // Store the token
      if (response.token) {
        await authStorage.setTokens(response.token);
      }

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Register error:", error);
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
    await sleep(300);
    const token = await authStorage.getAccessToken();

    if (!token) {
      return {
        success: false,
        data: null as any,
        message: "Not authenticated",
      };
    }

    return {
      success: true,
      data: sampleUser,
    };
  },
};

// Categories API
export const categoriesApi = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    const data = await withDelay(
      [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
    );
    return {
      success: true,
      data,
    };
  },

  async getById(id: string): Promise<ApiResponse<Category>> {
    const category = categories.find((c) => c.id === id);

    if (!category) {
      return {
        success: false,
        data: null as any,
        message: "Category not found",
      };
    }

    return {
      success: true,
      data: await withDelay(category),
    };
  },
};

// Products API
export const productsApi = {
  async getAll(
    filters?: Partial<FilterState>,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    await sleep(getRandomDelay());

    let filteredProducts = [...products];

    // Apply filters
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        filteredProducts = filteredProducts.filter((p) =>
          filters.categories!.includes(p.categoryId)
        );
      }

      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= minPrice && p.price <= maxPrice
        );
      }

      if (filters.inStockOnly) {
        filteredProducts = filteredProducts.filter((p) => p.isInStock);
      }
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "name":
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "price_asc":
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case "newest":
          filteredProducts.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedProducts,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / limit),
          hasNext: endIndex < filteredProducts.length,
          hasPrev: page > 1,
        },
      },
    };
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    const product = products.find((p) => p.id === id);

    if (!product) {
      return {
        success: false,
        data: null as any,
        message: "Product not found",
      };
    }

    return {
      success: true,
      data: await withDelay(product),
    };
  },

  async getFeatured(limit = 6): Promise<ApiResponse<Product[]>> {
    const featuredProducts = products
      .filter((p) => p.isFeatured && p.isInStock)
      .slice(0, limit);

    return {
      success: true,
      data: await withDelay(featuredProducts),
    };
  },

  async search(query: string, limit = 20): Promise<ApiResponse<Product[]>> {
    await sleep(getRandomDelay());

    const searchResults = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, limit);

    return {
      success: true,
      data: searchResults,
    };
  },
};

// Banners API
export const bannersApi = {
  async getActive(): Promise<ApiResponse<Banner[]>> {
    const activebanners = banners
      .filter((b) => b.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      success: true,
      data: await withDelay(activebanners),
    };
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

    const product = products.find((p) => p.id === productId);
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
    const userOrders = [...orders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      success: true,
      data: await withDelay(userOrders),
    };
  },

  async getById(id: string): Promise<ApiResponse<Order>> {
    const order = orders.find((o) => o.id === id);

    if (!order) {
      return {
        success: false,
        data: null as any,
        message: "Order not found",
      };
    }

    return {
      success: true,
      data: await withDelay(order),
    };
  },

  async create(checkoutData: CheckoutFormData): Promise<ApiResponse<Order>> {
    await sleep(getRandomDelay());

    const cartItems =
      (await storage.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS)) || [];
    const address = addresses.find((a) => a.id === checkoutData.addressId);
    const paymentMethod = paymentMethods.find(
      (p) => p.id === checkoutData.paymentMethodId
    );

    if (!address || !paymentMethod) {
      return {
        success: false,
        data: null as any,
        message: "Invalid address or payment method",
      };
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = 25000;
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    const newOrder: Order = {
      id: generateId("order"),
      orderNumber: `ORD-2024-${String(orders.length + 1).padStart(3, "0")}`,
      userId: sampleUser.id,
      items: cartItems,
      status: "PLACED",
      statusHistory: [
        {
          id: generateId("status"),
          status: "PLACED",
          timestamp: new Date().toISOString(),
          description: "Đơn hàng đã được đặt thành công",
        },
      ],
      shippingAddress: address,
      paymentMethod,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      shippingFee,
      discount,
      total,
      notes: checkoutData.notes,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      trackingNumber: `TRK2024${String(orders.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to orders list (in real app, this would be persisted on server)
    orders.unshift(newOrder);

    // Clear cart
    await storage.removeItem(STORAGE_KEYS.CART_ITEMS);

    return {
      success: true,
      data: newOrder,
    };
  },
};

// Addresses API
export const addressesApi = {
  async getAll(): Promise<ApiResponse<Address[]>> {
    return {
      success: true,
      data: await withDelay([...addresses]),
    };
  },

  async getById(id: string): Promise<ApiResponse<Address>> {
    const address = addresses.find((a) => a.id === id);

    if (!address) {
      return {
        success: false,
        data: null as any,
        message: "Address not found",
      };
    }

    return {
      success: true,
      data: await withDelay(address),
    };
  },

  async create(
    addressData: Omit<Address, "id">
  ): Promise<ApiResponse<Address>> {
    await sleep(getRandomDelay());

    // Create new address
    const newAddress: Address = {
      id: generateId("address"),
      ...addressData,
    };

    // If this is set as default, update other addresses
    if (addressData.isDefault) {
      addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Add to addresses list (in real app, this would be persisted on server)
    addresses.push(newAddress);

    return {
      success: true,
      data: newAddress,
    };
  },

  async update(
    id: string,
    addressData: Partial<Address>
  ): Promise<ApiResponse<Address>> {
    await sleep(getRandomDelay());

    const addressIndex = addresses.findIndex((addr) => addr.id === id);
    if (addressIndex === -1) {
      return {
        success: false,
        data: null as any,
        message: "Address not found",
      };
    }

    // If this is set as default, update other addresses
    if (addressData.isDefault) {
      addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Update address
    addresses[addressIndex] = { ...addresses[addressIndex], ...addressData };

    return {
      success: true,
      data: addresses[addressIndex],
    };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await sleep(getRandomDelay());

    const addressIndex = addresses.findIndex((addr) => addr.id === id);
    if (addressIndex === -1) {
      return {
        success: false,
        data: null,
        message: "Address not found",
      };
    }

    // Remove address
    addresses.splice(addressIndex, 1);

    return {
      success: true,
      data: null,
    };
  },
};

// Payment Methods API
export const paymentMethodsApi = {
  async getAll(): Promise<ApiResponse<PaymentMethod[]>> {
    const activeMethods = paymentMethods.filter((pm) => pm.isActive);
    return {
      success: true,
      data: await withDelay(activeMethods),
    };
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

      const response = await apiClient.get<ProfileData>(
        API_CONFIG.ENDPOINTS.PROFILE.GET,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : "Failed to get profile",
      };
    }
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<ProfileData>> {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        return {
          success: false,
          data: null as any,
          message: "Not authenticated",
        };
      }

      const response = await apiClient.put<ProfileData>(
        API_CONFIG.ENDPOINTS.PROFILE.UPDATE,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  },

  async uploadProfileImage(imageUri: string): Promise<ApiResponse<{ imageUrl: string }>> {
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

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/upload/profile-image`, {
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
        message: error instanceof Error ? error.message : "Failed to upload image",
      };
    }
  },
};

// Onboarding API
export const onboardingApi = {
  async getSlides(): Promise<ApiResponse<typeof onboardingSlides>> {
    return {
      success: true,
      data: await withDelay(onboardingSlides),
    };
  },
};
