import * as Linking from "expo-linking";
import { completePaymentFlow } from "../services/payment/vnpay";

/**
 * Deep Link Configuration
 * Registers app deep links and handlers
 */

export const DEEP_LINK_SCHEME = "ifms"; // Your app scheme
export const DEEP_LINK_PREFIX = `${DEEP_LINK_SCHEME}://`;

/**
 * Deep link paths
 */
export const DEEP_LINK_PATHS = {
  PAYMENT_CALLBACK: "payment-callback",
  ORDER_DETAIL: "order",
  PRODUCT_DETAIL: "product",
} as const;

/**
 * Initialize deep link listener
 * Call this in app root (_layout.tsx)
 */
export const initializeDeepLinkListener = (): (() => void) => {
  // Handle initial URL (when app is opened from deep link)
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });

  // Handle URL when app is already open
  const subscription = Linking.addEventListener("url", (event) => {
    handleDeepLink(event.url);
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
};

/**
 * Handle deep link URL
 * Routes to appropriate handler based on path
 */
const handleDeepLink = async (url: string): Promise<void> => {
  try {
    console.log("Deep link received:", url);

    const parsedUrl = Linking.parse(url);
    const { hostname, path, queryParams } = parsedUrl;

    // Route to appropriate handler
    if (
      hostname === DEEP_LINK_PATHS.PAYMENT_CALLBACK ||
      path === DEEP_LINK_PATHS.PAYMENT_CALLBACK
    ) {
      await completePaymentFlow(url);
    } else if (hostname === DEEP_LINK_PATHS.ORDER_DETAIL) {
      // TODO: Handle order detail deep link
      console.log("Order detail deep link:", queryParams);
    } else if (hostname === DEEP_LINK_PATHS.PRODUCT_DETAIL) {
      // TODO: Handle product detail deep link
      console.log("Product detail deep link:", queryParams);
    } else {
      console.log("Unknown deep link path:", hostname, path);
    }
  } catch (error) {
    console.error("Deep link handling error:", error);
  }
};

/**
 * Generate payment callback URL for VNPay
 * @param orderId - Order ID
 * @returns Deep link URL string
 */
export const generatePaymentCallbackUrl = (orderId: number): string => {
  return `${DEEP_LINK_PREFIX}${DEEP_LINK_PATHS.PAYMENT_CALLBACK}?orderId=${orderId}`;
};

/**
 * Generate order detail deep link
 * @param orderId - Order ID
 * @returns Deep link URL string
 */
export const generateOrderDetailUrl = (orderId: number): string => {
  return `${DEEP_LINK_PREFIX}${DEEP_LINK_PATHS.ORDER_DETAIL}?id=${orderId}`;
};

/**
 * Generate product detail deep link
 * @param productId - Product ID
 * @returns Deep link URL string
 */
export const generateProductDetailUrl = (productId: string): string => {
  return `${DEEP_LINK_PREFIX}${DEEP_LINK_PATHS.PRODUCT_DETAIL}?id=${productId}`;
};
