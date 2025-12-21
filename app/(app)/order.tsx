import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function OrderDeepLinkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const orderId = params.id;
    if (orderId) {
      router.replace({
        pathname: "/(app)/order/[id]",
        params: { id: Array.isArray(orderId) ? orderId[0] : String(orderId) },
      });
    } else {
      router.back();
    }
  }, [params, router]);

  return null;
}




