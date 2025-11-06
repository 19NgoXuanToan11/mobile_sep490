
import type { CreateFeedbackDTO } from '../models/CreateFeedbackDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FeedbackService {

    public static getApiV1FeedbackFeedBackList({
        pageIndex = 1,
        pageSize = 10,
    }: {
        pageIndex?: number,
        pageSize?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/feedback/feed-back-list',
            query: {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
            },
        });
    }

    public static postApiV1FeedbackCreateFeedback({
        requestBody,
    }: {
        requestBody?: CreateFeedbackDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/feedback/create-feedback',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static postApiV1FeedbackUpdateFeedback({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: CreateFeedbackDTO,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/feedback/update-feedback/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static postApiV1FeedbackUpdateFeedbackStatus({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/feedback/update-feedback-status/{id}',
            path: {
                'id': id,
            },
        });
    }

    public static getApiV1FeedbackFeedbackByProduct({
        productId,
    }: {
        productId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/feedback/feedback-by-product/{productId}',
            path: {
                'productId': productId,
            },
        });
    }

    public static getApiV1FeedbackFeedbackByOrder({
        orderId,
    }: {
        orderId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/feedback/feedback-by-order/{orderId}',
            path: {
                'orderId': orderId,
            },
        });
    }

    public static getApiV1FeedbackFeedbackByOrderDetail({
        orderDetailId,
    }: {
        orderDetailId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/feedback/feedback-by-order-detail/{orderDetailId}',
            path: {
                'orderDetailId': orderDetailId,
            },
        });
    }
}
