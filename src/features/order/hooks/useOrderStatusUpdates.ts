import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import {
  orderNotificationService,
  OrderStatusUpdateMessage,
  OrderStatus,
} from "../../../services/realtime/orderNotificationService";
import { useToast } from "../../../shared/ui/toast";
import { useAuthStore } from "../../../shared/hooks";

type Options = {
  orderId?: string;
  enableToast?: boolean;
  onUpdate?: (payload: OrderStatusUpdateMessage) => void;
  /**
   * Custom handler for COMPLETED status
   */
  onCompleted?: (payload: OrderStatusUpdateMessage) => void;
  /**
   * Custom handler for CANCELLED status
   */
  onCancelled?: (payload: OrderStatusUpdateMessage) => void;
};

/**
 * Hook to subscribe to real-time order status updates via SignalR
 * Automatically invalidates React Query cache and shows toast notifications
 */
export const useOrderStatusUpdates = (options?: Options) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const unsubscribe = orderNotificationService.subscribe((update) => {
      // Filter by orderId if specified
      if (
        options?.orderId &&
        Number(options.orderId) !== Number(update.orderId)
      ) {
        return;
      }

      // Invalidate all relevant queries for immediate UI update
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: ["order", String(update.orderId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["order-full", String(update.orderId)],
      });

      // For critical status changes, force immediate refetch
      const isCriticalStatus =
        update.status === "COMPLETED" || update.status === "CANCELLED";
      if (isCriticalStatus) {
        queryClient.refetchQueries({
          queryKey: ["order", String(update.orderId)],
        });
        queryClient.refetchQueries({
          queryKey: ["order-full", String(update.orderId)],
        });
      }

      // Call status-specific handlers
      if (update.status === "COMPLETED" && options?.onCompleted) {
        options.onCompleted(update);
      } else if (update.status === "CANCELLED" && options?.onCancelled) {
        options.onCancelled(update);
      }

      // Call general update handler
      if (options?.onUpdate) {
        options.onUpdate(update);
      }

      // Show toast notification if enabled
      if (options?.enableToast !== false) {
        handleStatusNotification(update, toast);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    isAuthenticated,
    options?.orderId,
    options?.enableToast,
    options?.onUpdate,
    options?.onCompleted,
    options?.onCancelled,
    queryClient,
    toast,
  ]);
};

/**
 * Handle status-specific notifications with appropriate haptics and toast styling
 */
function handleStatusNotification(
  update: OrderStatusUpdateMessage,
  toast: ReturnType<typeof useToast>
) {
  const { status, message, orderId } = update;

  switch (status) {
    case "COMPLETED":
      // Success haptic for completed order
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      toast.success(
        "Đơn hàng hoàn thành",
        message ||
          `Đơn hàng #${orderId} đã được hoàn thành thành công. Cảm ơn bạn đã mua sắm!`
      );
      break;

    case "CANCELLED":
      // Warning haptic for cancelled order
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {}
      );
      toast.error(
        "Đơn hàng đã hủy",
        message ||
          `Đơn hàng #${orderId} đã bị hủy. Nếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ.`
      );
      break;

    case "DELIVERED":
      // Check if message indicates shipping (from updateDeliveryStatus endpoint)
      // Backend sends "DELIVERED" status with "is on the way" message for shipping
      const isShippingStatus = message?.toLowerCase().includes("on the way") || 
                                message?.toLowerCase().includes("đang giao") ||
                                message?.toLowerCase().includes("đang trên đường");
      
      if (isShippingStatus) {
        // Treat as SHIPPING status for display
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        toast.success(
          "Đơn hàng đang giao",
          message || `Đơn hàng #${orderId} đang trên đường giao đến bạn.`
        );
      } else {
        // Actual delivered status
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {}
        );
        toast.success(
          "Đơn hàng đã giao",
          message || `Đơn hàng #${orderId} đã được giao đến bạn.`
        );
      }
      break;

    case "SHIPPING":
    case "SHIPPED":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      toast.success(
        "Đơn hàng đang giao",
        message || `Đơn hàng #${orderId} đang trên đường giao đến bạn.`
      );
      break;

    case "CONFIRMED":
    case "PACKED":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      toast.success(
        "Đơn hàng đã xác nhận",
        message ||
          `Đơn hàng #${orderId} đã được xác nhận và đang được chuẩn bị.`
      );
      break;

    case "FAILED":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      toast.error(
        "Đơn hàng thất bại",
        message || `Đơn hàng #${orderId} đã thất bại. Vui lòng thử lại.`
      );
      break;

    default:
      // Generic notification for other statuses
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      toast.success(
        "Cập nhật đơn hàng",
        message || `Đơn hàng #${orderId} vừa được cập nhật.`
      );
  }
}
