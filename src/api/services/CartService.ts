
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CartService {

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

    public static getApiV1AccountCartItems(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/account/cart-items',
        });
    }

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

    public static deleteApiV1AccountClearCart(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/account/clear-cart',
        });
    }
}
