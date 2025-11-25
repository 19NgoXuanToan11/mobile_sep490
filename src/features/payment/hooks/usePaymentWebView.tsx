import React, { useState, useRef, useCallback } from "react";
import { Alert, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import axios from "axios";
import { ordersApi } from "../../../shared/data/api";
import { useToast } from "../../../shared/ui/toast";
import { useCart } from "../../../shared/hooks";
import env from "../../../config/env";
import { completePaymentFlow } from "../../../services/payment/vnpay";

export interface PaymentResult {
  status: "success" | "failed";
  orderId: string;
  amount?: string;
  code?: string;
  message?: string;
}

interface UsePaymentWebViewParams {
  paymentUrl: string;
  orderId: string;
}

interface UsePaymentWebViewReturn {
  loading: boolean;
  error: string | null;
  isProcessingPayment: boolean;
  loadingTime: number;
  paymentResult: PaymentResult | null;
  orderDetails: any;
  webViewRef: React.RefObject<any>;
  handleNavigationStateChange: (navState: any) => Promise<boolean>;
  handleLoadEnd: () => void;
  handleLoadStart: () => void;
  handleWebViewMessage: (event: any) => void;
  handleGoBack: () => void;
  handlePaymentSuccess: () => void;
  handlePaymentCancel: () => void;
  handlePaymentError: (errorCode?: string) => void;
  renderExternalBrowserButton: () => React.ReactElement | null;
}

const VNPAY_ERROR_MESSAGES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
  "10": "Xác thực thông tin thẻ/tài khoản không đúng. Quá 3 lần",
  "11": "Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch",
  "12": "Thẻ/Tài khoản bị khóa",
  "13": "Nhập sai mật khẩu xác thực giao dịch (OTP). Quá 3 lần",
  "51": "Tài khoản không đủ số dư để thực hiện giao dịch",
  "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày",
  "75": "Ngân hàng thanh toán đang bảo trì",
  "79": "Nhập sai mật khẩu thanh toán quá số lần quy định",
  "99": "Lỗi không xác định",
};

const getVNPayErrorMessage = (code: string): string => {
  return VNPAY_ERROR_MESSAGES[code] || `Lỗi thanh toán (Mã: ${code})`;
};

export const usePaymentWebView = ({
  paymentUrl,
  orderId,
}: UsePaymentWebViewParams): UsePaymentWebViewReturn => {
  const toast = useToast();
  const { clearCart } = useCart();
  const webViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [processedUrls, setProcessedUrls] = useState<Record<string, boolean>>(
    {}
  );
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const hasProcessedPaymentRef = useRef(false);
  const isProcessingRef = useRef(false);
  const redirectCount = useRef(0);
  const currentUrl = useRef("");
  const processingCallbackRef = useRef(false);
  const mountedRef = useRef(false);

  const updatePaymentStatusOnBackend = useCallback(
    async (params: Record<string, string>) => {
      try {
        if (!params) return;

        const apiUrl = `${env.API_URL}/api/v1/Payment/ipn`;
        const formattedParams: Record<string, any> = {};

        Object.keys(params).forEach((key) => {
          if (key.startsWith("vnp_") || key.startsWith("Vnp_")) {
            const normalizedKey = key.startsWith("vnp_")
              ? key
              : "vnp_" + key.substring(4);
            if (
              normalizedKey.toLowerCase() === "vnp_amount" &&
              !isNaN(Number(params[key]))
            ) {
              formattedParams[normalizedKey] = Number(params[key]);
            } else {
              formattedParams[normalizedKey] = params[key];
            }
          } else {
            formattedParams[key] = params[key];
          }
        });

        try {
          await axios.get(apiUrl, {
            params: formattedParams,
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
          });
        } catch (error) {
          // Silent fail - không cần log error
        }
      } catch (error) {
        // Silent fail
      }
    },
    []
  );

  const processPaymentSuccess = useCallback(
    async (finalOrderId: string) => {
      if (isProcessingRef.current || hasProcessedPaymentRef.current) {
        return;
      }

      isProcessingRef.current = true;
      hasProcessedPaymentRef.current = true;

      try {
        const paymentResult = await ordersApi.createOrderPayment(
          Number(finalOrderId)
        );

        if (paymentResult.success) {
          await clearCart();
          toast.success(
            "Thanh toán thành công",
            "Đơn hàng đã được xử lý thành công"
          );
          setOrderDetails(paymentResult.data);
        } else {
          toast.error("Lỗi thanh toán", "Không thể hoàn tất đơn hàng");
          setPaymentResult((prev) =>
            prev ? { ...prev, status: "failed" } : null
          );
          hasProcessedPaymentRef.current = false;
        }
      } catch (error) {
        toast.error("Lỗi xử lý thanh toán", "Vui lòng liên hệ hỗ trợ");
        setPaymentResult((prev) =>
          prev ? { ...prev, status: "failed" } : null
        );
        hasProcessedPaymentRef.current = false;
      } finally {
        isProcessingRef.current = false;
      }
    },
    [clearCart, toast]
  );

  const handleVNPayResponse = useCallback(
    (url: string) => {
      if (processingCallbackRef.current) {
        return;
      }

      processingCallbackRef.current = true;
      setIsProcessingPayment(true);

      try {
        let params: Record<string, string> = {};

        if (typeof url === "string" && url.includes("vnp_ResponseCode=")) {
          try {
            const urlObj = new URL(url);
            urlObj.searchParams.forEach((value, key) => {
              params[key] = value;
            });
          } catch (e) {
            const urlParts = url.split("?");
            if (urlParts.length > 1) {
              const queryString = urlParts[1];
              queryString.split("&").forEach((pair) => {
                const [key, value] = pair.split("=");
                if (key && value) {
                  params[decodeURIComponent(key)] = decodeURIComponent(value);
                }
              });
            }
          }
        } else if (typeof url === "object") {
          params = url as any;
        }

        const responseCode = params.vnp_ResponseCode || "";

        updatePaymentStatusOnBackend(params);

        if (webViewRef.current) {
          try {
            webViewRef.current.injectJavaScript(`
              window.stop();
              document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;gap:10px;"><p style="font-size:16px;color:#00A86B;">Đang xử lý kết quả thanh toán...</p><p style="font-size:14px;color:#666;">Vui lòng đợi trong giây lát</p></div>';
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('WEBVIEW_CLEANUP_COMPLETE');
              }
              true;
            `);
          } catch (error) {
            // Error stopping WebView - silent fail
          }
        }

        const finalOrderId = orderId || params.vnp_TxnRef || "";
        setTimeout(() => {
          if (responseCode === "00") {
            const amount = params.vnp_Amount
              ? (Number(params.vnp_Amount) / 100).toString()
              : undefined;
            setPaymentResult({
              status: "success",
              orderId: finalOrderId,
              amount,
            });
            processPaymentSuccess(finalOrderId);
          } else {
            const errorCode = params.vnp_ResponseCode || "99";
            setPaymentResult({
              status: "failed",
              orderId: finalOrderId,
              code: errorCode,
              message: getVNPayErrorMessage(errorCode),
            });
            toast.error("Thanh toán thất bại", getVNPayErrorMessage(errorCode));
          }
        }, 300);
      } catch (error) {
        setPaymentResult({
          status: "failed",
          orderId: orderId || "",
          code: "99",
          message: "Lỗi xử lý kết quả thanh toán",
        });
        toast.error("Lỗi xử lý thanh toán", "Vui lòng thử lại");
      } finally {
        setIsProcessingPayment(false);
        setTimeout(() => {
          processingCallbackRef.current = false;
        }, 2000);
      }
    },
    [orderId, updatePaymentStatusOnBackend, processPaymentSuccess, toast]
  );

  const handleNavigationStateChange = useCallback(
    async (navState: any) => {
      setIsProcessingPayment(true);

      if (!currentUrl.current) {
        currentUrl.current = navState.url;
        redirectCount.current = 0;
      } else if (currentUrl.current !== navState.url) {
        currentUrl.current = navState.url;
        redirectCount.current += 1;

        if (redirectCount.current > 10) {
          setError("Phát hiện vòng lặp chuyển hướng. Vui lòng thử lại sau.");
          setLoading(false);
          return false;
        }
      }

      if (navState.url && navState.url.includes("vnp_ResponseCode=")) {
        if (!processingCallbackRef.current) {
          handleVNPayResponse(navState.url);
        }
        return false;
      }

      const deepLinkPatterns = [
        /^ifms:\/\//,
        /^https:\/\/web-sep490\.vercel\.app\/mobile-redirect\//,
        /^exp:\/\//,
      ];

      const isDeepLink = deepLinkPatterns.some((pattern) =>
        pattern.test(navState.url)
      );

      if (isDeepLink) {
        if (processingCallbackRef.current) {
          return false;
        }
        processingCallbackRef.current = true;

        try {
          await completePaymentFlow(navState.url);
        } catch (error) {
          processingCallbackRef.current = false;
        }
        return false;
      }

      if (navState.loading === false) {
        setLoading(false);
      }

      return true;
    },
    [handleVNPayResponse]
  );

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const handleWebViewMessage = useCallback(
    (event: any) => {
      const message = event.nativeEvent.data;

      if (message === "WEBVIEW_CLEANUP_COMPLETE") {
        return;
      }

      try {
        const data = JSON.parse(message);
        if (data.type === "VNPAY_RESPONSE" && data.url) {
          if (!processingCallbackRef.current) {
            processingCallbackRef.current = true;
            handleVNPayResponse(data.url);
          }
        }
      } catch (error) {
        // Không phải JSON message, bỏ qua
      }
    },
    [handleVNPayResponse]
  );

  const handleGoBack = useCallback(() => {
    if (isProcessingPayment) {
      Alert.alert(
        "Cảnh báo",
        "Bạn đang trong quá trình thanh toán. Bạn có chắc chắn muốn hủy không?",
        [
          { text: "Tiếp tục thanh toán", style: "cancel" },
          {
            text: "Hủy thanh toán",
            style: "destructive",
            onPress: () => {
              if (webViewRef.current) {
                try {
                  webViewRef.current.injectJavaScript(`
                    window.stop();
                    document.body.innerHTML = "";
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage('WEBVIEW_GOING_BACK');
                    }
                    true;
                  `);
                } catch (error) {
                  // Error stopping WebView on go back - silent fail
                }
              }
              setTimeout(() => {
                router.back();
              }, 100);
            },
          },
        ]
      );
    } else {
      if (webViewRef.current) {
        try {
          webViewRef.current.injectJavaScript(`
            window.stop();
            document.body.innerHTML = "";
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('WEBVIEW_GOING_BACK');
            }
            true;
          `);
        } catch (error) {
          // Error stopping WebView on go back - silent fail
        }
      }
      setTimeout(() => {
        router.back();
      }, 100);
    }
  }, [isProcessingPayment]);

  const handlePaymentSuccess = useCallback(() => {
    const fakeSuccessParams: Record<string, string> = {
      vnp_ResponseCode: "00",
      vnp_TxnRef: orderId || "",
    };
    handleVNPayResponse(fakeSuccessParams as any);
  }, [orderId, handleVNPayResponse]);

  const handlePaymentCancel = useCallback(() => {
    const fakeCancelParams: Record<string, string> = {
      vnp_ResponseCode: "24",
      vnp_TxnRef: orderId || "",
    };
    handleVNPayResponse(fakeCancelParams as any);
  }, [orderId, handleVNPayResponse]);

  const handlePaymentError = useCallback(
    (errorCode: string = "99") => {
      const fakeErrorParams: Record<string, string> = {
        vnp_ResponseCode: errorCode,
        vnp_TxnRef: orderId || "",
      };
      handleVNPayResponse(fakeErrorParams as any);
    },
    [orderId, handleVNPayResponse]
  );

  const renderExternalBrowserButton = useCallback(() => {
    if (loadingTime < 10 || !paymentUrl) return null;

    return (
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            "Mở trình duyệt bên ngoài",
            "Bạn có muốn mở trang thanh toán VNPay trong trình duyệt bên ngoài không?",
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Mở trình duyệt",
                onPress: async () => {
                  try {
                    const canOpen = await Linking.canOpenURL(paymentUrl);
                    if (canOpen) {
                      await Linking.openURL(paymentUrl);
                      setTimeout(() => {
                        Alert.alert(
                          "Đã mở trình duyệt",
                          "Sau khi hoàn thành thanh toán trong trình duyệt, vui lòng quay lại ứng dụng và chọn 'Đã thanh toán'.",
                          [
                            {
                              text: "Đã thanh toán",
                              onPress: () => handlePaymentSuccess(),
                            },
                            {
                              text: "Đã hủy",
                              onPress: () => handlePaymentCancel(),
                            },
                          ]
                        );
                      }, 1000);
                    } else {
                      Alert.alert("Lỗi", "Không thể mở trình duyệt bên ngoài");
                    }
                  } catch (error) {
                    Alert.alert("Lỗi", "Không thể mở trình duyệt bên ngoài");
                  }
                },
              },
            ]
          );
        }}
      >
        <Text>Mở trong trình duyệt</Text>
      </TouchableOpacity>
    );
  }, [loadingTime, paymentUrl, handlePaymentSuccess, handlePaymentCancel]);

  const returnValue: UsePaymentWebViewReturn = {
    loading,
    error,
    isProcessingPayment,
    loadingTime,
    paymentResult,
    orderDetails,
    webViewRef,
    handleNavigationStateChange,
    handleLoadEnd,
    handleLoadStart,
    handleWebViewMessage,
    handleGoBack,
    handlePaymentSuccess,
    handlePaymentCancel,
    handlePaymentError,
    renderExternalBrowserButton,
  };
  return returnValue;
};
