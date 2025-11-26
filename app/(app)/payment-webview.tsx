import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  StatusBar,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { completePaymentFlow } from "../../src/services/payment/vnpay";
import env from "../../src/config/env";

export default function PaymentWebViewScreen() {
  const params = useLocalSearchParams<{
    paymentUrl: string;
    orderId: string;
  }>();

  // Memoize params để tránh re-render không cần thiết
  const paymentUrl = useMemo(() => params.paymentUrl, [params.paymentUrl]);
  const orderId = useMemo(() => params.orderId, [params.orderId]);

  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [webviewVisible, setWebviewVisible] = useState(true);

  const redirectCount = useRef(0);
  const currentUrl = useRef("");
  const processingCallbackRef = useRef(false);
  const mountedRef = useRef(false);

  // Debug: Log params khi component mount
  useEffect(() => {
    if (mountedRef.current) {
      return;
    }

    mountedRef.current = true;

    // Validate paymentUrl
    if (paymentUrl) {
      try {
        if (!paymentUrl.includes("vnpayment.vn")) {
          if (
            paymentUrl.includes("172.20.10.4:5139") ||
            paymentUrl.includes("localhost")
          ) {
            setError(
              "URL thanh toán không hợp lệ: URL trỏ về backend thay vì VNPay"
            );
            setLoading(false);
          }
        }
      } catch (err: any) {
        setError("URL thanh toán không hợp lệ: " + err.message);
        setLoading(false);
      }
    }

    // Log khi component unmount
    return () => {
      mountedRef.current = false;

      // Cleanup WebView
      if (webViewRef.current) {
        try {
          webViewRef.current.injectJavaScript(`
            window.stop();
            document.body.innerHTML = "";
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('WEBVIEW_UNMOUNTING');
            }
            true;
          `);
        } catch (error) {
        }
      }

      setLoading(false);
      setError(null);
      setIsProcessingPayment(false);
      currentUrl.current = "";
      redirectCount.current = 0;
    };
  }, []); // Empty deps - chỉ chạy một lần khi mount

  // Validate paymentUrl
  useEffect(() => {
    if (!paymentUrl) {
      setError("URL thanh toán không hợp lệ hoặc trống");
      setLoading(false);
    }
  }, [paymentUrl]);

  // BackHandler để xử lý hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isProcessingPayment) {
        Alert.alert(
          "Cảnh báo",
          "Bạn đang trong quá trình thanh toán. Bạn có chắc chắn muốn hủy không?",
          [
            {
              text: "Tiếp tục thanh toán",
              style: "cancel",
              onPress: () => { },
            },
            {
              text: "Hủy thanh toán",
              style: "destructive",
              onPress: () => router.back(),
            },
          ]
        );
        return true;
      }
      return false;
    });

    return () => {
      backHandler.remove();
    };
  }, [isProcessingPayment]);

  // Loading time counter
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (loading) {
      setLoadingTime(0);
      interval = setInterval(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  // Loading timeout alert
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        if (loading) {
          Alert.alert(
            "Tải trang thanh toán chậm",
            "Việc kết nối đến cổng thanh toán đang mất nhiều thời gian hơn bình thường. Bạn có muốn chuyển sang phương thức khác?",
            [
              {
                text: "Quay lại",
                style: "cancel",
                onPress: () => router.back(),
              },
              {
                text: "Thử lại",
                onPress: () => {
                  setLoading(true);
                  setLoadingTime(0);
                  redirectCount.current = 0;
                  webViewRef.current?.reload();
                },
              },
              {
                text: "Mở trình duyệt",
                onPress: async () => {
                  try {
                    await Linking.openURL(paymentUrl || "");
                    setTimeout(() => {
                      Alert.alert(
                        "Đã mở trình duyệt",
                        "Sau khi hoàn thành thanh toán trong trình duyệt, vui lòng quay lại ứng dụng và chọn trạng thái thanh toán của bạn.",
                        [
                          {
                            text: "Đã thanh toán",
                            onPress: () => handlePaymentSuccess(),
                          },
                          {
                            text: "Đã hủy thanh toán",
                            onPress: () => handlePaymentCancel(),
                          },
                          {
                            text: "Gặp lỗi khác",
                            onPress: () => handlePaymentError("99"),
                          },
                        ]
                      );
                    }, 500);
                  } catch (error) {
                    Alert.alert("Lỗi", "Không thể mở trình duyệt ngoài");
                  }
                },
              },
            ]
          );
        }
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [loading, paymentUrl]);

  /**
   * Xử lý VNPay response từ URL
   */
  const handleVNPayResponse = useCallback(
    (url: string) => {
      // Prevent duplicate processing
      if (processingCallbackRef.current) {
        return;
      }

      processingCallbackRef.current = true;
      setIsProcessingPayment(true);

      let callbackParams: Record<string, string> = {};
      try {

        if (typeof url === "string") {
          try {
            const urlObj = new URL(url);
            urlObj.searchParams.forEach((value, key) => {
              callbackParams[key] = value;
            });
          } catch (e) {
            const urlParts = url.split("?");
            if (urlParts.length > 1) {
              const queryString = urlParts[1];
              queryString.split("&").forEach((pair) => {
                const [key, value] = pair.split("=");
                if (key && value) {
                  callbackParams[decodeURIComponent(key)] = decodeURIComponent(value);
                }
              });
            }
          }
        } else if (typeof url === "object") {
          callbackParams = url as any;
        }

        const responseCode =
          callbackParams.vnp_ResponseCode || callbackParams.code || "";

        // Đóng WebView ngay lập tức
        setWebviewVisible(false);
        setLoading(false);

        // Update payment status on backend (async, không chờ) nếu có dữ liệu VNPay
        if (callbackParams.vnp_ResponseCode) {
          updatePaymentStatusOnBackend(callbackParams);
        }

        // Stop WebView và cleanup
        if (webViewRef.current) {
          try {
            webViewRef.current.injectJavaScript(`
              window.stop();
              document.body.innerHTML = '';
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('WEBVIEW_CLEANUP_COMPLETE');
              }
              true;
            `);
          } catch (error) {
            console.error("Error stopping WebView:", error);
          }
        }

        const derivedOrderId =
          callbackParams.orderId || callbackParams.vnp_TxnRef || orderId || "";
        const amountValue = callbackParams.amount
          ? callbackParams.amount
          : callbackParams.vnp_Amount
            ? (Number(callbackParams.vnp_Amount) / 100).toString()
            : undefined;
        const successFlag =
          callbackParams.success &&
          callbackParams.success.toLowerCase() === "true";

        // Navigate ngay lập tức đến payment-result screen
        if (responseCode === "00" || successFlag) {
          router.replace({
            pathname: "/(app)/payment-result",
            params: {
              orderId: derivedOrderId,
              success: "true",
              transactionId: callbackParams.vnp_TransactionNo || "",
              amount: amountValue,
              message: callbackParams.message,
            },
          });
        } else {
          const errorCode = responseCode || "99";
          const message =
            callbackParams.message || getVNPayErrorMessage(errorCode);
          router.replace({
            pathname: "/(app)/payment-result",
            params: {
              orderId: derivedOrderId,
              success: "false",
              code: errorCode,
              message,
            },
          });
        }
      } catch (error) {
        console.error("❌ [PaymentWebView] Error processing VNPay response:", error);
        router.replace({
          pathname: "/(app)/payment-result",
          params: {
            orderId:
              callbackParams.orderId ||
              callbackParams.vnp_TxnRef ||
              orderId ||
              "",
            success: "false",
            code: "99",
            message: "Lỗi xử lý kết quả thanh toán",
          },
        });
      } finally {
        setIsProcessingPayment(false);
        // Reset flag sau 2 giây để cho phép retry nếu cần
        setTimeout(() => {
          processingCallbackRef.current = false;
        }, 2000);
      }
    },
    [orderId]
  );

  /**
   * Lấy thông báo lỗi từ VNPay response code
   */
  const getVNPayErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
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
    return errorMessages[code] || `Lỗi thanh toán (Mã: ${code})`;
  };

  /**
   * Update payment status on backend
   */
  const updatePaymentStatusOnBackend = async (params: Record<string, string>) => {
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
  };

  /**
   * Xử lý khi WebView navigate đến URL mới
   */
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
          setError(
            "Phát hiện vòng lặp chuyển hướng. Vui lòng thử lại sau."
          );
          setLoading(false);
          return false;
        }
      }

      // Detect VNPay response từ URL hoặc URL đã redirect về payment-result
      const url = navState.url || "";
      const hasVNPayParams = url.includes("vnp_ResponseCode=");
      const hasPaymentResultParams =
        url.includes("payment-result") && url.includes("success=");

      if (url && (hasVNPayParams || hasPaymentResultParams)) {
        if (!processingCallbackRef.current) {
          handleVNPayResponse(url);
        }
        return false;
      }

      // Detect deep link callback
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
          console.error("Error processing payment callback:", error);
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

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleWebViewMessage = (event: any) => {
    const message = event.nativeEvent.data;

    if (message === "WEBVIEW_CLEANUP_COMPLETE") {
      return;
    }

    // Xử lý VNPay response từ injected JavaScript
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
  };

  /**
   * Xử lý khi user nhấn nút back
   */
  const handleGoBack = () => {
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
                  console.error("Error stopping WebView on go back:", error);
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
          console.error("Error stopping WebView on go back:", error);
        }
      }
      setTimeout(() => {
        router.back();
      }, 100);
    }
  };

  /**
   * Xử lý khi user chọn "Đã thanh toán" từ external browser
   */
  const handlePaymentSuccess = () => {
    const fakeSuccessParams: Record<string, string> = {
      vnp_ResponseCode: "00",
      vnp_TxnRef: orderId || "",
    };
    handleVNPayResponse(fakeSuccessParams as any);
  };

  /**
   * Xử lý khi user chọn "Đã hủy thanh toán" từ external browser
   */
  const handlePaymentCancel = () => {
    const fakeCancelParams: Record<string, string> = {
      vnp_ResponseCode: "24",
      vnp_TxnRef: orderId || "",
    };
    handleVNPayResponse(fakeCancelParams as any);
  };

  /**
   * Xử lý khi user chọn "Gặp lỗi khác" từ external browser
   */
  const handlePaymentError = (errorCode: string = "99") => {
    const fakeErrorParams: Record<string, string> = {
      vnp_ResponseCode: errorCode,
      vnp_TxnRef: orderId || "",
    };
    handleVNPayResponse(fakeErrorParams as any);
  };

  /**
   * Render external browser button
   */
  const renderExternalBrowserButton = () => {
    if (loadingTime < 10 || !paymentUrl) return null;

    return (
      <TouchableOpacity
        style={styles.externalBrowserButton}
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
        <Text style={styles.externalBrowserButtonText}>Mở trong trình duyệt</Text>
      </TouchableOpacity>
    );
  };

  /**
   * Render loading indicator với thông tin chi tiết
   */
  const renderLoading = () => {
    if (!loading) return null;

    let loadingMessage = "Đang kết nối đến cổng thanh toán...";
    let subMessage = "Vui lòng đợi trong giây lát";

    if (loadingTime > 5) {
      loadingMessage = "Đang tải trang thanh toán...";
      subMessage = "Có thể mất nhiều thời gian hơn dự kiến";
    }

    if (loadingTime > 15) {
      loadingMessage = "Vẫn đang kết nối...";
      subMessage = "Vui lòng thử lại hoặc mở trình duyệt";
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
        <Text style={styles.loadingSubText}>{subMessage}</Text>
        <Text style={styles.loadingTime}>{loadingTime} giây</Text>
        {loadingTime > 5 && (
          <View style={styles.loadingButtonsContainer}>
            <TouchableOpacity
              style={styles.retryButtonLoading}
              onPress={() => {
                setLoading(true);
                setLoadingTime(0);
                redirectCount.current = 0;
                webViewRef.current?.reload();
              }}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
            {renderExternalBrowserButton()}
          </View>
        )}
      </View>
    );
  };

  /**
   * Render error screen
   */
  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              redirectCount.current = 0;
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retryButton, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!paymentUrl) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor="#00A86B" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Không tìm thấy URL thanh toán</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#00A86B" />

      {/* Header với LinearGradient */}
      <LinearGradient
        colors={["#00A86B", "#00C97A"]}
        style={styles.header}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Thanh toán VNPay</Text>
        </View>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Error hoặc WebView */}
      {error ? (
        renderError()
      ) : webviewVisible ? (
        <>
          {paymentUrl ? (
            <WebView
              key="webViewKey"
              ref={webViewRef}
              source={{ uri: paymentUrl }}
              style={styles.webView}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadEnd={handleLoadEnd}
              onLoadStart={handleLoadStart}
              onMessage={handleWebViewMessage}
              startInLoadingState={true}
              renderLoading={() => <View />}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              cacheEnabled={false}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              incognito={false}
              pullToRefreshEnabled={true}
              userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36"
              originWhitelist={["*"]}
              injectedJavaScript={`
                (function() {
                  // Function để detect VNPay response từ URL
                  function detectVNPayResponse(url) {
                    if (!url || typeof url !== 'string') return null;
                    
                    // Check nếu URL chứa VNPay response parameters
                    if (
                      url.includes('vnp_ResponseCode=') ||
                      url.includes('vnp_TransactionNo=') ||
                      url.includes('success=')
                    ) {
                      return url;
                    }
                    
                    // Check trong query params
                    try {
                      const urlObj = new URL(url);
                      if (urlObj.searchParams.has('vnp_ResponseCode')) {
                        return url;
                      }
                    } catch (e) {
                      // URL không hợp lệ, bỏ qua
                    }
                    
                    return null;
                  }

                  // Monitor URL changes
                  let lastUrl = window.location.href;
                  
                  // Check URL hiện tại ngay khi script chạy
                  const currentUrl = window.location.href;
                  const vnpayResponse = detectVNPayResponse(currentUrl);
                  if (vnpayResponse && window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'VNPAY_RESPONSE',
                      url: vnpayResponse
                    }));
                    return;
                  }

                  // Override pushState và replaceState để detect URL changes
                  const originalPushState = history.pushState;
                  const originalReplaceState = history.replaceState;
                  
                  function checkAndNotify(url) {
                    if (url !== lastUrl) {
                      lastUrl = url;
                      const vnpayResponse = detectVNPayResponse(url);
                      if (vnpayResponse && window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'VNPAY_RESPONSE',
                          url: vnpayResponse
                        }));
                      }
                    }
                  }

                  history.pushState = function() {
                    originalPushState.apply(history, arguments);
                    setTimeout(function() {
                      checkAndNotify(window.location.href);
                    }, 100);
                  };

                  history.replaceState = function() {
                    originalReplaceState.apply(history, arguments);
                    setTimeout(function() {
                      checkAndNotify(window.location.href);
                    }, 100);
                  };

                  // Monitor hash changes
                  window.addEventListener('hashchange', function() {
                    setTimeout(function() {
                      checkAndNotify(window.location.href);
                    }, 100);
                  });

                  // Monitor popstate (back/forward button)
                  window.addEventListener('popstate', function() {
                    setTimeout(function() {
                      checkAndNotify(window.location.href);
                    }, 100);
                  });

                  // Poll URL changes mỗi 500ms để đảm bảo không bỏ sót
                  setInterval(function() {
                    const currentUrl = window.location.href;
                    if (currentUrl !== lastUrl) {
                      checkAndNotify(currentUrl);
                    }
                  }, 500);

                  // Monitor form submissions và link clicks
                  document.addEventListener('click', function(e) {
                    const target = e.target;
                    if (target.tagName === 'A' || target.closest('a')) {
                      const link = target.tagName === 'A' ? target : target.closest('a');
                      if (link && link.href) {
                        setTimeout(function() {
                          checkAndNotify(window.location.href);
                        }, 500);
                      }
                    }
                  }, true);

                  // Monitor form submissions
                  document.addEventListener('submit', function(e) {
                    setTimeout(function() {
                      checkAndNotify(window.location.href);
                    }, 1000);
                  }, true);
                })();
                true;
              `}
            />
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
              <Text style={styles.errorText}>URL thanh toán không hợp lệ</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => router.back()}
              >
                <Text style={styles.retryButtonText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          )}
          {renderLoading()}
        </>
      ) : (
        // WebView đã đóng, đang chuyển đến payment-result screen
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Đang xử lý kết quả thanh toán...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 24 : 2 + (StatusBar.currentHeight || 0),
    paddingBottom: 2,
    minHeight: Platform.OS === "ios" ? 32 : 28 + (StatusBar.currentHeight || 0),
    position: "relative",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonContainer: {
    position: "absolute",
    left: 15,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 22,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  helpButton: {
    padding: 5,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#00A86B",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingSubText: {
    marginTop: 5,
    color: "#00A86B",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingTime: {
    marginTop: 5,
    color: "#00A86B",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#00A86B",
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#888",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  retryButtonLoading: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#00A86B",
    borderRadius: 8,
  },
  externalBrowserButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#00A86B",
    borderRadius: 8,
  },
  externalBrowserButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#00A86B",
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
