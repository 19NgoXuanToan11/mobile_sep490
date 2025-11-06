type Env = {
  API_URL: string;
};
const PRODUCTION_API_URL = "https://iotfarm.onrender.com";
const apiUrlFromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
export const env: Env = {
  API_URL:
    apiUrlFromEnv && apiUrlFromEnv.length > 0
      ? apiUrlFromEnv
      : PRODUCTION_API_URL,
};
let hasLogged = false;
if (!hasLogged) {
  hasLogged = true;
}
export default env;
