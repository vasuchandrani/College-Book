import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { Preferences } from "@capacitor/preferences";
import { PushNotifications } from "@capacitor/push-notifications";
import { Network } from "@capacitor/network";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { isNative } from "@/lib/platform";

/**
 * Native capability wrappers.
 *
 * Every function degrades gracefully on the web so the exact same UI code runs
 * in the browser and inside the Capacitor shell. Components must import from
 * here — never from `@capacitor/*` directly.
 */

/* ------------------------------------------------------------------ camera */

/** Take a photo (native camera) or pick one from the gallery. Returns a data URL. */
export async function capturePhoto(source: "camera" | "gallery" = "camera") {
  if (!isNative()) {
    return pickFileAsDataUrl();
  }
  const photo = await Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
  });
  return photo.dataUrl ?? null;
}

/** Browser fallback: <input type="file"> → data URL. */
function pickFileAsDataUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve(null);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

/* ------------------------------------------------------------- geolocation */

export async function getCurrentPosition() {
  if (isNative()) {
    const perm = await Geolocation.requestPermissions();
    if (perm.location === "denied") return null;
  }
  try {
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------- offline key-value */

/** Persistent key/value storage: Preferences natively, localStorage on web. */
export const storage = {
  async get(key: string): Promise<string | null> {
    if (!isNative()) return typeof window === "undefined" ? null : localStorage.getItem(key);
    const { value } = await Preferences.get({ key });
    return value ?? null;
  },
  async set(key: string, value: string): Promise<void> {
    if (!isNative()) {
      if (typeof window !== "undefined") localStorage.setItem(key, value);
      return;
    }
    await Preferences.set({ key, value });
  },
  async remove(key: string): Promise<void> {
    if (!isNative()) {
      if (typeof window !== "undefined") localStorage.removeItem(key);
      return;
    }
    await Preferences.remove({ key });
  },
};

/* -------------------------------------------------------------- filesystem */

/** Write a text file into the app's Documents directory (native only). */
export async function writeTextFile(path: string, data: string) {
  if (!isNative()) return null;
  return Filesystem.writeFile({
    path,
    data,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });
}

/* ------------------------------------------------------- push notifications */

/**
 * Register for push and hand the device token to the backend.
 * `onToken` should POST the token through `src/lib/api.ts`
 * (e.g. `registerPushToken(token)`), never with a direct fetch.
 */
export async function registerPush(onToken: (token: string) => void) {
  if (!isNative()) return;
  const perm = await PushNotifications.requestPermissions();
  if (perm.receive !== "granted") return;
  await PushNotifications.register();
  await PushNotifications.addListener("registration", ({ value }) => onToken(value));
  await PushNotifications.addListener("registrationError", (err) =>
    console.error("[push] registration failed", err)
  );
}

/* ----------------------------------------------------------------- network */

export async function isOnline(): Promise<boolean> {
  try {
    const status = await Network.getStatus();
    return status.connected;
  } catch {
    return typeof navigator === "undefined" ? true : navigator.onLine;
  }
}

/* ----------------------------------------------------------------- haptics */

export async function tapFeedback() {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* no-op */
  }
}
