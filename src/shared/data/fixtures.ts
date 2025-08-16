import {
  User,
  Category,
  Product,
  Banner,
  Address,
  PaymentMethod,
  Order,
  OrderStatus,
  OnboardingSlide,
} from "../../types";

// Onboarding slides
export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Fresh Farm Products",
    subtitle:
      "Discover the finest organic produce straight from local farms to your doorstep",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "Smart Farm Management",
    subtitle:
      "Track your orders, manage preferences, and stay connected with your favorite farms",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Sustainable Agriculture",
    subtitle:
      "Support eco-friendly farming practices and enjoy chemical-free, nutritious food",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
  },
];

// Categories
export const categories: Category[] = [
  {
    id: "cat_vegetables",
    name: "Vegetables",
    slug: "vegetables",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop",
    description: "Fresh organic vegetables",
    sortOrder: 1,
  },
  {
    id: "cat_fruits",
    name: "Fruits",
    slug: "fruits",
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&h=200&fit=crop",
    description: "Seasonal fresh fruits",
    sortOrder: 2,
  },
  {
    id: "cat_herbs",
    name: "Herbs & Spices",
    slug: "herbs",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
    description: "Aromatic herbs and spices",
    sortOrder: 3,
  },
  {
    id: "cat_grains",
    name: "Grains & Cereals",
    slug: "grains",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop",
    description: "Whole grains and cereals",
    sortOrder: 4,
  },
  {
    id: "cat_dairy",
    name: "Dairy Products",
    slug: "dairy",
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop",
    description: "Farm-fresh dairy products",
    sortOrder: 5,
  },
  {
    id: "cat_meat",
    name: "Meat & Poultry",
    slug: "meat",
    image:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop",
    description: "Premium quality meat",
    sortOrder: 6,
  },
];

// Products
export const products: Product[] = [
  // Vegetables
  {
    id: "prod_001",
    name: "Organic Cherry Tomatoes",
    slug: "organic-cherry-tomatoes",
    sku: "VEG-TOM-001",
    description:
      "Sweet and juicy organic cherry tomatoes, perfect for salads, snacking, or cooking. Grown without pesticides in fertile soil with plenty of sunshine.",
    shortDescription: "Sweet, juicy organic cherry tomatoes",
    price: 89000,
    originalPrice: 120000,
    categoryId: "cat_vegetables",
    images: [
      "https://images.unsplash.com/photo-1592841200221-1ac6716e8cc8?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558818498-28c1e002b655?w=400&h=400&fit=crop",
    ],
    rating: 4.8,
    reviewCount: 156,
    soldCount: 2340,
    certifications: ["VietGAP", "Organic"],
    stock: 45,
    isInStock: true,
    isFeatured: true,
    tags: ["organic", "fresh", "local"],
    unit: "kg",
    origin: "Đà Lạt, Lâm Đồng",
    harvestDate: "2024-01-15",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "prod_002",
    name: "Fresh Spinach Leaves",
    slug: "fresh-spinach-leaves",
    sku: "VEG-SPI-001",
    description:
      "Nutrient-rich organic spinach leaves, packed with iron, vitamins, and minerals. Perfect for salads, smoothies, or cooking.",
    shortDescription: "Nutrient-rich organic spinach",
    price: 65000,
    categoryId: "cat_vegetables",
    images: [
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
    ],
    rating: 4.6,
    reviewCount: 89,
    soldCount: 1580,
    certifications: ["VietGAP"],
    stock: 28,
    isInStock: true,
    isFeatured: false,
    tags: ["organic", "nutritious", "green"],
    unit: "bundle",
    origin: "Hồ Chí Minh",
    harvestDate: "2024-01-14",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-14T00:00:00Z",
  },
  {
    id: "prod_003",
    name: "Rainbow Bell Peppers",
    slug: "rainbow-bell-peppers",
    sku: "VEG-PEP-001",
    description:
      "Colorful mix of red, yellow, and green bell peppers. Sweet, crunchy, and full of vitamin C. Great for stir-fries, salads, and stuffing.",
    shortDescription: "Colorful sweet bell peppers",
    price: 95000,
    originalPrice: 110000,
    categoryId: "cat_vegetables",
    images: [
      "https://images.unsplash.com/photo-1601401590463-e2d3e2320bbd?w=400&h=400&fit=crop",
    ],
    rating: 4.7,
    reviewCount: 112,
    soldCount: 890,
    certifications: ["Organic", "VietGAP"],
    stock: 35,
    isInStock: true,
    isFeatured: true,
    tags: ["colorful", "sweet", "vitamin-c"],
    unit: "kg",
    origin: "Đà Lạt, Lâm Đồng",
    harvestDate: "2024-01-13",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z",
  },

  // Fruits
  {
    id: "prod_004",
    name: "Dragon Fruit",
    slug: "dragon-fruit",
    sku: "FRT-DRA-001",
    description:
      "Exotic dragon fruit with sweet, mild flavor and unique appearance. Rich in antioxidants, vitamin C, and fiber.",
    shortDescription: "Exotic dragon fruit, rich in antioxidants",
    price: 145000,
    categoryId: "cat_fruits",
    images: [
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400&h=400&fit=crop",
    ],
    rating: 4.5,
    reviewCount: 78,
    stock: 22,
    isInStock: true,
    isFeatured: true,
    tags: ["exotic", "antioxidants", "tropical"],
    unit: "kg",
    origin: "Bình Thuận",
    harvestDate: "2024-01-12",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "prod_005",
    name: "Organic Bananas",
    slug: "organic-bananas",
    sku: "FRT-BAN-001",
    description:
      "Sweet, naturally ripened organic bananas. Perfect for snacking, smoothies, or baking. Rich in potassium and natural sugars.",
    shortDescription: "Sweet organic bananas, rich in potassium",
    price: 45000,
    categoryId: "cat_fruits",
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    ],
    rating: 4.9,
    reviewCount: 203,
    stock: 67,
    isInStock: true,
    isFeatured: false,
    tags: ["organic", "potassium", "natural"],
    unit: "kg",
    origin: "Cần Thơ",
    harvestDate: "2024-01-14",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-14T00:00:00Z",
  },

  // Herbs
  {
    id: "prod_006",
    name: "Fresh Basil Leaves",
    slug: "fresh-basil-leaves",
    sku: "HRB-BAS-001",
    description:
      "Aromatic fresh basil leaves, perfect for Vietnamese cuisine, Italian dishes, and herbal teas. Grown organically without chemicals.",
    shortDescription: "Aromatic fresh basil leaves",
    price: 35000,
    categoryId: "cat_herbs",
    images: [
      "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=400&fit=crop",
    ],
    rating: 4.8,
    reviewCount: 134,
    stock: 42,
    isInStock: true,
    isFeatured: false,
    tags: ["aromatic", "organic", "culinary"],
    unit: "bundle",
    origin: "Hà Nội",
    harvestDate: "2024-01-15",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },

  // Grains
  {
    id: "prod_007",
    name: "Premium Brown Rice",
    slug: "premium-brown-rice",
    sku: "GRN-RIC-001",
    description:
      "High-quality brown rice, naturally processed to retain nutrients and fiber. Perfect for healthy meals and diet plans.",
    shortDescription: "High-quality brown rice, nutrient-rich",
    price: 85000,
    categoryId: "cat_grains",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
    ],
    rating: 4.6,
    reviewCount: 167,
    stock: 89,
    isInStock: true,
    isFeatured: true,
    tags: ["whole-grain", "nutritious", "healthy"],
    unit: "kg",
    origin: "An Giang",
    harvestDate: "2023-12-20",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },

  // Dairy
  {
    id: "prod_008",
    name: "Farm Fresh Milk",
    slug: "farm-fresh-milk",
    sku: "DAI-MIL-001",
    description:
      "Pure, fresh cow milk from grass-fed cows. Pasteurized for safety while maintaining natural taste and nutrients.",
    shortDescription: "Pure fresh cow milk from grass-fed cows",
    price: 55000,
    categoryId: "cat_dairy",
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop",
    ],
    rating: 4.7,
    reviewCount: 145,
    stock: 34,
    isInStock: true,
    isFeatured: false,
    tags: ["fresh", "pasteurized", "natural"],
    unit: "liter",
    origin: "Mộc Châu, Sơn La",
    harvestDate: "2024-01-15",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },

  // More products for variety...
  {
    id: "prod_009",
    name: "Organic Carrots",
    slug: "organic-carrots",
    sku: "VEG-CAR-001",
    description:
      "Sweet, crunchy organic carrots rich in beta-carotene and vitamins. Perfect for cooking, juicing, or eating raw.",
    price: 75000,
    categoryId: "cat_vegetables",
    images: [
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop",
    ],
    rating: 4.4,
    reviewCount: 92,
    stock: 56,
    isInStock: true,
    isFeatured: false,
    tags: ["organic", "beta-carotene", "sweet"],
    unit: "kg",
    origin: "Đà Lạt, Lâm Đồng",
    harvestDate: "2024-01-13",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z",
  },
  {
    id: "prod_010",
    name: "Fresh Strawberries",
    slug: "fresh-strawberries",
    sku: "FRT-STR-001",
    description:
      "Juicy, sweet strawberries grown in the cool climate of Đà Lạt. Perfect for desserts, smoothies, or eating fresh.",
    price: 165000,
    originalPrice: 200000,
    categoryId: "cat_fruits",
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop",
    ],
    rating: 4.9,
    reviewCount: 187,
    stock: 18,
    isInStock: true,
    isFeatured: true,
    tags: ["sweet", "juicy", "premium"],
    unit: "kg",
    origin: "Đà Lạt, Lâm Đồng",
    harvestDate: "2024-01-14",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-14T00:00:00Z",
  },
];

// Banners
export const banners: Banner[] = [
  {
    id: "banner_001",
    title: "Mùa thu hoạch tươi",
    subtitle: "Mua ngay sản phẩm tươi mới nhất",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop",
    ctaText: "Mua ngay",
    ctaAction: "/catalog?category=vegetables",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "banner_002",
    title: "Mùa thu hoạch tươi",
    subtitle: "Mua ngay sản phẩm tươi mới nhất",
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&h=400&fit=crop",
    ctaText: "Mua ngay",
    ctaAction: "/catalog?category=fruits",
    isActive: true,
    sortOrder: 2,
  },
];

// Sample user
export const sampleUser: User = {
  id: "user_001",
  name: "Nguyễn Văn An",
  email: "nguyenvanan@example.com",
  phone: "0909123456",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  role: "CUSTOMER",
  createdAt: "2023-12-01T00:00:00Z",
  updatedAt: "2024-01-15T00:00:00Z",
};

// Addresses
export const addresses: Address[] = [
  {
    id: "addr_001",
    name: "Nguyễn Văn An",
    phone: "0909123456",
    street: "123 Nguyễn Huệ",
    ward: "Bến Nghé",
    district: "Quận 1",
    city: "Hồ Chí Minh",
    postalCode: "70000",
    isDefault: true,
    type: "HOME",
  },
  {
    id: "addr_002",
    name: "Nguyễn Văn An",
    phone: "0909123456",
    street: "456 Lê Lợi",
    ward: "Bến Thành",
    district: "Quận 1",
    city: "Hồ Chí Minh",
    postalCode: "70000",
    isDefault: false,
    type: "OFFICE",
  },
];

// Payment methods
export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm_001",
    type: "COD",
    name: "Thanh toán khi nhận hàng",
    description: "Thanh toán bằng tiền mặt khi nhận hàng",
    isActive: true,
  },
  {
    id: "pm_002",
    type: "BANK_TRANSFER",
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản qua ngân hàng hoặc ví điện tử",
    isActive: true,
  },
];

// Order status timeline
const createStatusHistory = (
  currentStatus: OrderStatus["status"]
): OrderStatus[] => {
  const allStatuses: { status: OrderStatus["status"]; description: string }[] =
    [
      { status: "PLACED", description: "Đơn hàng đã được đặt thành công" },
      { status: "CONFIRMED", description: "Đã xác nhận đơn hàng" },
      { status: "PACKED", description: "Đã đóng gói sản phẩm" },
      { status: "SHIPPED", description: "Đang giao hàng" },
      { status: "DELIVERED", description: "Giao hàng thành công" },
    ];

  const currentIndex = allStatuses.findIndex((s) => s.status === currentStatus);

  return allStatuses.slice(0, currentIndex + 1).map((status, index) => ({
    id: `status_${index}`,
    status: status.status,
    timestamp: new Date(
      Date.now() - (allStatuses.length - index) * 86400000
    ).toISOString(),
    description: status.description,
  }));
};

// Sample orders
export const orders: Order[] = [
  {
    id: "order_001",
    orderNumber: "ORD-2024-001",
    userId: "user_001",
    items: [
      {
        id: "item_001",
        productId: "prod_001",
        product: products[0],
        quantity: 2,
        price: 89000,
        subtotal: 178000,
      },
      {
        id: "item_002",
        productId: "prod_004",
        product: products[3],
        quantity: 1,
        price: 145000,
        subtotal: 145000,
      },
    ],
    status: "DELIVERED",
    statusHistory: createStatusHistory("DELIVERED"),
    shippingAddress: addresses[0],
    paymentMethod: paymentMethods[0],
    itemCount: 3,
    subtotal: 323000,
    shippingFee: 25000,
    discount: 0,
    total: 348000,
    estimatedDelivery: "2024-01-18",
    actualDelivery: "2024-01-17",
    trackingNumber: "TRK2024001",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-17T14:22:00Z",
  },
  {
    id: "order_002",
    orderNumber: "ORD-2024-002",
    userId: "user_001",
    items: [
      {
        id: "item_003",
        productId: "prod_010",
        product: products[9],
        quantity: 1,
        price: 165000,
        subtotal: 165000,
      },
    ],
    status: "SHIPPED",
    statusHistory: createStatusHistory("SHIPPED"),
    shippingAddress: addresses[0],
    paymentMethod: paymentMethods[1],
    itemCount: 1,
    subtotal: 165000,
    shippingFee: 25000,
    discount: 25000,
    total: 165000,
    estimatedDelivery: "2024-01-20",
    trackingNumber: "TRK2024002",
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-18T11:45:00Z",
  },
];
