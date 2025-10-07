/**
 * Payment API Service - VNPAY integration
 * Dịch vụ API thanh toán - Tích hợp VNPAY
 */

import { OpenAPI } from "../../api/core/OpenAPI";
import { request as __request } from "../../api/core/request";
import { PaymentService } from "../../api/services/PaymentService";
import env from "../../config/env";

export interface PaymentInformation {
  orderType?: string;
  amount: number;
  orderDescription: string;
  name?: string;
  orderId: number;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    paymentUrl?: string;
    orderId?: number;
    amount?: number;
    status?: string;
    transactionNo?: string;
    bankCode?: string;
    cardType?: string;
    payDate?: string;
  };
  message?: string;
}

/**
 * VNPAY Payment API Service
 * Dịch vụ API thanh toán VNPAY
 */
export const vnpayApi = {
  /**
   * Create payment URL for VNPAY
   * Tạo liên kết thanh toán VNPAY
   */
  async createPaymentUrl(
    paymentInfo: PaymentInformation
  ): Promise<PaymentResponse> {
    try {
      OpenAPI.BASE = env.API_URL;
      const response = await PaymentService.postApiVnpayCreatePaymentUrl({
        requestBody: {
          orderType: paymentInfo.orderType ?? "other",
          amount: paymentInfo.amount,
          orderDescription: paymentInfo.orderDescription,
          name: paymentInfo.name ?? "Customer",
        } as any,
      });

      const result: any = (response as any)?.data ?? response;

      return {
        success: true,
        data: {
          paymentUrl: result?.paymentUrl ?? result?.url,
          orderId: paymentInfo.orderId,
          amount: paymentInfo.amount,
        },
      };
    } catch (error) {
      console.error("Create payment URL error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create payment URL",
      };
    }
  },

  /**
   * Get payment info by order ID
   * Lấy thông tin thanh toán theo ID đơn hàng
   */
  async getPaymentByOrderId(orderId: number): Promise<PaymentResponse> {
    try {
      OpenAPI.BASE = env.API_URL;
      const response = await PaymentService.getApiVnpayPaymentByOrderId({
        orderId,
      });

      const result: any = (response as any)?.data ?? response;

      return {
        success: true,
        data: {
          orderId: result?.orderId ?? orderId,
          amount: result?.amount ?? 0,
          status: result?.status ?? result?.paymentStatus ?? "PENDING",
          transactionNo: result?.transactionNo ?? result?.vnpTransactionNo,
          bankCode: result?.bankCode,
          cardType: result?.cardType,
          payDate: result?.payDate ?? result?.paidAt,
        },
      };
    } catch (error) {
      console.error("Get payment by order ID error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to get payment information",
      };
    }
  },

  /**
   * Create order payment
   * Tạo bản ghi thanh toán cho đơn hàng
   */
  async createOrderPayment(orderId: number): Promise<PaymentResponse> {
    try {
      OpenAPI.BASE = env.API_URL;
      const response = await __request(OpenAPI, {
        method: "POST",
        url: `/api/v1/Order/createOrderPayment/${orderId}`,
      });

      const result: any = (response as any)?.data ?? response;

      return {
        success: true,
        data: {
          orderId: result?.orderId ?? orderId,
          amount: result?.amount ?? 0,
          status: result?.status ?? "CREATED",
        },
      };
    } catch (error) {
      console.error("Create order payment error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create order payment",
      };
    }
  },

  /**
   * Process VNPAY callback after payment
   * Xử lý callback VNPAY sau thanh toán
   */
  async handleCallback(queryParams: Record<string, string>): Promise<{
    success: boolean;
    orderId?: string;
    status?: "SUCCESS" | "FAILED";
    message?: string;
  }> {
    try {
      // Extract important parameters from VNPAY callback
      const orderId = queryParams.vnp_TxnRef;
      const responseCode = queryParams.vnp_ResponseCode;
      const transactionStatus = queryParams.vnp_TransactionStatus;

      // Response code "00" means success
      const isSuccess = responseCode === "00" && transactionStatus === "00";

      return {
        success: true,
        orderId,
        status: isSuccess ? "SUCCESS" : "FAILED",
        message: isSuccess
          ? "Payment successful"
          : "Payment failed or cancelled",
      };
    } catch (error) {
      console.error("Handle callback error:", error);
      return {
        success: false,
        status: "FAILED",
        message:
          error instanceof Error ? error.message : "Failed to process callback",
      };
    }
  },
};
