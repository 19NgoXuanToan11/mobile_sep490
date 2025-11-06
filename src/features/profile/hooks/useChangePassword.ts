import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { profileApi } from "../../../shared/data/api";
import { useToast } from "../../../shared/ui/toast";
interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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

      setTimeout(() => {
        router.back();
      }, 800);
    },
    onError: (error: any) => {

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

      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Đổi mật khẩu thất bại, vui lòng thử lại";
      toast.error("Đổi mật khẩu thất bại", errorMessage);
    },
  });
}
