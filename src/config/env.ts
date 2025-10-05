type Env = {
  API_URL: string;
};

/**
 * Production API URL - deployed backend on Render
 * Can be overridden via EXPO_PUBLIC_API_URL environment variable
 */
const PRODUCTION_API_URL = "https://iotfarm.onrender.com";

const apiUrlFromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

export const env: Env = {
  API_URL:
    apiUrlFromEnv && apiUrlFromEnv.length > 0
      ? apiUrlFromEnv
      : PRODUCTION_API_URL,
};

// Log API URL on first import for debugging
let hasLogged = false;
if (!hasLogged) {
  // eslint-disable-next-line no-console
  hasLogged = true;
}

export default env;
