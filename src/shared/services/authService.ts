import {
  User,
  LoginFormData,
  RegisterFormData,
  ApiResponse,
} from "../../types";
import { OpenAPI, AccountService, AccountProfileService } from "../../api";
import { authStorage } from "../lib/storage";
import env from "../../config/env";

export class AuthService {
  async login(
    credentials: LoginFormData
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      OpenAPI.BASE = env.API_URL;
      const result = await AccountService.postApiV1AccountLogin({
        requestBody: {
          email: credentials.email,
          password: credentials.password,
        },
      });
      const token = result?.data?.token ?? result?.token ?? result?.accessToken;
      if (!token) {
        return {
          success: false,
          data: null as any,
          message: "No token returned",
        };
      }
      await authStorage.setTokens(token);
      OpenAPI.TOKEN = token;

      const profileResp =
        await AccountProfileService.getApiV1AccountProfileProfile();
      const user: User = {
        id: String(
          profileResp?.data?.accountProfileId ??
            profileResp?.accountProfileId ??
            "0"
        ),
        name:
          profileResp?.data?.fullname ??
          profileResp?.fullname ??
          credentials.email.split("@")[0],
        email:
          profileResp?.data?.email ?? profileResp?.email ?? credentials.email,
        phone: profileResp?.data?.phone ?? profileResp?.phone,
        gender: profileResp?.data?.gender ?? profileResp?.gender,
        address: profileResp?.data?.address ?? profileResp?.address,
        avatar: profileResp?.data?.images ?? profileResp?.images,
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: { user, token } };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  async register(
    userData: RegisterFormData
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      OpenAPI.BASE = env.API_URL;
      const result = await AccountService.postApiV1AccountRegister({
        requestBody: {
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
        } as any,
      });
      const token = result?.data?.token ?? result?.token ?? result?.accessToken;
      if (token) {
        await authStorage.setTokens(token);
        OpenAPI.TOKEN = token;
      }
      const profileResp =
        await AccountProfileService.getApiV1AccountProfileProfile();
      const user: User = {
        id: String(
          profileResp?.data?.accountProfileId ??
            profileResp?.accountProfileId ??
            "0"
        ),
        name:
          profileResp?.data?.fullname ??
          profileResp?.fullname ??
          userData.email.split("@")[0],
        email: profileResp?.data?.email ?? profileResp?.email ?? userData.email,
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: { user, token: token ?? "" } };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : "Registration failed",
        errors: {
          general: [
            error instanceof Error ? error.message : "Registration failed",
          ],
        },
      };
    }
  }

  async logout(): Promise<ApiResponse<null>> {
    await authStorage.clearTokens();
    OpenAPI.TOKEN = undefined;
    return {
      success: true,
      data: null,
    };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const token = await authStorage.getAccessToken();
    if (!token) {
      return {
        success: false,
        data: null as any,
        message: "Not authenticated",
      };
    }
    try {
      OpenAPI.BASE = env.API_URL;
      OpenAPI.TOKEN = token;
      const profileResp =
        await AccountProfileService.getApiV1AccountProfileProfile();
      const user: User = {
        id: String(
          profileResp?.data?.accountProfileId ??
            profileResp?.accountProfileId ??
            "0"
        ),
        name: profileResp?.data?.fullname ?? profileResp?.fullname ?? "User",
        email: profileResp?.data?.email ?? profileResp?.email ?? "",
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message:
          error instanceof Error ? error.message : "Failed to get current user",
      };
    }
  }
}

export const authService = new AuthService();
