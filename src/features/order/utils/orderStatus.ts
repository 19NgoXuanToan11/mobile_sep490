import { Order } from "../../../types";

export interface StatusInfo {
  text: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export const getStatusInfo = (status: Order["status"]): StatusInfo => {
  switch (status) {
    case "PLACED":
      return {
        text: "Đã đặt hàng",
        color: "#f59e0b",
        bgColor: "#fffbeb",
        borderColor: "#fbbf24",
        icon: "receipt-outline",
      };
    case "FAILED":
      return {
        text: "Thất bại",
        color: "#ef4444",
        bgColor: "#fef2f2",
        borderColor: "#f87171",
        icon: "close-circle-outline",
      };
    case "CONFIRMED":
      return {
        text: "Đã xác nhận",
        color: "#047857",
        bgColor: "#ecfdf5",
        borderColor: "#10b981",
        icon: "checkmark-done-outline",
      };
    case "PACKED":
      return {
        text: "Đã đóng gói",
        color: "#8b5cf6",
        bgColor: "#f5f3ff",
        borderColor: "#a78bfa",
        icon: "cube-outline",
      };
    case "PENDING":
      return {
        text: "Chưa thanh toán",
        color: "#f59e0b",
        bgColor: "#fffbeb",
        borderColor: "#fbbf24",
        icon: "time-outline",
      };
    case "SHIPPED":
      return {
        text: "Đang giao hàng",
        color: "#06b6d4",
        bgColor: "#ecfeff",
        borderColor: "#22d3ee",
        icon: "car-outline",
      };
    case "DELIVERED":
      return {
        text: "Đang giao hàng",
        color: "#06b6d4",
        bgColor: "#ecfeff",
        borderColor: "#22d3ee",
        icon: "car-outline",
      };
    case "COMPLETED":
      return {
        text: "Hoàn thành",
        color: "#10b981",
        bgColor: "#ecfdf5",
        borderColor: "#34d399",
        icon: "checkmark-circle-outline",
      };
    case "CANCELLED":
      return {
        text: "Thất bại",
        color: "#ef4444",
        bgColor: "#fef2f2",
        borderColor: "#f87171",
        icon: "close-circle-outline",
      };
    default:
      return {
        text: status,
        color: "#6b7280",
        bgColor: "#f9fafb",
        borderColor: "#d1d5db",
        icon: "ellipse-outline",
      };
  }
};
