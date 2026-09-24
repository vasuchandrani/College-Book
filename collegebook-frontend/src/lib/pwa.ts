import { useEffect, useState } from "react";
import { isNative } from "@/lib/platform";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export const registerPwa = (): void => {
  if (
    import.meta.env.PROD &&
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    !isNative()
  ) {
    void navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("CollegeBook service worker registration failed", error);
    });
  }

  if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event as BeforeInstallPromptEvent;
      notify();
    });
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      notify();
    });
  }
};

export const canInstallPwa = (): boolean => Boolean(deferredInstallPrompt);

export const isStandalonePwa = (): boolean =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

export const promptPwaInstall = async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
  if (!deferredInstallPrompt) return "unavailable";
  const prompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  notify();
  return choice.outcome;
};

export const usePwaInstall = () => {
  const [available, setAvailable] = useState(canInstallPwa);
  const [installed, setInstalled] = useState(isStandalonePwa);

  useEffect(() => {
    const update = () => {
      setAvailable(canInstallPwa());
      setInstalled(isStandalonePwa());
    };
    listeners.add(update);
    window.addEventListener("resize", update);
    return () => {
      listeners.delete(update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return { available, installed };
};
