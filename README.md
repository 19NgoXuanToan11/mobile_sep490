# IFMS Farm Management System - Mobile App

A comprehensive React Native mobile application for IoT-Based Farm Management System built with Expo, TypeScript, and modern development practices.

## 🌱 Features

- **Guest & Customer Experience**: Browse products as guest, full shopping experience when authenticated
- **E-Commerce**: Product catalog, shopping cart, order management, checkout process
- **Multi-Language**: English and Vietnamese support
- **Dark/Light Theme**: Automatic theme switching with green-first design
- **Real-time Updates**: Optimistic UI with simulated network delays
- **Offline Ready**: Local storage and caching

## 🏗️ Tech Stack

- **Expo SDK 53+** with React Native
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **NativeWind** (Tailwind CSS for React Native)
- **Zustand** + **TanStack Query** for state management
- **React Hook Form** + **Zod** for forms
- **i18next** for internationalization

## 🚀 Quick Start

1. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start development server**

   ```bash
   npm start
   ```

3. **Run on device**
   - Scan QR code with Expo Go app
   - Or use `npm run android` / `npm run ios`

## 🔐 Demo Credentials

- **Email**: `demo@ifms.com`
- **Password**: `password`

## 📁 Project Structure

```
mobile_sep490/
├── app/                     # Expo Router app directory
│   ├── (app)/              # Authenticated routes
│   │   ├── (tabs)/         # Bottom tabs (home, catalog, cart, orders, account)
│   │   ├── checkout.tsx    # Checkout flow
│   │   └── track/[id].tsx  # Order tracking
│   ├── (public)/           # Public routes
│   │   ├── onboarding.tsx  # App intro
│   │   ├── welcome.tsx     # Guest homepage
│   │   ├── auth/           # Login/register
│   │   └── product/[id].tsx # Product details
│   └── _layout.tsx         # Root layout
├── src/
│   ├── features/           # Feature modules (auth)
│   ├── shared/
│   │   ├── ui/            # Reusable components
│   │   ├── lib/           # Utils, theme, i18n
│   │   ├── data/          # Fake API & fixtures
│   │   └── hooks/         # Custom hooks
│   └── types.ts           # TypeScript definitions
└── README.md
```

## 🎨 Key Components

### UI Components

- **Button**: Multiple variants with loading states
- **Card**: Flexible containers with elevation
- **Input**: Form inputs with validation
- **Toast**: Success/error notifications
- **Skeleton**: Loading placeholders

### Screens

- **Onboarding**: 3-slide app introduction
- **Welcome**: Guest home with products
- **Auth**: Login/register with validation
- **Home**: Personalized customer dashboard
- **Catalog**: Product browsing with search
- **Cart**: Shopping cart management
- **Orders**: Order history and tracking
- **Account**: Profile and settings

## 🔧 Development

### Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

### Key Features Implemented

✅ **Authentication System**

- Route guards with automatic redirects
- Demo credentials for testing
- Secure token storage

✅ **Shopping Experience**

- Product catalog with categories
- Shopping cart with persistence
- Order management system

✅ **UI/UX Excellence**

- Green-themed design system
- Dark/light mode support
- Smooth animations

✅ **Internationalization**

- English and Vietnamese
- Automatic language detection
- Locale-aware formatting

## 📱 App Flow

1. **Onboarding** → Introduction slides
2. **Welcome** → Browse as guest or sign up
3. **Authentication** → Login/register
4. **Home** → Personalized dashboard
5. **Catalog** → Browse and search products
6. **Cart** → Manage selected items
7. **Checkout** → Complete purchase
8. **Orders** → Track order status

## 🎯 Fake Data System

The app includes comprehensive mock data:

- 10+ realistic farm products with images
- 6 product categories
- Sample orders with tracking
- User profiles and preferences
- Promotional banners

All API calls simulate network delays (200-500ms) for realistic testing.

## 🌐 Internationalization

Toggle between English and Vietnamese in Account settings. All text is translatable with proper pluralization and formatting.

## 🔄 State Management

- **Authentication**: Zustand with secure token storage
- **Cart**: Persistent cart state with AsyncStorage
- **Server State**: TanStack Query with caching
- **Preferences**: Theme and language persistence

## 🚀 Future Enhancements

- Real API integration
- Push notifications
- Advanced filtering
- Map integration for tracking
- Offline functionality
- Multiple vendor support

## 📄 License

MIT License - feel free to use this project as a learning resource or starting point for your own farm management app.

---

**Built with ❤️ for sustainable agriculture and fresh food delivery**
