module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      "react-native-worklets/plugin",
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@/components": "./src/shared/ui",
            "@/hooks": "./src/shared/hooks",
            "@/utils": "./src/shared/lib",
            "@/types": "./src/types",
            "@/api": "./src/api",
            "@/config": "./src/config",
          },
        },
      ],
    ],
  };
};
