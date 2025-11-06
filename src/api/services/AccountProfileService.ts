
import type { ProfileRequestDTO } from '../models/ProfileRequestDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountProfileService {

    public static getApiV1AccountProfileProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/account-profile/profile',
        });
    }

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
