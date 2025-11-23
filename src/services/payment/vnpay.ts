import * as Linking from "expo-linking";
import { router } from "expo-router";
import { vnpayApi } from "../../shared/data/paymentApiService";

export interface VNPayPaymentParams {
  orderId: number;
  amount: number;
  orderDescription: string;
  name?: string;
}
export interface VNPayCallbackParams {
  vnp_TxnRef?: string;
  vnp_ResponseCode?: string;
  vnp_TransactionStatus?: string;
  orderId?: string;
  [key: string]: string | undefined;
}

/**
 * Mở payment URL trong WebView component trực tiếp trong app
 * Navigate đến payment-webview screen với paymentUrl
 */
export const openPayment = async (
  paymentUrl: string,
  orderId?: number
): Promise<void> => {
  try {
    if (!paymentUrl) {
      throw new Error("Payment URL is required");
    }

    const params = {
      paymentUrl,
      ...(orderId && { orderId: String(orderId) }),
    };

    // Navigate đến payment-webview screen với paymentUrl
    // Sử dụng setTimeout để đảm bảo navigation không bị conflict với các navigation khác
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          router.push({
            pathname: "/(app)/payment-webview",
            params,
          });
          resolve();
        } catch (error) {
          resolve(); // Resolve anyway để không block flow
        }
      }, 100); // Delay nhỏ để tránh navigation conflict
    });
  } catch (error) {
    // Fallback: nếu navigate không hoạt động, mở trình duyệt hệ thống
    if (paymentUrl) {
      await Linking.openURL(paymentUrl);
    }
  }
};

export const handleCallback = async (
  url: string
): Promise<VNPayCallbackParams | null> => {
  try {
    const parsedUrl = Linking.parse(url);
    const queryParams = parsedUrl.queryParams as VNPayCallbackParams;

    const orderId =
      queryParams.orderId ||
      queryParams.vnp_TxnRef ||
      queryParams.vnp_OrderInfo;
    if (!orderId) {
      return null;
    }

    const responseCode = queryParams.vnp_ResponseCode;
    const transactionStatus = queryParams.vnp_TransactionStatus;
    const isSuccess =
      responseCode === "00" ||
      transactionStatus === "00" ||
      queryParams.success === "true";
    return {
      ...queryParams,
      orderId,
      isSuccess: isSuccess ? "true" : "false",
    };
  } catch (error) {
    return null;
  }
};

export const verifyPayment = async (
  orderId: number
): Promise<{ success: boolean; status?: string }> => {
  try {
    const response = await vnpayApi.getPaymentByOrderId(orderId);
    if (response.success && response.data) {
      return {
        success: true,
        status: response.data.status,
      };
    }
    return { success: false };
  } catch (error) {
    return { success: false };
  }
};

export const navigateToPaymentResult = (
  orderId: number,
  success: boolean,
  additionalParams?: {
    amount?: string;
    code?: string;
    message?: string;
  }
): void => {
  router.replace({
    pathname: "/(app)/payment-result",
    params: {
      orderId: String(orderId),
      success: success ? "true" : "false",
      ...(additionalParams?.amount && { amount: additionalParams.amount }),
      ...(additionalParams?.code && { code: additionalParams.code }),
      ...(additionalParams?.message && { message: additionalParams.message }),
    },
  });
};

export const completePaymentFlow = async (url: string): Promise<void> => {
  try {
    const callbackParams = await handleCallback(url);
    if (!callbackParams || !callbackParams.orderId) {
      navigateToPaymentResult(0, false);
      return;
    }
    const orderId = Number(callbackParams.orderId);
    const isSuccess = callbackParams.isSuccess === "true";

    const verification = await verifyPayment(orderId);

    // Pass additional params from callback (amount, code, message)
    navigateToPaymentResult(orderId, verification.success && isSuccess, {
      amount: callbackParams.amount,
      code: callbackParams.vnp_ResponseCode || callbackParams.code,
      message:
        callbackParams.message ||
        (isSuccess ? "PaymentSuccess" : "PaymentFailed"),
    });
  } catch (error) {
    navigateToPaymentResult(0, false);
  }
};
