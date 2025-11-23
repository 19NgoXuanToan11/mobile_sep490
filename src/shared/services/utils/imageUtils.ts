import env from "../../../config/env";

export const normalizeImageUrl = (url: string): string => {
  if (!url || typeof url !== "string") return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const baseUrl = env.API_URL.replace(/\/$/, "");
  const imagePath = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${imagePath}`;
};
