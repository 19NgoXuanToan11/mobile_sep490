# 🔧 Payment Debug Guide

## 🎯 **Vấn đề hiện tại**

Sau khi bấm thanh toán, màn hình không thay đổi và không tự động redirect qua màn hình thông báo thanh toán thành công.

## 🔍 **Cách debug để xác định lỗi Frontend vs Backend**

### **Bước 1: Enable Debug Mode**

```javascript
// Copy/paste vào console (Metro bundler hoặc React Native Debugger)
// File: debug-payment-flow.js đã được tạo
```

### **Bước 2: Kiểm tra Console Logs**

Thực hiện flow thanh toán và quan sát logs:

#### **🟢 Frontend hoạt động bình thường nếu thấy:**

```
🎯 Create Order Response: { success: true, data: { orderId: 123, totalPrice: 100000, paymentUrl: "..." } }
✅ Order created successfully: { orderId: 123, totalPrice: 100000, paymentUrl: "..." }
💳 Selected payment method: { id: "...", type: "E_WALLET", name: "VNPay" }
🔗 Using paymentUrl from order creation: https://sandbox.vnpayment.vn/...
🚀 Opening payment URL: https://sandbox.vnpayment.vn/...
📱 Navigating to payment-result screen
```

#### **🔴 Lỗi Frontend nếu thấy:**

```
❌ Order creation failed: { success: false, message: "..." }
❌ Payment URL creation failed: { success: false, message: "..." }
💥 Network Error: POST /api/orders
```

### **Bước 3: Test API Connectivity**

```javascript
// Trong console
debugPayment.testAPI();
```

**Expected Output:**

```
✅ CallBackForApp API Response: { ... }
```

### **Bước 4: Test Deep Link Handling**

```javascript
// Test deep link parsing
debugPayment.testDeepLink();

// Simulate successful callback
debugPayment.simulateCallback("123", "100000");
```

### **Bước 5: Manual Deep Link Test**

```bash
# Android
adb shell am start -W -a android.intent.action.VIEW -d "ifms://payment-result?success=true&orderId=123&amount=100000&code=00&message=PaymentSuccess"

# iOS Simulator
xcrun simctl openurl booted "ifms://payment-result?success=true&orderId=123&amount=100000"
```

**Expected Behavior:** App should navigate to payment result screen

## 🔍 **Diagnostic Questions**

### **Q1: Console logs khi bấm "Đặt hàng"**

- ✅ Có thấy "🎯 Create Order Response"?
- ✅ Response có `success: true`?
- ✅ Response có `paymentUrl`?

### **Q2: Network requests**

- ✅ Có thấy "🌐 API Request: POST /api/orders"?
- ✅ Response status code là gì? (200, 400, 500?)
- ✅ Response body chứa gì?

### **Q3: Payment URL**

- ✅ Có thấy "🚀 Opening payment URL"?
- ✅ URL có chứa `vnp_ReturnUrl` với `CallBackForApp`?
- ✅ Browser có mở VNPay page?

### **Q4: Deep Link**

- ✅ Sau khi thanh toán trên VNPay, có thấy "🔗 Deep link received"?
- ✅ Deep link có đúng format `ifms://payment-result`?

## 🎭 **Scenarios & Solutions**

### **Scenario 1: Không có logs gì khi bấm "Đặt hàng"**

**Nguyên nhân:** Frontend validation lỗi
**Solution:** Kiểm tra form validation, đặc biệt payment method selection

### **Scenario 2: Có logs nhưng API call fail**

**Nguyên nhân:** Backend lỗi hoặc network issue
**Solution:** Kiểm tra backend logs, API endpoint availability

### **Scenario 3: API success nhưng không có paymentUrl**

**Nguyên nhân:** Backend không trả về paymentUrl hoặc mobile source không được detect
**Solution:** Backend cần fix để detect `source=mobile` và return paymentUrl

### **Scenario 4: PaymentUrl có nhưng không redirect**

**Nguyên nhân:** Linking.openURL fail hoặc VNPay page không load
**Solution:** Kiểm tra URL format, network connectivity

### **Scenario 5: VNPay payment success nhưng không quay về app**

**Nguyên nhân:** Backend không redirect về deep link hoặc deep link scheme sai
**Solution:** Backend cần redirect về `ifms://payment-result` thay vì JSON response

## 🚨 **Common Issues & Quick Fixes**

### **Issue 1: Payment method không được chọn**

```javascript
// Check trong console
console.log("Selected payment method ID:", watchedPaymentMethodId);
```

**Fix:** Ensure user selects payment method before submitting

### **Issue 2: Backend không detect mobile source**

**Check:** API request có chứa `source=mobile`?
**Fix:** Backend cần check query parameter và modify return URL accordingly

### **Issue 3: Deep link scheme sai**

**Check:** Backend redirect về `ifms://` hay `myapp://`?
**Fix:** Backend phải dùng `ifms://payment-result`

### **Issue 4: App không handle deep link**

**Check:** Có thấy "🔗 Deep link received" trong logs?
**Fix:** Kiểm tra app.json scheme configuration

## 📋 **Debug Checklist**

- [ ] Console logs enabled
- [ ] API connectivity tested
- [ ] Form validation passed
- [ ] Network requests logged
- [ ] Payment URL generated
- [ ] VNPay page opens
- [ ] Payment completed on VNPay
- [ ] Deep link received
- [ ] App navigates to result screen

## 🎯 **Next Steps Based on Results**

### **If Frontend Issue:**

1. Fix form validation
2. Fix API call parameters
3. Fix navigation logic

### **If Backend Issue:**

1. Fix API endpoint
2. Fix mobile source detection
3. Fix deep link redirect
4. Fix CallBackForApp implementation

### **If Integration Issue:**

1. Verify deep link scheme
2. Test end-to-end flow
3. Coordinate frontend/backend fixes
