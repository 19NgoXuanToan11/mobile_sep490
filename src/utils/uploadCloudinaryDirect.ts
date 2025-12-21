import { CLOUDINARY } from "../config/cloudinary";

export type DirectUploadOptions = {
  fileUri: string;
  userId: string | number;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

export class CloudinaryUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudinaryUploadError";
  }
}

export function uploadAvatarDirectToCloudinary(
  options: DirectUploadOptions
): Promise<string> {
  const { fileUri, userId, onProgress, signal } = options;

  const formData = new FormData();

  formData.append("file", {
    uri: fileUri,
    type: "image/jpeg",
    name: `avatar_${Date.now()}.jpg`,
  } as any);

  formData.append("upload_preset", CLOUDINARY.unsignedPreset);

  formData.append("folder", `${CLOUDINARY.folder}/${userId}`);

  const xhr = new XMLHttpRequest();

  const promise = new Promise<string>((resolve, reject) => {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100); 
        onProgress(Math.min(100, percent));
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;

      try {
        const json = JSON.parse(xhr.responseText || "{}");

        if (xhr.status >= 200 && xhr.status < 300 && json.secure_url) {
          resolve(json.secure_url as string);
        } else {
          const message =
            json?.error?.message ||
            json?.message ||
            `Cloudinary upload failed with status ${xhr.status}`;
          reject(new CloudinaryUploadError(message));
        }
      } catch (err) {
        reject(new CloudinaryUploadError("INVALID_CLOUDINARY_RESPONSE"));
      }
    };

    xhr.onerror = () => {
      reject(new CloudinaryUploadError("NETWORK_ERROR"));
    };
  });

  if (signal) {
    if (signal.aborted) {
      xhr.abort();
    } else {
      signal.addEventListener("abort", () => {
        xhr.abort();
      });
    }
  }

  xhr.open("POST", CLOUDINARY.uploadUrl);
  xhr.send(formData);

  return promise;
}
