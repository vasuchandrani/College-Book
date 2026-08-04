import { Capacitor } from "@capacitor/core";

/**
 * Platform detection helpers.
 *
 * Two questions are answered here and nowhere else in the codebase:
 *  1. Are we running inside a Capacitor native shell? (`isNative`)
 *  2. What device is the *web* visitor on? (`detectVisitorPlatform`)
 */

export type VisitorPlatform = "android" | "ios" | "desktop";

/** Running inside the Android / iOS Capacitor shell. */
export const isNative = (): boolean => Capacitor.isNativePlatform();

/** "android" | "ios" | "web" as reported by Capacitor. */
export const nativePlatform = (): string => Capacitor.getPlatform();

/** Best-effort device detection for browser visitors (used by the download CTA). */
export function detectVisitorPlatform(): VisitorPlatform {
  if (typeof navigator === "undefined") return "desktop";

  const ua = navigator.userAgent || "";
  const isTouchMac =
    /Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document;

  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/i.test(ua) || isTouchMac) return "ios";
  return "desktop";
}
