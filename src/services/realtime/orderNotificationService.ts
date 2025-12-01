import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";
import { AppState, AppStateStatus } from "react-native";
import env from "../../config/env";
import { authStorage } from "../../shared/lib/storage";
import { useAuthStore, useNotificationStore } from "../../shared/hooks";

/**
 * Order status values matching backend PaymentStatus enum
 */
export type OrderStatus =
  | "COMPLETED"
  | "CANCELLED"
  | "DELIVERED"
  | "SHIPPING"
  | "PENDING"
  | "CONFIRMED"
  | "PLACED"
  | "FAILED"
  | "PACKED"
  | "SHIPPED";

/**
 * Order status update message matching backend OrderStatusNotification
 * Backend sends: OrderId (long), Message (string), Status (string), Timestamp (DateTime)
 */
export type OrderStatusUpdateMessage = {
  orderId: number;
  status: OrderStatus;
  message: string;
  timestamp?: string;
};

type Listener = (update: OrderStatusUpdateMessage) => void;

const HUB_PATH = "/hubs/order-notification";
const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 15000];
const isDev = process.env.NODE_ENV !== "production";

class OrderNotificationService {
  private connection: HubConnection | null = null;
  private initializing: Promise<void> | null = null;
  private listeners = new Set<Listener>();
  private authUnsubscribe: (() => void) | null = null;
  private appState: AppStateStatus = AppState.currentState;
  private appStateSubscription: (() => void) | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.observeAuthChanges();
    this.observeAppState();
  }

  private observeAuthChanges() {
    let previous = useAuthStore.getState().isAuthenticated;
    this.authUnsubscribe = useAuthStore.subscribe((state) => {
      if (state.isAuthenticated === previous) {
        return;
      }
      previous = state.isAuthenticated;
      if (state.isAuthenticated) {
        this.ensureStarted();
      } else {
        this.stop();
      }
    });

    if (previous) {
      this.ensureStarted();
    }
  }

  private observeAppState() {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (this.appState === nextState) {
        return;
      }
      this.appState = nextState;

      if (nextState === "active" && useAuthStore.getState().isAuthenticated) {
        this.ensureStarted();
      }
    });

    this.appStateSubscription = () => subscription.remove();
  }

  private buildConnection(): HubConnection {
    const normalizedBase = env.API_URL.replace(/\/$/, "");
    const signalRUrl = `${normalizedBase}${HUB_PATH}`;

    const options: IHttpConnectionOptions = {
      accessTokenFactory: async () => {
        const token = await authStorage.getAccessToken();
        return token ?? "";
      },
    };

    const connection = new HubConnectionBuilder()
      .withUrl(signalRUrl, options)
      .withAutomaticReconnect(RECONNECT_DELAYS)
      .configureLogging(isDev ? LogLevel.Information : LogLevel.Error)
      .build();

    connection.on(
      "ReceiveOrderStatusUpdate",
      (payload: OrderStatusUpdateMessage) => {
        if (!payload) {
          return;
        }
        this.handleIncomingMessage(payload);
      }
    );

    connection.onreconnected(() => {
      this.flushReconnectTimer();
    });

    connection.onclose(() => {
      if (useAuthStore.getState().isAuthenticated) {
        this.scheduleReconnect();
      }
    });

    return connection;
  }

  private async startConnection() {
    if (this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    const token = await authStorage.getAccessToken();
    if (!token) {
      throw new Error("Missing access token");
    }

    if (!this.connection) {
      this.connection = this.buildConnection();
    }

    await this.connection.start();
  }

  ensureStarted() {
    if (this.initializing) {
      return this.initializing;
    }
    this.initializing = this.startConnection()
      .catch((error) => {
        console.warn("[OrderNotificationService] Failed to start:", error);
        this.connection = null;
        this.scheduleReconnect();
      })
      .finally(() => {
        this.initializing = null;
      });
    return this.initializing;
  }

  private scheduleReconnect(delay = 5000) {
    if (this.reconnectTimer) {
      return;
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!useAuthStore.getState().isAuthenticated) {
        return;
      }
      this.ensureStarted();
    }, delay);
  }

  private flushReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private handleIncomingMessage(update: OrderStatusUpdateMessage) {
    const timestamp = update.timestamp ?? new Date().toISOString();

    // Determine notification title and type based on status
    const { title, notificationType } = this.getNotificationDetails(
      update.status
    );

    const { addNotification } = useNotificationStore.getState();
    addNotification({
      title,
      message:
        update.message || this.getDefaultMessage(update.status, update.orderId),
      type: notificationType,
      isRead: false,
      timestamp,
      metadata: {
        orderId: update.orderId,
        status: update.status,
      },
    });

    // Log critical status changes for debugging
    if (
      isDev &&
      (update.status === "COMPLETED" || update.status === "CANCELLED")
    ) {
    }

    this.listeners.forEach((listener) => {
      try {
        listener({
          ...update,
          timestamp,
        });
      } catch (error) {
        console.error("[OrderNotificationService] listener error:", error);
      }
    });
  }

  /**
   * Get notification title and type based on order status
   */
  private getNotificationDetails(status: OrderStatus): {
    title: string;
    notificationType: "order" | "payment" | "delivery";
  } {
    switch (status) {
      case "COMPLETED":
        return {
          title: "Đơn hàng hoàn thành",
          notificationType: "order",
        };
      case "CANCELLED":
        return {
          title: "Đơn hàng đã hủy",
          notificationType: "order",
        };
      case "DELIVERED":
      case "SHIPPING":
      case "SHIPPED":
        return {
          title: "Cập nhật giao hàng",
          notificationType: "delivery",
        };
      case "CONFIRMED":
      case "PACKED":
        return {
          title: "Đơn hàng đã xác nhận",
          notificationType: "order",
        };
      case "PLACED":
      case "PENDING":
        return {
          title: "Cập nhật đơn hàng",
          notificationType: "order",
        };
      case "FAILED":
        return {
          title: "Đơn hàng thất bại",
          notificationType: "payment",
        };
      default:
        return {
          title: "Cập nhật đơn hàng",
          notificationType: "order",
        };
    }
  }

  /**
   * Get default message if backend doesn't provide one
   */
  private getDefaultMessage(status: OrderStatus, orderId: number): string {
    switch (status) {
      case "COMPLETED":
        return `Đơn hàng #${orderId} đã được hoàn thành thành công. Cảm ơn bạn đã mua sắm!`;
      case "CANCELLED":
        return `Đơn hàng #${orderId} đã bị hủy. Nếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ.`;
      case "DELIVERED":
        // Check if this is actually a shipping status (from updateDeliveryStatus endpoint)
        // Backend sends "DELIVERED" with "is on the way" message for shipping
        return `Đơn hàng #${orderId} đang trên đường giao đến bạn.`;
      case "SHIPPING":
      case "SHIPPED":
        return `Đơn hàng #${orderId} đang trên đường giao đến bạn.`;
      case "CONFIRMED":
        return `Đơn hàng #${orderId} đã được xác nhận và đang được chuẩn bị.`;
      case "PACKED":
        return `Đơn hàng #${orderId} đã được đóng gói và sẵn sàng giao hàng.`;
      default:
        return `Đơn hàng #${orderId} vừa được cập nhật trạng thái.`;
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    this.ensureStarted();
    return () => {
      this.listeners.delete(listener);
    };
  }

  async stop() {
    this.flushReconnectTimer();
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.warn("[OrderNotificationService] Failed to stop:", error);
      } finally {
        this.connection = null;
      }
    }
  }

  async dispose() {
    await this.stop();
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription();
      this.appStateSubscription = null;
    }
    this.listeners.clear();
  }
}

export const orderNotificationService = new OrderNotificationService();
