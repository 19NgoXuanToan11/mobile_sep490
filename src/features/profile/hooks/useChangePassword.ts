import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { profileApi } from "../../../shared/data/api";
import { useToast } from "../../../shared/ui/toast";

interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Custom hook for changing password with React Query
 * Handles API call, error states, and navigation
 */
export function useChangePassword() {
  const toast = useToast();

  return useMutation({
    mutationFn: async (params: ChangePasswordParams) => {
      const response = await profileApi.changePassword(
        params.oldPassword,
        params.newPassword,
        params.confirmPassword
      );

      if (!response.success) {
        throw new Error(response.message || "Đổi mật khẩu thất bại");
      }

      return response;
    },
    onSuccess: () => {
      toast.success(
        "Đổi mật khẩu thành công 🎉",
        "Mật khẩu của bạn đã được cập nhật"
      );

      // Navigate back after a short delay for better UX
      setTimeout(() => {
        router.back();
      }, 800);
    },
    onError: (error: any) => {
      // Handle 401 - Session expired
      if (
        error?.message?.includes("hết hạn") ||
        error?.message?.includes("đăng nhập")
      ) {
        toast.error("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại");
        setTimeout(() => {
          router.replace("/(public)/auth/login");
        }, 1000);
        return;
      }

      // Handle other errors
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Đổi mật khẩu thất bại, vui lòng thử lại";

      toast.error("Đổi mật khẩu thất bại", errorMessage);
    },
  });
}
