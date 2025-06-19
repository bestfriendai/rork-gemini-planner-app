export default {
  expo: {
    name: "Gemini Planner App",
    slug: "gemini-planner-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      OPENROUTER_API_KEY: "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",
      PERPLEXITY_API_KEY: "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",
    }
  }
};