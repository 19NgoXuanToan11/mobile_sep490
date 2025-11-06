import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { vnpayApi } from "../../shared/data/paymentApiService";

/**
 * VNPay Payment Service
 * Handles VNPay payment flow with WebBrowser/Deep Link
 */

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
 * Open VNPay payment in WebBrowser or external browser
 * @param paymentUrl - Payment URL from backend
 */
export const openPayment = async (paymentUrl: string): Promise<void> => {
  try {
    // Try WebBrowser first (in-app browser)
    const result = await WebBrowser.openBrowserAsync(paymentUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
      controlsColor: "#00A86B",
      toolbarColor: "#FFFFFF",
    });

    console.log("VNPay WebBrowser result:", result);
  } catch (error) {
    console.error("Failed to open WebBrowser, trying external browser:", error);

    // Fallback to external browser
    await Linking.openURL(paymentUrl);
  }
};

/**
 * Handle VNPay callback from deep link
 * @param url - Deep link URL (e.g., ifms://payment-callback?...)
 * @returns Parsed callback params
 */
export const handleCallback = async (
  url: string
): Promise<VNPayCallbackParams | null> => {
  try {
    const parsedUrl = Linking.parse(url);
    const queryParams = parsedUrl.queryParams as VNPayCallbackParams;

    console.log("VNPay callback params:", queryParams);

    // Extract orderId
    const orderId =
      queryParams.orderId ||
      queryParams.vnp_TxnRef ||
      queryParams.vnp_OrderInfo;

    if (!orderId) {
      console.error("No orderId found in callback");
      return null;
    }

    // Check response code
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
    console.error("Failed to parse VNPay callback:", error);
    return null;
  }
};

/**
 * Verify payment with backend
 * @param orderId - Order ID to verify
 * @returns Payment verification result
 */
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
    console.error("Payment verification error:", error);
    return { success: false };
  }
};

/**
 * Navigate to payment result screen
 * @param orderId - Order ID
 * @param success - Payment success status
 */
export const navigateToPaymentResult = (
  orderId: number,
  success: boolean
): void => {
  router.replace({
    pathname: "/(app)/payment-result",
    params: {
      orderId: String(orderId),
      success: success ? "true" : "false",
    },
  });
};

/**
 * Complete payment flow
 * Handles callback, verification, and navigation
 * @param url - Deep link URL from VNPay
 */
export const completePaymentFlow = async (url: string): Promise<void> => {
  try {
    // Parse callback params
    const callbackParams = await handleCallback(url);

    if (!callbackParams || !callbackParams.orderId) {
      console.error("Invalid callback params");
      navigateToPaymentResult(0, false);
      return;
    }

    const orderId = Number(callbackParams.orderId);
    const isSuccess = callbackParams.isSuccess === "true";

    // Verify payment with backend
    const verification = await verifyPayment(orderId);

    // Navigate to result screen
    navigateToPaymentResult(orderId, verification.success && isSuccess);
  } catch (error) {
    console.error("Payment flow error:", error);
    navigateToPaymentResult(0, false);
  }
};
