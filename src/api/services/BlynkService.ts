
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BlynkService {

    public static getApiBlynkGetBlynkData(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/blynk/get-blynk-data',
        });
    }
}
