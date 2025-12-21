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
  onCompleted?: (payload: OrderStatusUpdateMessage) => void;
  onCancelled?: (payload: OrderStatusUpdateMessage) => void;
};

export const useOrderStatusUpdates = (options?: Options) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const unsubscribe = orderNotificationService.subscribe((update) => {
      if (
        options?.orderId &&
        Number(options.orderId) !== Number(update.orderId)
      ) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: ["order", String(update.orderId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["order-full", String(update.orderId)],
      });

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

      if (update.status === "COMPLETED" && options?.onCompleted) {
        options.onCompleted(update);
      } else if (update.status === "CANCELLED" && options?.onCancelled) {
        options.onCancelled(update);
      }

      if (options?.onUpdate) {
        options.onUpdate(update);
      }

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

function handleStatusNotification(
  update: OrderStatusUpdateMessage,
  toast: ReturnType<typeof useToast>
) {
  const { status, message, orderId } = update;

  switch (status) {
    case "COMPLETED":
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
      const isShippingStatus = message?.toLowerCase().includes("on the way") || 
                                message?.toLowerCase().includes("đang giao") ||
                                message?.toLowerCase().includes("đang trên đường");
      
      if (isShippingStatus) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        toast.success(
          "Đơn hàng đang giao",
          message || `Đơn hàng #${orderId} đang trên đường giao đến bạn.`
        );
      } else {
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      toast.success(
        "Cập nhật đơn hàng",
        message || `Đơn hàng #${orderId} vừa được cập nhật.`
      );
  }
}
