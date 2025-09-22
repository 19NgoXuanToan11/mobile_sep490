/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileRequestDTO } from '../models/ProfileRequestDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountProfileService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AccountProfileProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/account-profile/profile',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiV1AccountProfileUpdate({
        requestBody,
    }: {
        requestBody?: ProfileRequestDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/account-profile/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
