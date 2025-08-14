# 📱 IoT-Based Farm Management System – Mobile App (Customer & Guest)

> **Graduation Project – Advanced IoT-powered mobile platform** for customers and guests to explore, order, and track farm products in real-time.  
> Built with **React Native + Expo Go + TypeScript**, following modern architecture, professional UI/UX design, and a green-first brand identity.

---

## 🌱 Introduction

The **IoT-Based Farm Management System (Mobile)** is the companion application to the IFMS web platform.  
It provides **guests** with an engaging way to browse fresh agricultural products and **customers** with tools to manage their shopping experience — from catalog browsing to order tracking.

The mobile app is designed with:

- **Expo Go** for fast prototyping and easy testing.
- **React Native + TypeScript** for type safety and scalability.
- **Modern design system** with green as the primary brand color.
- **Fake local data** to simulate a real backend for development & demo purposes.

---

## ✨ Core Features (Wave 1)

### For Guests

- **Onboarding flow** with engaging illustrations and brand messaging.
- **Welcome screen** with banners, categories, and featured products.
- Browse **public product catalog** (grid/list view).
- **Product details** page with price, description, and images.

### For Customers (after login)

- **Authentication** (login/register) with client-side validation.
- Personalized **Home feed** with recommended products.
- **Advanced catalog browsing** with category filters and search.
- **Shopping cart** with quantity updates and item removal.
- **Checkout flow** (address select, payment method stub).
- **Order management**: view orders, statuses, and details.
- **Order tracking**: status timeline + map placeholder.
- **Account page**: profile info, theme & language settings, logout.

---

## 🛠 Tech Stack

| Category             | Technology                                              |
| -------------------- | ------------------------------------------------------- |
| Framework            | React Native (Expo SDK)                                 |
| Language             | TypeScript                                              |
| Navigation           | expo-router                                             |
| State Management     | Zustand + TanStack Query                                |
| Styling              | NativeWind (Tailwind for RN) + class-variance-authority |
| Forms & Validation   | React Hook Form + Zod                                   |
| Images               | expo-image                                              |
| Animations           | moti + react-native-reanimated                          |
| Icons                | @expo/vector-icons                                      |
| Internationalization | i18next + react-i18next + expo-localization             |
| Storage              | AsyncStorage + SecureStore                              |
| Lists                | FlashList (or FlatList fallback)                        |

---

## 📂 Project Structure

```plaintext
app/
  (public)/
    onboarding.tsx
    welcome.tsx
    auth/
      login.tsx
      register.tsx
    product/[id].tsx
    search.tsx
  (app)/
    (tabs)/
      _layout.tsx
      home.tsx
      catalog.tsx
      cart.tsx
      orders.tsx
      account.tsx
    checkout.tsx
    track/[orderId].tsx
src/
  features/
    auth/
    catalog/
    cart/
    orders/
    account/
  shared/
    ui/       # Reusable UI components
    lib/      # Theme, hooks, utilities
    data/     # Fixtures & fake fetchers
    
⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/19NgoXuanToan11/mobile_sep490.git
cd mobile_sep490

2. Install dependencies
npm install


If starting fresh, initialize with:

npx create-expo-app mobile_sep490 --template blank-typescript

3. Install required libraries
npm install @tanstack/react-query @hookform/resolvers zod zustand react-hook-form
npm install expo-router react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated
npm install nativewind class-variance-authority @expo/vector-icons moti
npx tailwindcss init --full
npm install @shopify/flash-list expo-image
npm install i18next react-i18next expo-localization expo-secure-store @react-native-async-storage/async-storage
npm install expo-file-system expo-sharing

🎨 Theming & Brand Identity

Primary color: Green (#2E7D32) with light/dark variations.

Typography: Clean, modern sans-serif style for readability.

Components: Consistent padding, rounded corners (rounded-2xl), soft shadows, smooth transitions.

Dark mode: System-based toggle in Account page.

Multi-language: English & Vietnamese toggle in Account page.

▶️ Running the App
npm start


Scan the QR code with Expo Go (Android/iOS).

Use guest features without login.

Log in with demo credentials (fake auth) to unlock customer features.

📊 Demo Data (Fixtures)

All data is local to ensure the app works without backend:

Categories, products, banners.

User profile.

Cart items.

Orders with timelines.

Addresses.

💡 Notes

No backend in this wave — suitable for UI/UX development & demo.

Simulated loading & error states for realism.

Responsive layouts for various device sizes.

Accessible UI: labels, roles, touch targets.
```
