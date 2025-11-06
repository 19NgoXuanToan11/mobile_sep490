
import type { PaymentInformationModel } from "../models/PaymentInformationModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class PaymentService {

  public static postApiVnpayCreatePaymentUrl({
    requestBody,
  }: {
    requestBody?: PaymentInformationModel;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/vnpay/create-payment-url",
      body: requestBody,
      mediaType: "application/json",
    });
  }

  public static getApiVnpayCallback(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/vnpay/callback",
    });
  }

  public static getApiVnpayIpn(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/vnpay/ipn",
    });
  }

  public static getApiVnpayPaymentByOrderId({
    orderId,
  }: {
    orderId: number;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/vnpay/PaymentByOrderId/{orderId}",
      path: {
        orderId: orderId,
      },
    });
  }

  public static getApiVnpayCallbackForApp({
    source,
  }: {
    source?: string;
  } = {}): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/vnpay/CallBackForApp",
      query: {
        source: source,
      },
    });
  }
}
