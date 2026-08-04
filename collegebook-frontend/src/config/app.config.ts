/**
 * Central runtime configuration for CollegeBook.
 *
 * Everything environment-dependent lives here — no URL, key or feature flag
 * should ever be hardcoded inside a component.
 *
 * Override any value with a Vite env var (`.env`, `.env.production`, CI secrets):
 *   VITE_API_BASE_URL=https://api.collegebook.com/api/v1
 *   VITE_APK_DOWNLOAD_URL=https://cdn.collegebook.com/downloads/collegebook-latest.apk
 *   VITE_IOS_INSTALL_URL=itms-services://?action=download-manifest&url=...
 */

const env = import.meta.env;

export const appConfig = {
  /** Product identity */
  name: "CollegeBook",
  tagline: "Build Your College Story.",

  /** Backend (Spring Boot) base URL — proxied to :8081 in local dev */
  apiBaseUrl: (env.VITE_API_BASE_URL as string | undefined) ?? "/api/v1",

  /** Public site URL, used for canonical tags and QR codes */
  siteUrl:
    (env.VITE_SITE_URL as string | undefined) ??
    (typeof window !== "undefined" ? window.location.origin : "https://collegebook.app"),

  /** Simulated latency for the mock API layer (ms). Ignored once the backend is live. */
  mockLatencyMs: Number(env.VITE_MOCK_LATENCY_MS ?? 250),

  /** Direct-distribution mobile builds (no Play Store / App Store at this stage) */
  mobile: {
    /** Android APK — replace with the real hosted APK URL when a build exists. */
    apkUrl:
      (env.VITE_APK_DOWNLOAD_URL as string | undefined) ??
      "https://downloads.collegebook.app/collegebook-latest.apk",
    /** Latest published Android version label shown in the UI. */
    androidVersion: (env.VITE_APK_VERSION as string | undefined) ?? "1.0.0",
    /**
     * iOS install URL (ad-hoc / TestFlight / enterprise manifest).
     * Leave empty until an iOS build exists — the UI then shows "coming soon".
     */
    iosUrl: (env.VITE_IOS_INSTALL_URL as string | undefined) ?? "",
  },
} as const;

/** True when an Android APK URL is configured. */
export const isAndroidBuildAvailable = Boolean(appConfig.mobile.apkUrl);

/** True only once a real iOS install URL is configured. */
export const isIosBuildAvailable = Boolean(appConfig.mobile.iosUrl);
