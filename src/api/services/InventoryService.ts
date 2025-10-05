/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InventoryService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postInventoryCreate({
        scheduleId,
        quantity,
        productId,
        requestBody,
    }: {
        scheduleId?: number,
        quantity?: number,
        productId?: number,
        requestBody?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/inventory-create',
            query: {
                'scheduleId': scheduleId,
                'quantity': quantity,
                'productID': productId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
