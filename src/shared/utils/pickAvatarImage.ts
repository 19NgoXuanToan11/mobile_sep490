import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export async function pickAvatarImage(): Promise<string> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("PICKER_PERMISSION_DENIED");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: false,
    quality: 1,
    legacy: true,
  });

  if (result.canceled) {
    throw new Error("PICKER_CANCELED");
  }

  const asset = result.assets?.[0];
  if (!asset?.uri || !asset.width || !asset.height) {
    throw new Error("PICKER_NO_ASSET");
  }

  const { width, height } = asset;
  const size = Math.min(width, height);
  const originX = (width - size) / 2;
  const originY = (height - size) / 2;

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
      { resize: { width: Math.min(size, 1024) } },
    ],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return manipulatedImage.uri;
}
