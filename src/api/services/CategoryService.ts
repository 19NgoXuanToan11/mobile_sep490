
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CategoryService {

    public static getApiV1CategoryGetAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/category/get-all',
        });
    }

    public static getApiV1Category({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/category/{id}',
            path: {
                'id': id,
            },
        });
    }

    public static putApiV1Category({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/category/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static deleteApiV1Category({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/category/{id}',
            path: {
                'id': id,
            },
        });
    }

    public static postApiV1CategoryCreate({
        requestBody,
    }: {
        requestBody?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/category/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
