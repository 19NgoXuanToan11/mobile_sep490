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

export type OrderStatusUpdateMessage = {
  orderId: number;
  status: string;
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

    connection.on("ReceiveOrderStatusUpdate", (payload: OrderStatusUpdateMessage) => {
      if (!payload) {
        return;
      }
      this.handleIncomingMessage(payload);
    });

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
    const timestamp =
      update.timestamp ?? new Date().toISOString();

    const { addNotification } = useNotificationStore.getState();
    addNotification({
      title: "Cập nhật đơn hàng",
      message: update.message || `Đơn hàng #${update.orderId} vừa được cập nhật`,
      type: "order",
      isRead: false,
      timestamp,
      metadata: {
        orderId: update.orderId,
        status: update.status,
      },
    });

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

