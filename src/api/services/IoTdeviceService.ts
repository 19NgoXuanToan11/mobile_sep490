/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IOTRequest } from '../models/IOTRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IoTdeviceService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1IotDevicesIotDevicesCreate({
        requestBody,
    }: {
        requestBody?: IOTRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/iotDevices/iotDevices-create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1IotDevicesIotDevicesList({
        pageIndex = 1,
        pageSize = 10,
    }: {
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/iotDevices/iotDevices-list',
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
    public static getApiV1IotDevicesIotDevicesById({
        id,
    }: {
        id?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/iotDevices/iotDevices-byId',
            query: {
                'id': id,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1IotDevicesIotDevicesUpdateStatus({
        iotDevicesId,
        requestBody,
    }: {
        iotDevicesId?: number,
        requestBody?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/iotDevices/iotDevices-update-status',
            query: {
                'iotDevicesId': iotDevicesId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static patchApiV1IotDevicesIotDevicesUpdate({
        iotDevicesId,
        requestBody,
    }: {
        iotDevicesId?: number,
        requestBody?: IOTRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/iotDevices/iotDevices-update',
            query: {
                'iotDevicesId': iotDevicesId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
