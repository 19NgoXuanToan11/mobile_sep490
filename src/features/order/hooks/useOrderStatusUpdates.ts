import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import {
  orderNotificationService,
  OrderStatusUpdateMessage,
} from "../../../services/realtime/orderNotificationService";
import { useToast } from "../../../shared/ui/toast";
import { useAuthStore } from "../../../shared/hooks";

type Options = {
  orderId?: string;
  enableToast?: boolean;
  onUpdate?: (payload: OrderStatusUpdateMessage) => void;
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

      if (options?.onUpdate) {
        options.onUpdate(update);
      }

      if (options?.enableToast !== false) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
        toast.success(
          "Đơn hàng cập nhật",
          update.message ||
            `Đơn hàng #${update.orderId} đang ở trạng thái ${update.status}`
        );
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
    queryClient,
    toast,
  ]);
};
