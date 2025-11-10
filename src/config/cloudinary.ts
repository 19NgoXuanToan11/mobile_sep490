export const CLOUDINARY = {
  cloudName: "dlfitbaqd",
  unsignedPreset: "sep490",
  folder: "sep490/avatars",

  get uploadUrl() {
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
  },
} as const;
