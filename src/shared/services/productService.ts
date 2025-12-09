import {
  Product,
  Category,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from "../../types";
import { OpenAPI, ProductService, CategoryService } from "../../api";
import env from "../../config/env";
import { normalizeImageUrl } from "./utils/imageUtils";
import { normalizeUnit } from "../lib/utils";

export class ProductServiceClass {
  async getAll(
    filters?: Partial<FilterState>,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      // Ensure API base URL is configured
      OpenAPI.BASE = env.API_URL;

      const hasCategoryFilter =
        filters?.categories && filters.categories.length > 0;

      const res = hasCategoryFilter
        ? await ProductService.getApiV1ProductsProductFilter({
            pageIndex: page,
            pageSize: limit,
            categoryId: Number(filters!.categories![0]),
          })
        : await ProductService.getApiV1ProductsProductsList({
            pageIndex: page,
            pageSize: limit,
          });
      const payload = res?.data ?? res;
      const items: Product[] = (payload?.items ?? payload?.data ?? []).map(
        (p: any) => this.mapProduct(p)
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
  }

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

      const product = this.mapProduct(p);
      product.images = images;
      return { success: true, data: product };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: "Product not found",
      };
    }
  }

  async getFeatured(limit = 6): Promise<ApiResponse<Product[]>> {
    const res = await ProductService.getApiV1ProductsProductFilter({
      pageIndex: 1,
      pageSize: limit,
      sortByStockAsc: false,
    });
    const payload = res?.data ?? res;
    const items: Product[] = (payload?.items ?? payload?.data ?? []).map(
      (p: any) => this.mapProduct(p)
    );
    return { success: true, data: items };
  }

  async search(query: string, limit = 20): Promise<ApiResponse<Product[]>> {
    const res = await ProductService.getApiV1ProductsSearchProduct({
      productName: query,
      pageIndex: 1,
      pageSize: limit,
    });
    const payload = res?.data ?? res;
    const items: Product[] = (payload?.items ?? payload?.data ?? []).map(
      (p: any) => this.mapProduct(p)
    );
    return { success: true, data: items };
  }

  private mapProduct(p: any): Product {
    return {
      id: String(p.productId ?? p.id),
      name: p.productName ?? p.name ?? "",
      slug: (p.productName ?? p.name ?? "").toLowerCase().replace(/\s+/g, "-"),
      sku: String(p.productId ?? p.id ?? ""),
      description: p.description ?? "",
      price: Number(p.price ?? 0),
      originalPrice: Number(p.originalPrice ?? p.price ?? 0),
      categoryId: String(p.categoryId ?? ""),
      images: p.images ? (Array.isArray(p.images) ? p.images : [p.images]) : [],
      rating: Number(p.rating ?? 0),
      reviewCount: Number(p.reviewCount ?? 0),
      soldCount: Number(p.soldCount ?? 0),
      stock: Number(p.stockQuantity ?? p.stock ?? 0),
      isInStock: (p.stockQuantity ?? p.stock ?? 0) > 0,
      isFeatured: Boolean(p.isFeatured ?? false),
      tags: Array.isArray(p.tags) ? p.tags : [],
      unit: normalizeUnit(p.unit ?? "kg"),
      origin: p.origin ?? undefined,
      harvestDate: p.harvestDate ?? undefined,
      createdAt: p.createdAt ?? new Date().toISOString(),
      updatedAt: p.updatedAt ?? new Date().toISOString(),
    };
  }
}

export class CategoryServiceClass {
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      // Ensure API base URL is configured
      OpenAPI.BASE = env.API_URL;

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
  }

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
  }
}

export const productService = new ProductServiceClass();
export const categoryService = new CategoryServiceClass();
