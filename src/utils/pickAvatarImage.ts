import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * Open image library and let user pick an image.
 * Automatically crops to square from center and returns local file URI.
 * This provides better UX by avoiding the native crop screen issues.
 */
export async function pickAvatarImage(): Promise<string> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("PICKER_PERMISSION_DENIED");
  }

  // Pick image without editing screen for better UX
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: false, // Bỏ màn hình crop để tránh vấn đề nút bị che
    quality: 1,
    legacy: true, // Cho phép truy cập ảnh từ Google Photos và các nguồn khác
  });

  if (result.canceled) {
    throw new Error("PICKER_CANCELED");
  }

  const asset = result.assets?.[0];
  if (!asset?.uri || !asset.width || !asset.height) {
    throw new Error("PICKER_NO_ASSET");
  }

  // Tự động crop thành hình vuông từ center
  const { width, height } = asset;
  const size = Math.min(width, height); // Lấy cạnh nhỏ hơn
  const originX = (width - size) / 2; // Crop từ center theo chiều ngang
  const originY = (height - size) / 2; // Crop từ center theo chiều dọc

  // Manipulate image: crop to square and resize if needed
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    asset.uri,
    [
      {
        crop: {
          originX: Math.max(0, originX),
          originY: Math.max(0, originY),
          width: size,
          height: size,
        },
      },
      // Resize to reasonable size for avatar (max 1024x1024)
      { resize: { width: Math.min(size, 1024) } },
    ],
    {
      compress: 0.9, // Giữ chất lượng tốt
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return manipulatedImage.uri;
}
