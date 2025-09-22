/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateOrderDTO } from '../models/CreateOrderDTO';
import type { Status } from '../models/Status';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrderService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1OrderCreate({
        requestBody,
    }: {
        requestBody?: CreateOrderDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Order/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1OrderOrderList({
        pageIndex = 1,
        pageSize = 10,
        status,
    }: {
        pageIndex?: number,
        pageSize?: number,
        status?: Status,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Order/order-list',
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
                'status': status,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1OrderOrderListByCustomer({
        id,
        pageIndex = 1,
        pageSize = 10,
        status,
    }: {
        id: number,
        pageIndex?: number,
        pageSize?: number,
        status?: Status,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Order/order-list-by-customer/{id}',
            path: {
                'id': id,
            },
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
                'status': status,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1OrderOrderListByCurrentAccount({
        pageIndex = 1,
        pageSize = 10,
        status,
    }: {
        pageIndex?: number,
        pageSize?: number,
        status?: Status,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Order/order-list-by-current-account',
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
                'status': status,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1OrderOrder({
        orderId,
    }: {
        orderId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Order/order/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1OrderOrderListByCustomerName({
        name,
        pageIndex = 1,
        pageSize = 10,
    }: {
        name: string,
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Order/order-list-by-customer-name/{name}',
            path: {
                'name': name,
            },
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1OrderOrderListByEmal({
        email,
        status,
        pageIndex = 1,
        pageSize = 10,
    }: {
        email: string,
        status?: Status,
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Order/order-list-by-emal/{email}',
            path: {
                'email': email,
            },
            query: {
                'status': status,
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1OrderOrderListByDate({
        pageIndex = 1,
        pageSize = 10,
        requestBody,
    }: {
        pageIndex?: number,
        pageSize?: number,
        requestBody?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Order/order-list-by-date',
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1OrderUpdateDeliveryStatus({
        orderId,
    }: {
        orderId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Order/updateDeliveryStatus/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1OrderUpdateCompletedStatus({
        orderId,
    }: {
        orderId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Order/updateCompletedStatus/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1OrderUpdateCancelStatus({
        orderId,
    }: {
        orderId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Order/updateCancelStatus/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1OrderCreateOrderPayment({
        orderId,
    }: {
        orderId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Order/createOrderPayment/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }
}
