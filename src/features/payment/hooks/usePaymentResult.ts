import { useState, useEffect, useRef, useCallback } from "react";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../../../shared/data/api";
import { useToast } from "../../../shared/ui/toast";
import { useCart } from "../../../shared/hooks";

interface UsePaymentResultParams {
  orderId: string;
  success?: string;
  amount?: string;
  code?: string;
  message?: string;
}

export function usePaymentResult({
  orderId,
  success,
  amount,
  code,
  message,
}: UsePaymentResultParams) {
  const toast = useToast();
  const { clearCart } = useCart();

  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "success" | "failed"
  >(() => {
    if (success === "true") return "loading";
    if (success === "false") return "failed";
    return "loading";
  });

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const hasProcessedPaymentRef = useRef(false);
  const isProcessingRef = useRef(false);
  const autoNavigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hasUserInteractedRef = useRef(false);
  const messageRef = useRef(message);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    hasProcessedPaymentRef.current = false;
    isProcessingRef.current = false;
  }, [orderId]);

  const handlePaymentSuccess = useCallback(async () => {
    if (isProcessingRef.current || hasProcessedPaymentRef.current) {
      return;
    }

    isProcessingRef.current = true;
    hasProcessedPaymentRef.current = true;

    try {
      const paymentResult = await ordersApi.createOrderPayment(Number(orderId));

      if (paymentResult.success) {
        await clearCart();
        toast.success(
          "Thanh toán thành công",
          messageRef.current || "Đơn hàng đã được xử lý thành công"
        );
        setOrderDetails(paymentResult.data);
        setPaymentStatus("success");
      } else {
        toast.error("Lỗi thanh toán", "Không thể hoàn tất đơn hàng");
        setPaymentStatus("failed");
        hasProcessedPaymentRef.current = false;
      }
    } catch (error) {
      toast.error("Lỗi xử lý thanh toán", "Vui lòng liên hệ hỗ trợ");
      setPaymentStatus("failed");
      hasProcessedPaymentRef.current = false;
    } finally {
      isProcessingRef.current = false;
    }
  }, [orderId, clearCart, toast]);

  useEffect(() => {
    if (success !== undefined && !hasProcessedPaymentRef.current) {
      if (success === "true") {
        handlePaymentSuccess();
      } else if (success === "false") {
        setPaymentStatus("failed");
        if (!hasProcessedPaymentRef.current) {  
          hasProcessedPaymentRef.current = true;
        }
      }
    }
  }, [success, code, message, handlePaymentSuccess, toast]);

  const { data: paymentData } = useQuery({
    queryKey: ["payment-status", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID not found");
      return await ordersApi.getPaymentStatus(Number(orderId));
    },
    enabled: !!orderId && success === undefined,
    refetchInterval:
      paymentStatus === "loading" && success === undefined ? 3000 : false,
    refetchIntervalInBackground: false,
  });

  const { data: orderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID not found");
      return await ordersApi.getById(orderId);
    },
    enabled:
      !!orderId && (paymentStatus === "success" || paymentStatus === "failed"),
  });

  useEffect(() => {
    if (
      success === undefined &&
      paymentData?.success &&
      !hasProcessedPaymentRef.current
    ) {
      const { isSuccess, vnpayResponseCode, isPending } = paymentData.data;

      if (isPending === true) {
        setPaymentStatus("loading");
      } else if (isSuccess === true) {
        handlePaymentSuccess();
      } else if (isSuccess === false) {
        setPaymentStatus("failed");
      }
    } else if (success === undefined && paymentData?.success === false) {
      setPaymentStatus("failed");
    }
  }, [paymentData, success, handlePaymentSuccess, toast]);

  const handleGoHome = useCallback(() => {
    hasUserInteractedRef.current = true;
    if (autoNavigateTimerRef.current) {
      clearTimeout(autoNavigateTimerRef.current);
      autoNavigateTimerRef.current = null;
    }
    router.replace("/(app)/(tabs)/home");
  }, []);

  useEffect(() => {
    if (paymentStatus === "failed") {
      hasUserInteractedRef.current = false;

      if (autoNavigateTimerRef.current) {
        clearTimeout(autoNavigateTimerRef.current);
      }

      autoNavigateTimerRef.current = setTimeout(() => {
        if (!hasUserInteractedRef.current) {
          handleGoHome();
        }
      }, 5000);

      return () => {
        if (autoNavigateTimerRef.current) {
          clearTimeout(autoNavigateTimerRef.current);
          autoNavigateTimerRef.current = null;
        }
      };
    } else {
      if (autoNavigateTimerRef.current) {
        clearTimeout(autoNavigateTimerRef.current);
        autoNavigateTimerRef.current = null;
      }
    }
  }, [paymentStatus, handleGoHome]);

  const handleRetry = useCallback(() => {
    router.replace("/(app)/checkout");
  }, []);

  const handleGoToOrders = useCallback(() => {
    hasUserInteractedRef.current = true;
    if (autoNavigateTimerRef.current) {
      clearTimeout(autoNavigateTimerRef.current);
      autoNavigateTimerRef.current = null;
    }
    router.replace("/(app)/(tabs)/orders");
  }, []);

  return {
    paymentStatus,
    orderDetails,
    orderData,
    amount,
    orderId,
    handleGoHome,
    handleRetry,
    handleGoToOrders,
  };
}
