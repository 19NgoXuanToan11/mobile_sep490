import { authStorage, storage } from "./storage";

type SessionTerminationReason = "expired" | "manual";

interface TerminateSessionOptions {
  notify?: boolean;
  title?: string;
  description?: string;
  reason?: SessionTerminationReason;
}

let terminationInProgress = false;

const getAuthStore = () => {
  try {
    const { useAuthStore } = require("../hooks");
    return useAuthStore;
  } catch {
    return null;
  }
};

const getToastStore = () => {
  try {
    const { useToastStore } = require("../ui/toast");
    return useToastStore;
  } catch {
    return null;
  }
};

export const terminateSession = async (
  options: TerminateSessionOptions = {}
) => {
  if (terminationInProgress) return;

  const AuthStore = getAuthStore();
  if (!AuthStore) return;

  const authState = AuthStore.getState();
  const hasActiveSession =
    authState.isAuthenticated || Boolean(await authStorage.getAccessToken());
  if (!hasActiveSession) return;

  terminationInProgress = true;
  try {
    await authStorage.clearTokens();
    await storage.clear();
    await authState.logout();

    if (options.notify !== false) {
      const ToastStore = getToastStore();
      if (ToastStore) {
        ToastStore.getState().addToast({
          type: options.reason === "manual" ? "info" : "warning",
          title: options.title ?? "Phiên đăng nhập đã hết hạn",
          description:
            options.description ??
            "Phiên làm việc đã vượt quá 30 phút. Vui lòng đăng nhập lại để tiếp tục.",
          duration: 6000,
        });
      }
    }
  } finally {
    setTimeout(() => {
      terminationInProgress = false;
    }, 500);
  }
};
