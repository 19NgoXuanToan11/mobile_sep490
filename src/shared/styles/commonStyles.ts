import { StyleSheet, Platform } from "react-native";
export const colors = {
export const colors = {
  primary: "#00A86B",
  primaryLight: "#E8F9F1",
  white: "#FFFFFF",
  black: "#111827",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  error: "#EF4444",
  errorLight: "#FEF2F2",
  errorBorder: "#FCA5A5",
  success: "#00A86B",
  warning: "#F59E0B",
};
export const shadows = {
export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
};
export const buttonStyles = StyleSheet.create({
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.small,
  },
  secondary: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.small,
  },
  danger: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.small,
  },
  ghost: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
export const textStyles = StyleSheet.create({
export const textStyles = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.black,
    letterSpacing: 0.3,
  },
  h2: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
    letterSpacing: 0.2,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.black,
    letterSpacing: 0.3,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.gray[700],
    lineHeight: 20,
  },
  caption: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[500],
    letterSpacing: 0.2,
  },
  small: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.gray[500],
  },
  buttonPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 0.2,
  },
  buttonSecondary: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: 0.2,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    fontWeight: "400",
  },
});
export const cardStyles = StyleSheet.create({
export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...shadows.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  content: {
    gap: 10,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
});
export const inputStyles = StyleSheet.create({
export const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    paddingHorizontal: 14,
    minHeight: 52,
    ...shadows.small,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: colors.black,
    paddingVertical: 0,
    letterSpacing: 0.3,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  error: {
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorLight,
  },
  disabled: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
});
export const layoutStyles = StyleSheet.create({
export const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  padding: {
    padding: 16,
  },
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  paddingVertical: {
    paddingVertical: 16,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  spaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gap8: {
    gap: 8,
  },
  gap12: {
    gap: 12,
  },
  gap16: {
    gap: 16,
  },
});
export const modalStyles = StyleSheet.create({
export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    ...shadows.large,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
  },
});
export const badgeStyles = StyleSheet.create({
export const badgeStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  primary: {
    backgroundColor: colors.primaryLight,
  },
  error: {
    backgroundColor: colors.errorLight,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  primaryText: {
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
  },
});
export const spacing = {
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
export const borderRadius = {
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};
