import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for CollegeBook.
 *
 * The same React codebase in `src/` is compiled by Vite into `dist/` and wrapped
 * into native Android / iOS shells. No rewrite, no second codebase.
 *
 * Local device / emulator workflow:
 *   npm run build && npx cap sync && npx cap run android|ios
 */
const config: CapacitorConfig = {
  appId: "com.collegebook.app",
  appName: "CollegeBook",
  webDir: "dist",
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0B1220",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "body",
    },
  },
};

export default config;
