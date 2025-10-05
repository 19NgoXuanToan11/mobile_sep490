import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import env from "../config/env";

const ONE_TIME_LOG = (() => {
  let logged = false;
  return (message: string, ...payload: unknown[]) => {
    if (!logged) {
      // eslint-disable-next-line no-console
      logged = true;
    }
  };
})();

export const createHttpClient = (
  baseURL: string = env.API_URL
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  ONE_TIME_LOG("[HTTP] baseURL=", baseURL);

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    try {

    } catch {}
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      try {
        // eslint-disable-next-line no-console
      } catch {}
      // IMPORTANT: return full AxiosResponse to keep compatibility with OpenAPI client
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data as any;
        const message =
          (data && (data.message || data.error || data.title)) || error.message;
        return Promise.reject(new Error(`HTTP ${status}: ${message}`));
      }
      if (error.request) {
        return Promise.reject(new Error("Network error or no response"));
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const http = createHttpClient();

export default http;
