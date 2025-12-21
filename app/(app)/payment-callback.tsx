import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function PaymentCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const redirectParams: Record<string, string> = {};
    
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined) {
        redirectParams[key] = Array.isArray(value) ? value[0] : String(value);
      }
    });

    router.replace({
      pathname: "/(app)/payment-result",
      params: redirectParams as any,
    });
  }, [params, router]);

  return null;
}

