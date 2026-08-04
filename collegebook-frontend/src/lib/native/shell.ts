import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";
import { isNative } from "@/lib/platform";

/**
 * One-time native shell bootstrap. Called from `src/main.tsx`.
 * Completely inert in the browser.
 */
export async function initNativeShell() {
  if (!isNative()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    /* status bar unsupported on this platform */
  }

  try {
    await Keyboard.setAccessoryBarVisible({ isVisible: true });
  } catch {
    /* iOS only */
  }

  // Android hardware back button: go back in history, exit at the root.
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else App.exitApp();
  });

  await SplashScreen.hide();
}
