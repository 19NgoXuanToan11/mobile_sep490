
import type { AccountForm } from '../models/AccountForm';
import type { AccountStatus } from '../models/AccountStatus';
import type { ChangePasswordDTO } from '../models/ChangePasswordDTO';
import type { LoginRequestDTO } from '../models/LoginRequestDTO';
import type { RegisterRequestDTO } from '../models/RegisterRequestDTO';
import type { Roles } from '../models/Roles';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountService {

    public static postApiV1AccountLogin({
        requestBody,
    }: {
        requestBody?: LoginRequestDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/account/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static postApiV1AccountRegister({
        requestBody,
    }: {
        requestBody?: RegisterRequestDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/account/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static postApiV1AccountCreate({
        requestBody,
    }: {
        requestBody?: AccountForm,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/account/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static putApiV1AccountUpdateStatus({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/account/update-status/{id}',
            path: {
                'id': id,
            },
        });
    }

    public static putApiV1AccountUpdate({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: AccountForm,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/account/update/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static getApiV1AccountGetAll({
        pageSize = 10,
        pageIndex = 1,
        status,
        role,
    }: {
        pageSize?: number,
        pageIndex?: number,
        status?: AccountStatus,
        role?: Roles,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/account/get-all',
            query: {
                'pageSize': pageSize,
                'pageIndex': pageIndex,
                'status': status,
                'role': role,
            },
        });
    }

    public static getApiV1AccountGetByEmail({
        email,
    }: {
        email?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/account/get-by-email',
            query: {
                'email': email,
            },
        });
    }

    public static putApiV1AccountUpdateRole({
        accountId,
        roleId,
    }: {
        accountId?: number,
        roleId?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/account/update-role',
            query: {
                'accountId': accountId,
                'roleId': roleId,
            },
        });
    }

    public static putApiV1AccountUpdatePassword({
        id,
        requestBody,
    }: {
        id?: number,
        requestBody?: ChangePasswordDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/account/update-password',
            query: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static put(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/',
        });
    }
}
