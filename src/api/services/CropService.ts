
import type { CropRequest } from '../models/CropRequest';
import type { Status } from '../models/Status';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CropService {

    public static getApiV1CropGetAll({
        pageIndex = 1,
        pageSize = 10,
    }: {
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/crop/get-all',
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }

    public static getApiV1CropGetAllActive(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/crop/get-all-active',
        });
    }

    public static postApiV1CropCreate({
        requestBody,
    }: {
        requestBody?: CropRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/crop/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static putApiV1CropChangStatus({
        cropId,
        status,
    }: {
        cropId?: number,
        status?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/crop/chang-status',
            query: {
                'cropId': cropId,
                'status': status,
            },
        });
    }

    public static postApiV1CropSearch({
        cropName,
        status,
        pageIndex = 1,
        pageSize = 10,
    }: {
        cropName?: string,
        status?: Status,
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/crop/search',
            query: {
                'cropName': cropName,
                'status': status,
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }

    public static putApiV1CropUpdate({
        cropId,
        requestBody,
    }: {
        cropId: number,
        requestBody?: CropRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/crop/update/{cropId}',
            path: {
                'cropId': cropId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static getApiV1CropGetExcludingInactive(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/crop/get-excluding-inactive',
        });
    }
}
