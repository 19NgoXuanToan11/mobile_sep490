/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ScheduleRequest } from '../models/ScheduleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScheduleService {
    /**
     * @returns any OK
     * @throws ApiError
     */
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
    /**
     * @returns any OK
     * @throws ApiError
     */
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
    /**
     * @returns any OK
     * @throws ApiError
     */
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
    /**
     * @returns any OK
     * @throws ApiError
     */
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
    /**
     * @returns any OK
     * @throws ApiError
     */
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
    /**
     * @returns any OK
     * @throws ApiError
     */
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
}
