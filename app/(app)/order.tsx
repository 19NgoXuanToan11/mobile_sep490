import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

/**
 * Order detail deep link route - handles deep link redirects for order detail
 * This route immediately redirects to order/[id] with the id param
 * to prevent "Unmatched Route" error
 */
export default function OrderDeepLinkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const orderId = params.id;
    if (orderId) {
      // Redirect to order detail page
      router.replace({
        pathname: "/(app)/order/[id]",
        params: { id: Array.isArray(orderId) ? orderId[0] : String(orderId) },
      });
    } else {
      // If no id, go back
      router.back();
    }
  }, [params, router]);

  return null;
}




