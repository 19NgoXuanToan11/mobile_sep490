
import type { CreateOrderDTO } from '../models/CreateOrderDTO';
import type { PaymentStatus } from '../models/PaymentStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrderService {

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

    public static getApiV1OrderOrderList({
        pageIndex = 1,
        pageSize = 10,
        status,
    }: {
        pageIndex?: number,
        pageSize?: number,
        status?: PaymentStatus,
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

    public static getApiV1OrderOrderListByCustomer({
        id,
        pageIndex = 1,
        pageSize = 10,
        status,
    }: {
        id: number,
        pageIndex?: number,
        pageSize?: number,
        status?: PaymentStatus,
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

    public static getApiV1OrderOrderListByCurrentAccount({
        pageIndex = 1,
        pageSize = 10,
        status,
    }: {
        pageIndex?: number,
        pageSize?: number,
        status?: PaymentStatus,
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

    public static getApiV1OrderOrderListByEmal({
        email,
        status,
        pageIndex = 1,
        pageSize = 10,
    }: {
        email: string,
        status?: PaymentStatus,
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
