import { PaymentService } from "../../api/services/PaymentService";
import { OpenAPI } from "../../api/core/OpenAPI";
import env from "../../config/env";

/**
 * Test VNPay CallBackForApp API integration
 * Utility function to verify the new endpoint works
 */
export const testVnpayIntegration = {
  /**
   * Test API connectivity
   */
  async testCallbackForAppAPI() {
    try {
      OpenAPI.BASE = env.API_URL;
      console.log("🧪 Testing CallBackForApp API...");

      const response = await PaymentService.getApiVnpayCallbackForApp({
        source: "mobile",
      });

      console.log("✅ CallBackForApp API Response:", response);
      return {
        success: true,
        data: response,
        message: "API endpoint is working",
      };
    } catch (error) {
      console.error("❌ CallBackForApp API Error:", error);
      return {
        success: false,
        error,
        message: error instanceof Error ? error.message : "API test failed",
      };
    }
  },

  /**
   * Test deep link parsing
   */
  testDeepLinkParsing() {
    const testUrls = [
      "ifms://payment-result?success=true&orderId=123&amount=100000&code=00&message=PaymentSuccess",
      "ifms://payment-result?success=false&orderId=124&amount=50000&code=01&message=PaymentFailed",
    ];

    console.log("🧪 Testing Deep Link Parsing...");

    testUrls.forEach((url, index) => {
      try {
        const urlObj = new URL(url);
        const params = Object.fromEntries(urlObj.searchParams.entries());

        console.log(`✅ Test URL ${index + 1}:`, {
          scheme: urlObj.protocol,
          path: urlObj.pathname,
          params,
        });
      } catch (error) {
        console.error(`❌ Failed to parse URL ${index + 1}:`, error);
      }
    });
  },

  /**
   * Test payment URL modification
   */
  testPaymentUrlModification() {
    const mockPaymentUrl =
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=10000000&vnp_Command=pay&vnp_CreateDate=20241015120000&vnp_CurrCode=VND&vnp_IpAddr=192.168.1.1&vnp_Locale=vn&vnp_Merchant=2QXUI4J4&vnp_OrderInfo=Thanh+toan+don+hang+123&vnp_OrderType=product&vnp_ReturnUrl=https%3A%2F%2Fiotfarm.onrender.com%2Fapi%2Fvnpay%2Fcallback&vnp_TmnCode=2QXUI4J4&vnp_TxnRef=123&vnp_Version=2.1.0&vnp_SecureHash=abc123";

    try {
      console.log("🧪 Testing Payment URL Modification...");

      const url = new URL(mockPaymentUrl);
      const originalReturnUrl = url.searchParams.get("vnp_ReturnUrl");

      // Modify for mobile
      const mobileReturnUrl = `${env.API_URL}/api/vnpay/CallBackForApp?source=mobile`;
      url.searchParams.set("vnp_ReturnUrl", mobileReturnUrl);

      console.log("✅ URL Modification Test:", {
        original: originalReturnUrl,
        modified: url.searchParams.get("vnp_ReturnUrl"),
        fullUrl: url.toString(),
      });

      return {
        success: true,
        originalUrl: mockPaymentUrl,
        modifiedUrl: url.toString(),
      };
    } catch (error) {
      console.error("❌ URL Modification Test Failed:", error);
      return {
        success: false,
        error,
      };
    }
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("🚀 Starting VNPay Integration Tests...");

    const results = {
      apiTest: await this.testCallbackForAppAPI(),
      deepLinkTest: this.testDeepLinkParsing(),
      urlModificationTest: this.testPaymentUrlModification(),
    };

    console.log("📊 Test Results Summary:", results);
    return results;
  },
};

// Export for global access in development
if (__DEV__) {
  (global as any).testVnpayIntegration = testVnpayIntegration;
}
