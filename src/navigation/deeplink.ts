import * as Linking from "expo-linking";
import { completePaymentFlow } from "../services/payment/vnpay";
export const DEEP_LINK_SCHEME = "ifms";
export const DEEP_LINK_PREFIX = `${DEEP_LINK_SCHEME}:
export const DEEP_LINK_PATHS = {
  PAYMENT_CALLBACK: "payment-callback",
  ORDER_DETAIL: "order",
  PRODUCT_DETAIL: "product",
} as const;
export const initializeDeepLinkListener = (): (() => void) => {
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });
  const subscription = Linking.addEventListener("url", (event) => {
    handleDeepLink(event.url);
  });
  return () => {
    subscription.remove();
  };
};
const handleDeepLink = async (url: string): Promise<void> => {
  try {
    const parsedUrl = Linking.parse(url);
    const { hostname, path, queryParams } = parsedUrl;
    
    // Skip payment-callback handling here - let Expo Router handle it via payment-callback.tsx route
    // This prevents duplicate processing (deep link listener + Expo Router)
    if (
      hostname === DEEP_LINK_PATHS.PAYMENT_CALLBACK ||
      path === DEEP_LINK_PATHS.PAYMENT_CALLBACK
    ) {
      // Expo Router will route to payment-callback.tsx, which will redirect to payment-result
      // No need to process here to avoid duplicate handling
      return;
    } else if (hostname === DEEP_LINK_PATHS.ORDER_DETAIL) {
      // Handle order detail deep link
    } else if (hostname === DEEP_LINK_PATHS.PRODUCT_DETAIL) {
      // Handle product detail deep link
    } else {
      // Handle other deep links
    }
  } catch (error) {
    console.error("Error handling deep link:", error);
  }
};
export const generatePaymentCallbackUrl = (orderId: number): string => {
  return `${DEEP_LINK_PREFIX}${DEEP_LINK_PATHS.PAYMENT_CALLBACK}?orderId=${orderId}`;
};
export const generateOrderDetailUrl = (orderId: number): string => {
  return `${DEEP_LINK_PREFIX}${DEEP_LINK_PATHS.ORDER_DETAIL}?id=${orderId}`;
};
export const generateProductDetailUrl = (productId: string): string => {
  return `${DEEP_LINK_PREFIX}${DEEP_LINK_PATHS.PRODUCT_DETAIL}?id=${productId}`;
};
