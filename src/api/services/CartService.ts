/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CartService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AccountAddToCart({
        productId,
        quantity,
    }: {
        productId?: number,
        quantity?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/account/add-to-cart',
            query: {
                'productId': productId,
                'quantity': quantity,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AccountCartItems(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/account/cart-items',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiV1AccountRemoveCartItem({
        productId,
    }: {
        productId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/account/remove-cart-item',
            query: {
                'productId': productId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1AccountUpdateCartItem({
        productId,
        quantity,
    }: {
        productId?: number,
        quantity?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/account/update-cart-item',
            query: {
                'productId': productId,
                'quantity': quantity,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiV1AccountClearCart(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/account/clear-cart',
        });
    }
}
