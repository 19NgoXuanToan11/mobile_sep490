import { authStorage, storage } from "./storage";
import { useAuthStore } from "../hooks";
import { useToastStore } from "../ui/toast";

type SessionTerminationReason = "expired" | "manual";

interface TerminateSessionOptions {
  notify?: boolean;
  title?: string;
  description?: string;
  reason?: SessionTerminationReason;
}

let terminationInProgress = false;

export const terminateSession = async (
  options: TerminateSessionOptions = {}
) => {
  if (terminationInProgress) return;

  const authState = useAuthStore.getState();
  const hasActiveSession =
    authState.isAuthenticated || Boolean(await authStorage.getAccessToken());
  if (!hasActiveSession) return;

  terminationInProgress = true;
  try {
    await authStorage.clearTokens();
    await storage.clear();
    await authState.logout();

    if (options.notify !== false) {
      useToastStore.getState().addToast({
        type: options.reason === "manual" ? "info" : "warning",
        title: options.title ?? "Phiên đăng nhập đã hết hạn",
        description:
          options.description ??
          "Phiên làm việc đã vượt quá 30 phút. Vui lòng đăng nhập lại để tiếp tục.",
        duration: 6000,
      });
    }
  } finally {
    setTimeout(() => {
      terminationInProgress = false;
    }, 500);
  }
};
