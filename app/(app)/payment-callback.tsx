import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

/**
 * Payment callback route - handles deep link redirects from payment gateway
 * This route immediately redirects to payment-result with all params
 * to prevent "Unmatched Route" error and ensure proper payment result display
 * No UI is rendered to avoid showing duplicate loading screens
 */
export default function PaymentCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Immediately redirect to payment-result with all params
    // This prevents Expo Router from showing "Unmatched Route" error
    const redirectParams: Record<string, string> = {};
    
    // Extract and convert all params to strings
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined) {
        // Handle array params (convert to string) or single value
        redirectParams[key] = Array.isArray(value) ? value[0] : String(value);
      }
    });

    // Redirect immediately without showing any UI
    router.replace({
      pathname: "/(app)/payment-result",
      params: redirectParams as any,
    });
  }, [params, router]);

  // Return null to prevent any UI from rendering
  // This avoids showing a loading screen before redirect
  return null;
}

