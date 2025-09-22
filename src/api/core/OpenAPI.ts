/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from "./ApiRequestOptions";

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
  BASE: string;
  VERSION: string;
  WITH_CREDENTIALS: boolean;
  CREDENTIALS: "include" | "omit" | "same-origin";
  TOKEN?: string | Resolver<string> | undefined;
  USERNAME?: string | Resolver<string> | undefined;
  PASSWORD?: string | Resolver<string> | undefined;
  HEADERS?: Headers | Resolver<Headers> | undefined;
  ENCODE_PATH?: ((path: string) => string) | undefined;
};

export const OpenAPI: OpenAPIConfig = {
  BASE: "",
  VERSION: "1",
  WITH_CREDENTIALS: false,
  CREDENTIALS: "include",
  TOKEN: undefined,
  USERNAME: undefined,
  PASSWORD: undefined,
  HEADERS: undefined,
  ENCODE_PATH: undefined,
};

// Runtime init: set BASE from env and TOKEN from secure storage lazily
// Note: keep this file ESM-safe and without React Native imports here
try {
  // Dynamic import to avoid circular deps when bundling
  const init = async () => {
    const { env } = await import("../../config/env");
    OpenAPI.BASE = env.API_URL;
    // Provide a TOKEN resolver so requests attach Authorization automatically
    OpenAPI.TOKEN = async () => {
      try {
        const { authStorage } = await import("../../shared/lib/storage");
        const token = await authStorage.getAccessToken();
        return token ?? "";
      } catch {
        return "";
      }
    };
  };
  // Kick off without blocking module evaluation
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  init();
} catch {
  // no-op
}
