
import type { ScheduleRequest } from '../models/ScheduleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScheduleService {

    public static postApiV1ScheduleScheduleCreate({
        requestBody,
    }: {
        requestBody?: ScheduleRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Schedule/schedule-create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static putApiV1ScheduleScheduleAssignStaff({
        scheduleId,
        requestBody,
    }: {
        scheduleId?: number,
        requestBody?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Schedule/schedule-assign-staff',
            query: {
                'scheduleId': scheduleId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static getApiV1ScheduleScheduleList({
        pageIndex = 1,
        pageSize = 10,
    }: {
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Schedule/schedule-list',
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }

    public static getApiV1ScheduleScheduleById({
        id,
    }: {
        id?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Schedule/schedule-byId',
            query: {
                'id': id,
            },
        });
    }

    public static putApiV1ScheduleScheduleUpdateStatus({
        scheduleId,
        requestBody,
    }: {
        scheduleId?: number,
        requestBody?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Schedule/schedule-update-status',
            query: {
                'scheduleId': scheduleId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static putApiV1ScheduleScheduleUpdate({
        scheduleId,
        requestBody,
    }: {
        scheduleId?: number,
        requestBody?: ScheduleRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/Schedule/schedule-update',
            query: {
                'scheduleId': scheduleId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static getApiV1ScheduleScheduleByStaff({
        month,
    }: {
        month?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Schedule/schedule-by-staff',
            query: {
                'month': month,
            },
        });
    }
}
