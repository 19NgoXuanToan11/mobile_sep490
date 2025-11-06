
import type { ActivityType } from '../models/ActivityType';
import type { FarmActivityRequest } from '../models/FarmActivityRequest';
import type { FarmActivityStatus } from '../models/FarmActivityStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FarmActivityService {

    public static getApiV1FarmActivityGetAll({
        type,
        status,
        month,
        pageIndex = 1,
        pageSize = 10,
    }: {
        type?: ActivityType,
        status?: FarmActivityStatus,
        month?: number,
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/farm-activity/get-all',
            query: {
                'type': type,
                'status': status,
                'month': month,
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }

    public static getApiV1FarmActivityGetActive({
        scheduleId,
        pageIndex = 1,
        pageSize = 10,
    }: {
        scheduleId?: number,
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/farm-activity/get-active',
            query: {
                'scheduleId': scheduleId,
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }

    public static postApiV1FarmActivityCreate({
        activityType,
        requestBody,
    }: {
        activityType?: ActivityType,
        requestBody?: FarmActivityRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/farm-activity/create',
            query: {
                'activityType': activityType,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static putApiV1FarmActivityUpdate({
        farmActivityId,
        activityType,
        requestBody,
    }: {
        farmActivityId: number,
        activityType?: ActivityType,
        requestBody?: FarmActivityRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/farm-activity/update/{farmActivityId}',
            path: {
                'farmActivityId': farmActivityId,
            },
            query: {
                'activityType': activityType,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static getApiV1FarmActivityGetById({
        farmActivityId,
    }: {
        farmActivityId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/farm-activity/get-by-id/{farmActivityId}',
            path: {
                'farmActivityId': farmActivityId,
            },
        });
    }

    public static putApiV1FarmActivityChangeStatus({
        farmActivityId,
    }: {
        farmActivityId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/farm-activity/change-status/{farmActivityId}',
            path: {
                'farmActivityId': farmActivityId,
            },
        });
    }

    public static putApiV1FarmActivityComplete({
        id,
        location,
    }: {
        id: number,
        location?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/farm-activity/complete/{id}',
            path: {
                'id': id,
            },
            query: {
                'location': location,
            },
        });
    }

    public static getApiV1FarmActivityGetByStaff({
        type,
        status,
        month,
        pageIndex = 1,
        pageSize = 10,
    }: {
        type?: ActivityType,
        status?: FarmActivityStatus,
        month?: number,
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/farm-activity/get-by-staff',
            query: {
                'type': type,
                'status': status,
                'month': month,
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }
}
