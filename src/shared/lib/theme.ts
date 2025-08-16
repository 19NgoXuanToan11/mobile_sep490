// Design system for farming e-commerce app

// Design tokens
export const colors = {
  primary: {
    50: "#f0f9f5",
    100: "#dcf2e6",
    200: "#b9e5cd",
    300: "#85d1a6",
    400: "#4fb577",
    500: "#00623A",
    600: "#005530",
    700: "#004527",
    800: "#003820",
    900: "#002e1b",
    950: "#001a10",
  },
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
  organic: {
    50: "#fdf8f0",
    100: "#fbefd9",
    200: "#f5deb3",
    300: "#ecc54d",
    400: "#daa520",
    500: "#b8860b",
    600: "#9b7c0a",
    700: "#7d5f08",
    800: "#5d4606",
    900: "#4a3905",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  "4xl": 32,
  full: 9999,
};

export const elevation = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
};

// E-commerce specific design tokens
export const farmingTheme = {
  productCard: {
    borderRadius: borderRadius["2xl"],
    padding: spacing.md,
    shadow: elevation.md,
  },
  categoryIcon: {
    size: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[50],
  },
  actionButton: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    shadow: elevation.lg,
  },
  searchBar: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
  },
};
