import { useState, useRef, useCallback } from "react";
import { pickAvatarImage } from "../utils/pickAvatarImage";
import {
  uploadAvatarDirectToCloudinary,
  CloudinaryUploadError,
} from "../utils/uploadCloudinaryDirect";
import { profileApi } from "../shared/data/api";

export function useUploadAvatar(userId: string | number): {
  isUploading: boolean;
  progress: number;
  error: string | null;
  start: () => Promise<void>;
  cancel: () => void;
} {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const start = useCallback(async () => {
    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Step 1: Pick image
      let fileUri: string;
      try {
        fileUri = await pickAvatarImage();
      } catch (err) {
        if (err instanceof Error && err.message === "PICKER_CANCELED") {
          // User canceled - not an error
          setIsUploading(false);
          return;
        }
        throw err;
      }

      // Step 2: Create AbortController for cancellation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Step 3: Upload to Cloudinary
      let secureUrl: string;
      try {
        secureUrl = await uploadAvatarDirectToCloudinary({
          fileUri,
          userId,
          onProgress: (percent) => {
            setProgress(percent);
          },
          signal: abortController.signal,
        });
      } catch (err) {
        if (abortController.signal.aborted) {
          setError("Đã hủy tải lên");
          setIsUploading(false);
          return;
        }
        if (err instanceof CloudinaryUploadError) {
          throw new Error(
            err.message === "NETWORK_ERROR"
              ? "Lỗi kết nối mạng"
              : err.message === "INVALID_CLOUDINARY_RESPONSE"
              ? "Phản hồi không hợp lệ từ Cloudinary"
              : `Tải lên thất bại: ${err.message}`
          );
        }
        throw err;
      }

      // Step 4: Get current profile to merge with new image URL
      const currentProfileResponse = await profileApi.getProfile();
      if (!currentProfileResponse.success || !currentProfileResponse.data) {
        throw new Error("Không thể lấy thông tin hồ sơ hiện tại");
      }

      const currentProfile = currentProfileResponse.data;

      // Step 5: Update profile with new image URL
      const updateResponse = await profileApi.updateProfile({
        fullname: currentProfile.fullname || "",
        phone: currentProfile.phone,
        address: currentProfile.address,
        gender: currentProfile.gender
          ? Number(currentProfile.gender)
          : undefined,
        images: secureUrl,
      });

      if (!updateResponse.success) {
        throw new Error(updateResponse.message || "Không thể cập nhật hồ sơ");
      }

      // Success - reset state
      setIsUploading(false);
      setProgress(0);
      setError(null);
    } catch (err) {
      setIsUploading(false);
      setProgress(0);
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
    } finally {
      abortControllerRef.current = null;
    }
  }, [userId]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    isUploading,
    progress,
    error,
    start,
    cancel,
  };
}
