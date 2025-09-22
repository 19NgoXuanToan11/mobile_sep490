/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentInformationModel } from '../models/PaymentInformationModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiVnpayCreatePaymentUrl({
        requestBody,
    }: {
        requestBody?: PaymentInformationModel,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/vnpay/create-payment-url',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiVnpayCallback(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/vnpay/callback',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiVnpayIpn(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/vnpay/ipn',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiVnpayPaymentByOrderId({
        orderId,
    }: {
        orderId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/vnpay/PaymentByOrderId/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }
}
