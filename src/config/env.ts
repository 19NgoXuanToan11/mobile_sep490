import { Platform } from "react-native";

type Env = {
  API_URL: string;
};

const resolveDefaultApiUrl = (): string => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5021";
  }
  // iOS 模拟器/Expo Go 本机
  if (Platform.OS === "ios") {
    return "http://localhost:7067";
  }
  // Web 或其他平台
  return "http://localhost:7067";
};

const apiUrlFromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

export const env: Env = {
  API_URL:
    apiUrlFromEnv && apiUrlFromEnv.length > 0
      ? apiUrlFromEnv
      : resolveDefaultApiUrl(),
};

// 仅在首次导入时打印一次，便于确认 Android 模拟器使用的 BaseURL
let hasLogged = false;
if (!hasLogged) {
  // eslint-disable-next-line no-console
  console.log("[ENV] API_URL=", env.API_URL);
  hasLogged = true;
}

export default env;
