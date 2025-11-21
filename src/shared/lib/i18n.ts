import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import "intl-pluralrules";
import { storage, STORAGE_KEYS } from "./storage";

const resources = {
  en: {
    translation: {
      common: {
        ok: "OK",
        cancel: "Cancel",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        confirm: "Confirm",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Info",
        retry: "Retry",
        viewAll: "View All",
        seeMore: "See More",
        showLess: "Show Less",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        refresh: "Refresh",
        close: "Close",
        back: "Back",
        next: "Next",
        previous: "Previous",
        done: "Done",
        skip: "Skip",
      },

      nav: {
        home: "Home",
        catalog: "Catalog",
        cart: "Cart",
        orders: "Orders",
        account: "Account",
        welcome: "Welcome",
        login: "Login",
        register: "Register",
        onboarding: "Get Started",
      },

      auth: {
        login: "Login",
        register: "Sign Up",
        logout: "Logout",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        name: "Full Name",
        forgotPassword: "Forgot Password?",
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: "Already have an account?",
        signIn: "Sign In",
        signUp: "Sign Up",
        welcomeBack: "Welcome Back!",
        createAccount: "Create Account",
        loginSubtitle: "Sign in to access your farm fresh products",
        registerSubtitle: "Join us to discover fresh, organic produce",
      },

      onboarding: {
        slide1: {
          title: "Fresh Farm Products",
          subtitle:
            "Discover the finest organic produce straight from local farms to your doorstep",
        },
        slide2: {
          title: "Smart Farm Management",
          subtitle:
            "Track your orders, manage preferences, and stay connected with your favorite farms",
        },
        slide3: {
          title: "Sustainable Agriculture",
          subtitle:
            "Support eco-friendly farming practices and enjoy chemical-free, nutritious food",
        },
        getStarted: "Get Started",
      },

      product: {
        addToCart: "Add to Cart",
        buyNow: "Buy Now",
        outOfStock: "Out of Stock",
        inStock: "In Stock",
        lowStock: "Low Stock",
        price: "Price",
        rating: "Rating",
        reviews: "Reviews",
        description: "Description",
        details: "Product Details",
        relatedProducts: "Related Products",
        quantity: "Quantity",
        unit: "Unit",
        origin: "Origin",
        harvestDate: "Harvest Date",
        addedToCart: "Added to cart successfully!",
      },

      cart: {
        title: "Shopping Cart",
        empty: "Your cart is empty",
        emptyDescription: "Add some delicious products to your cart",
        browseProducts: "Browse Products",
        subtotal: "Subtotal",
        shipping: "Shipping",
        discount: "Discount",
        total: "Total",
        checkout: "Checkout",
        remove: "Remove",
        update: "Update",
        itemCount: "{{count}} item",
        itemCount_plural: "{{count}} items",
      },

      orders: {
        title: "My Orders",
        empty: "No orders yet",
        emptyDescription: "Start shopping to see your orders here",
        orderNumber: "Order #{{number}}",
        status: "Status",
        total: "Total",
        items: "Items",
        date: "Order Date",
        estimated: "Estimated Delivery",
        actual: "Delivered On",
        orderDetails: "Order Details",
        statusHistory: "Order Timeline",
        shippingAddress: "Shipping Address",
        paymentMethod: "Payment Method",
        orderSummary: "Order Summary",
      },

      orderStatus: {
        PLACED: "Placed",
        CONFIRMED: "Confirmed",
        PACKED: "Packed",
        SHIPPED: "Shipped",
        DELIVERED: "Delivered",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
      },

      account: {
        title: "Account",
        profile: "Profile",
        addresses: "Addresses",
        paymentMethods: "Payment Methods",
        language: "Language",
        notifications: "Notifications",
        help: "Help & Support",
        about: "About",
        version: "Version",
        signOut: "Sign Out",
        settings: "Settings",
      },

      language: {
        english: "English",
        vietnamese: "Vietnamese",
      },

      categories: {
        vegetables: "Vegetables",
        fruits: "Fruits",
        grains: "Grains & Cereals",
        dairy: "Dairy Products",
        meat: "Meat & Poultry",
      },

      checkout: {
        title: "Checkout",
        shippingAddress: "Shipping Address",
        paymentMethod: "Payment Method",
        orderSummary: "Order Summary",
        placeOrder: "Place Order",
        notes: "Order Notes (Optional)",
        notesPlaceholder: "Special instructions for your order...",
        orderPlaced: "Order placed successfully!",
        orderPlacedDescription:
          "Your order has been confirmed and is being processed",
      },

      emptyState: {
        noProducts: "No products found",
        noProductsDescription: "Try adjusting your search or filter criteria",
        noOrders: "No orders yet",
        noOrdersDescription: "Start shopping to see your orders here",
        noAddresses: "No addresses saved",
        noAddressesDescription: "Add an address for faster checkout",
        noResults: "No results found",
        noResultsDescription: "Try searching with different keywords",
      },

      error: {
        generic: "Something went wrong. Please try again.",
        network: "Network error. Please check your connection.",
        notFound: "Not found",
        unauthorized: "Unauthorized access",
        serverError: "Server error. Please try again later.",
        validationError: "Please check your input and try again.",
      },

      success: {
        orderPlaced: "Order placed successfully!",
        profileUpdated: "Profile updated successfully!",
        addressAdded: "Address added successfully!",
        settingsSaved: "Settings saved successfully!",
      },
    },
  },
  vi: {
    translation: {
      common: {
        ok: "OK",
        cancel: "Hủy",
        save: "Lưu",
        edit: "Chỉnh sửa",
        delete: "Xóa",
        confirm: "Xác nhận",
        loading: "Đang tải...",
        error: "Lỗi",
        success: "Thành công",
        warning: "Cảnh báo",
        info: "Thông tin",
        retry: "Thử lại",
        viewAll: "Xem tất cả",
        seeMore: "Xem thêm",
        showLess: "Thu gọn",
        search: "Tìm kiếm",
        filter: "Lọc",
        sort: "Sắp xếp",
        refresh: "Làm mới",
        close: "Đóng",
        back: "Quay lại",
        next: "Tiếp theo",
        previous: "Trước",
        done: "Hoàn thành",
        skip: "Bỏ qua",
      },

      nav: {
        home: "Trang chủ",
        catalog: "Sản phẩm",
        cart: "Giỏ hàng",
        orders: "Đơn hàng",
        account: "Tài khoản",
        welcome: "Chào mừng",
        login: "Đăng nhập",
        register: "Đăng ký",
        onboarding: "Bắt đầu",
      },

      auth: {
        login: "Đăng nhập",
        register: "Đăng ký",
        logout: "Đăng xuất",
        email: "Email",
        password: "Mật khẩu",
        confirmPassword: "Xác nhận mật khẩu",
        name: "Họ và tên",
        forgotPassword: "Quên mật khẩu?",
        dontHaveAccount: "Chưa có tài khoản?",
        alreadyHaveAccount: "Đã có tài khoản?",
        signIn: "Đăng nhập",
        signUp: "Đăng ký",
        welcomeBack: "Chào mừng trở lại!",
        createAccount: "Tạo tài khoản",
        loginSubtitle: "Đăng nhập để truy cập sản phẩm nông sản tươi",
        registerSubtitle: "Tham gia để khám phá nông sản hữu cơ tươi ngon",
      },

      onboarding: {
        slide1: {
          title: "Nông sản tươi từ trang trại",
          subtitle:
            "Khám phá những sản phẩm hữu cơ tốt nhất từ trang trại địa phương đến tận nhà bạn",
        },
        slide2: {
          title: "Quản lý trang trại thông minh",
          subtitle:
            "Theo dõi đơn hàng, quản lý sở thích và kết nối với các trang trại yêu thích",
        },
        slide3: {
          title: "Nông nghiệp bền vững",
          subtitle:
            "Hỗ trợ thực tiễn canh tác thân thiện môi trường và thưởng thức thực phẩm không hóa chất, bổ dưỡng",
        },
        getStarted: "Bắt đầu",
      },

      product: {
        addToCart: "Thêm vào giỏ",
        buyNow: "Mua ngay",
        outOfStock: "Hết hàng",
        inStock: "Còn hàng",
        lowStock: "Sắp hết hàng",
        price: "Giá",
        rating: "Đánh giá",
        reviews: "Nhận xét",
        description: "Mô tả",
        details: "Chi tiết sản phẩm",
        relatedProducts: "Sản phẩm liên quan",
        quantity: "Số lượng",
        unit: "Đơn vị",
        origin: "Xuất xứ",
        harvestDate: "Ngày thu hoạch",
        addedToCart: "Đã thêm vào giỏ hàng thành công!",
      },

      cart: {
        title: "Giỏ hàng",
        empty: "Giỏ hàng trống",
        emptyDescription: "Thêm một số sản phẩm ngon vào giỏ hàng của bạn",
        browseProducts: "Duyệt sản phẩm",
        subtotal: "Tạm tính",
        shipping: "Phí giao hàng",
        discount: "Giảm giá",
        total: "Tổng cộng",
        checkout: "Thanh toán",
        remove: "Xóa",
        update: "Cập nhật",
        itemCount: "{{count}} sản phẩm",
        itemCount_plural: "{{count}} sản phẩm",
      },

      orders: {
        title: "Đơn hàng của tôi",
        empty: "Chưa có đơn hàng nào",
        emptyDescription: "Bắt đầu mua sắm để xem đơn hàng tại đây",
        orderNumber: "Đơn hàng #{{number}}",
        status: "Trạng thái",
        total: "Tổng cộng",
        items: "Sản phẩm",
        date: "Ngày đặt",
        estimated: "Dự kiến giao hàng",
        actual: "Đã giao vào",
        orderDetails: "Chi tiết đơn hàng",
        statusHistory: "Lịch sử đơn hàng",
        shippingAddress: "Địa chỉ giao hàng",
        paymentMethod: "Phương thức thanh toán",
        orderSummary: "Tóm tắt đơn hàng",
      },

      orderStatus: {
        PLACED: "Đã đặt",
        CONFIRMED: "Đã xác nhận",
        PACKED: "Đã đóng gói",
        SHIPPED: "Đang giao",
        DELIVERED: "Đang giao",
        COMPLETED: "Hoàn thành",
        CANCELLED: "Thất bại",
      },

      account: {
        title: "Tài khoản",
        profile: "Hồ sơ",
        addresses: "Địa chỉ",
        paymentMethods: "Phương thức thanh toán",
        language: "Ngôn ngữ",
        notifications: "Thông báo",
        help: "Trợ giúp & Hỗ trợ",
        about: "Về chúng tôi",
        version: "Phiên bản",
        signOut: "Đăng xuất",
        settings: "Cài đặt",
      },

      language: {
        english: "Tiếng Anh",
        vietnamese: "Tiếng Việt",
      },

      categories: {
        vegetables: "Rau củ",
        fruits: "Trái cây",
        grains: "Ngũ cốc",
        dairy: "Sản phẩm sữa",
        meat: "Thịt & Gia cầm",
      },

      checkout: {
        title: "Thanh toán",
        shippingAddress: "Địa chỉ giao hàng",
        paymentMethod: "Phương thức thanh toán",
        orderSummary: "Tóm tắt đơn hàng",
        placeOrder: "Đặt hàng",
        notes: "Ghi chú đơn hàng (Tùy chọn)",
        notesPlaceholder: "Hướng dẫn đặc biệt cho đơn hàng của bạn...",
        orderPlaced: "Đặt hàng thành công!",
        orderPlacedDescription:
          "Đơn hàng của bạn đã được xác nhận và đang được xử lý",
      },

      emptyState: {
        noProducts: "Không tìm thấy sản phẩm",
        noProductsDescription: "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc",
        noOrders: "Chưa có đơn hàng nào",
        noOrdersDescription: "Bắt đầu mua sắm để xem đơn hàng tại đây",
        noAddresses: "Chưa lưu địa chỉ nào",
        noAddressesDescription: "Thêm địa chỉ để thanh toán nhanh hơn",
        noResults: "Không tìm thấy kết quả",
        noResultsDescription: "Thử tìm kiếm với từ khóa khác",
      },

      error: {
        generic: "Có lỗi xảy ra. Vui lòng thử lại.",
        network: "Lỗi mạng. Vui lòng kiểm tra kết nối.",
        notFound: "Không tìm thấy",
        unauthorized: "Không có quyền truy cập",
        serverError: "Lỗi máy chủ. Vui lòng thử lại sau.",
        validationError: "Vui lòng kiểm tra thông tin nhập và thử lại.",
      },

      success: {
        orderPlaced: "Đặt hàng thành công!",
        profileUpdated: "Cập nhật hồ sơ thành công!",
        addressAdded: "Thêm địa chỉ thành công!",
        settingsSaved: "Lưu cài đặt thành công!",
      },
    },
  },
};

const initI18n = async () => {
  let savedLanguage = await storage.getItem<string>(STORAGE_KEYS.LANGUAGE);
  if (!savedLanguage) {
    savedLanguage = "vi";
    await storage.setItem(STORAGE_KEYS.LANGUAGE, savedLanguage);
  }
  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: "vi",
    compatibilityJSON: "v3",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },

    pluralSeparator: "_",
    contextSeparator: "_",
  });
};

export const changeLanguage = async (language: string) => {
  await storage.setItem(STORAGE_KEYS.LANGUAGE, language);
  await i18n.changeLanguage(language);
};

initI18n();
export default i18n;
