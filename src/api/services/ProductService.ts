
import type { CreateProductDTO } from '../models/CreateProductDTO';
import type { Status } from '../models/Status';
import type { UpdateProductDTO } from '../models/UpdateProductDTO';
import type { UpdateQuantityDTO } from '../models/UpdateQuantityDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductService {

    public static getApiV1ProductsProductsList({
        pageIndex = 1,
        pageSize = 10,
    }: {
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/products/products-list',
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }

    public static getApiV1ProductsProductFilter({
        pageIndex = 1,
        pageSize = 10,
        status,
        categoryId,
        sortByStockAsc = true,
    }: {
        pageIndex?: number,
        pageSize?: number,
        status?: Status,
        categoryId?: number,
        sortByStockAsc?: boolean,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/products/product-filter',
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
                'status': status,
                'categoryId': categoryId,
                'sortByStockAsc': sortByStockAsc,
            },
        });
    }

    public static getApiV1ProductsGetProduct({
        productId,
    }: {
        productId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/products/get-product/{productId}',
            path: {
                'productId': productId,
            },
        });
    }

    public static getApiV1ProductsSearchProduct({
        productName,
        pageIndex = 1,
        pageSize = 10,
    }: {
        productName: string,
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/products/search-product/{productName}',
            path: {
                'productName': productName,
            },
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }

    public static postApiV1ProductsCreate({
        requestBody,
    }: {
        requestBody?: CreateProductDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/products/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static putApiV1ProductsUpdate({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: UpdateProductDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/products/update/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static putApiV1ProductsChangeProductStatus({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/products/change-product-status/{id}',
            path: {
                'id': id,
            },
        });
    }

    public static putApiV1ProductsChangeProductQuantity({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: UpdateQuantityDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/products/change-product-Quantity/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
