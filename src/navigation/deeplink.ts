import * as Linking from "expo-linking";
import { completePaymentFlow } from "../services/payment/vnpay";
export const DEEP_LINK_SCHEME = "ifms";
export const DEEP_LINK_PREFIX = `${DEEP_LINK_SCHEME}://`;
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
    if (
      hostname === DEEP_LINK_PATHS.PAYMENT_CALLBACK ||
      path === DEEP_LINK_PATHS.PAYMENT_CALLBACK
    ) {
      await completePaymentFlow(url);
    } else if (hostname === DEEP_LINK_PATHS.ORDER_DETAIL) {
    } else if (hostname === DEEP_LINK_PATHS.PRODUCT_DETAIL) {
    } else {
    }
  } catch (error) {}
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
