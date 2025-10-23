/**
 * Debug Payment Flow - Chạy trong console để debug
 *
 * Cách sử dụng:
 * 1. Mở app trong dev mode
 * 2. Mở console (Metro bundler hoặc React Native Debugger)
 * 3. Copy/paste code này vào console
 * 4. Thực hiện flow thanh toán
 * 5. Xem logs để debug
 */

// Enable detailed logging
console.log("🔧 Payment Flow Debug Mode Enabled");

// Override console methods to add timestamps
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  originalLog(`[${new Date().toLocaleTimeString()}] 📝`, ...args);
};

console.error = (...args) => {
  originalError(`[${new Date().toLocaleTimeString()}] ❌`, ...args);
};

console.warn = (...args) => {
  originalWarn(`[${new Date().toLocaleTimeString()}] ⚠️`, ...args);
};

// Debug network requests
if (global.XMLHttpRequest) {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    this._debugMethod = method;
    this._debugUrl = url;
    console.log(`🌐 API Request: ${method} ${url}`);
    return originalOpen.call(this, method, url, ...args);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (body) {
      console.log(`📤 Request Body:`, body);
    }

    this.addEventListener("load", () => {
      console.log(
        `📥 Response ${this.status}: ${this._debugMethod} ${this._debugUrl}`
      );
      if (this.responseText) {
        try {
          const parsed = JSON.parse(this.responseText);
          console.log(`📄 Response Data:`, parsed);
        } catch (e) {
          console.log(`📄 Response Text:`, this.responseText.substring(0, 200));
        }
      }
    });

    this.addEventListener("error", () => {
      console.error(`💥 Network Error: ${this._debugMethod} ${this._debugUrl}`);
    });

    return originalSend.call(this, body);
  };
}

// Debug Linking events
if (global.Linking) {
  const originalOpenURL = global.Linking.openURL;

  global.Linking.openURL = function (url) {
    console.log(`🔗 Opening URL: ${url}`);
    return originalOpenURL.call(this, url);
  };
}

// Test functions
global.debugPayment = {
  // Test API connectivity
  async testAPI() {
    console.log("🧪 Testing API connectivity...");
    try {
      const result = await testVnpayIntegration.testCallbackForAppAPI();
      console.log("API Test Result:", result);
    } catch (error) {
      console.error("API Test Failed:", error);
    }
  },

  // Test deep link manually
  testDeepLink() {
    console.log("🧪 Testing deep link parsing...");
    testVnpayIntegration.testDeepLinkParsing();
  },

  // Simulate successful payment callback
  simulateCallback(orderId = "123", amount = "100000") {
    const testUrl = `ifms://payment-result?success=true&orderId=${orderId}&amount=${amount}&code=00&message=PaymentSuccess`;
    console.log(`🎭 Simulating callback: ${testUrl}`);

    // Try to trigger deep link handler
    if (global.Linking && global.Linking.openURL) {
      global.Linking.openURL(testUrl);
    } else {
      console.warn("Linking not available for simulation");
    }
  },

  // Check current navigation state
  checkNavigation() {
    console.log("🧭 Current navigation state:");
    // This would need to be implemented based on your navigation setup
    console.log("Navigation debugging requires router access");
  },
};

console.log(`
🔧 Debug tools loaded! Available commands:

📋 Basic Tests:
- debugPayment.testAPI()          // Test API connectivity
- debugPayment.testDeepLink()     // Test deep link parsing
- debugPayment.simulateCallback() // Simulate payment success

🎭 Simulation:
- debugPayment.simulateCallback("123", "50000") // Custom order

📊 Monitoring:
- All network requests are now logged
- All console messages have timestamps
- Linking.openURL calls are tracked

🚀 Next steps:
1. Run debugPayment.testAPI() to check backend
2. Try a real payment flow and watch logs
3. Use debugPayment.simulateCallback() to test deep link
`);
