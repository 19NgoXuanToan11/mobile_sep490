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

      // Backend returns { Status: 201, Message: "..." } on success (HTTP 200)
      // or { Status: 400, Message: "..." } on error (HTTP 400)
      const responseStatus = result?.Status ?? result?.status;
      const responseMessage = result?.Message ?? result?.message;

      // Check if registration was successful
      if (responseStatus !== 201) {
        // Registration failed - return error message from backend
        return {
          success: false,
          data: null as any,
          message: responseMessage || "Registration failed",
          errors: {
            general: [responseMessage || "Registration failed"],
          },
        };
      }

      // Registration successful, but backend doesn't return a token
      // We need to auto-login to get the token
      const loginResult = await AccountService.postApiV1AccountLogin({
        requestBody: {
          email: userData.email,
          password: userData.password,
        },
      });

      const token =
        loginResult?.data?.token ??
        loginResult?.token ??
        loginResult?.accessToken;

      if (!token) {
        return {
          success: false,
          data: null as any,
          message: "Registration successful but failed to login automatically",
        };
      }

      await authStorage.setTokens(token);
      OpenAPI.TOKEN = token;

      // Now fetch profile with the token
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
        phone: profileResp?.data?.phone ?? profileResp?.phone,
        gender: profileResp?.data?.gender ?? profileResp?.gender,
        address: profileResp?.data?.address ?? profileResp?.address,
        avatar: profileResp?.data?.images ?? profileResp?.images,
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: { user, token } };
    } catch (error: any) {
      // Extract error message from API error response if available
      let errorMessage = "Registration failed";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Check if error has response body with message
      if (error?.body?.Message || error?.body?.message) {
        errorMessage = error.body.Message || error.body.message;
      } else if (
        error?.response?.data?.Message ||
        error?.response?.data?.message
      ) {
        errorMessage =
          error.response.data.Message || error.response.data.message;
      }

      return {
        success: false,
        data: null as any,
        message: errorMessage,
        errors: {
          general: [errorMessage],
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
