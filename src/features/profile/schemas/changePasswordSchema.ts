import { z } from "zod";

/**
 * Password strength validation:
 * - Minimum 6 characters
 * - At least 1 letter (uppercase or lowercase)
 * - At least 1 number
 * - At least 1 special character (recommended)
 */
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),

    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .regex(passwordRegex, "Mật khẩu phải gồm ít nhất 1 chữ cái và 1 số"),

    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Calculate password strength
 * Returns: "weak" | "medium" | "strong"
 */
export function getPasswordStrength(
  password: string
): "weak" | "medium" | "strong" {
  if (!password || password.length < 6) return "weak";

  let strength = 0;

  // Length check
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;

  // Character variety
  if (/[a-z]/.test(password)) strength++; // lowercase
  if (/[A-Z]/.test(password)) strength++; // uppercase
  if (/\d/.test(password)) strength++; // number
  if (/[^A-Za-z0-9]/.test(password)) strength++; // special char

  if (strength <= 2) return "weak";
  if (strength <= 4) return "medium";
  return "strong";
}
