import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import { hideNativeSplash } from "@/lib/native";

const SPLASH_SHOWN_KEY = "cb_splash_shown";

const AppSplash = () => {
  // If splash was already shown in this browser session, skip entirely.
  const alreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY) === "1";
  const [phase, setPhase] = useState<"loading" | "branding" | "hidden">(
    alreadyShown ? "hidden" : "loading"
  );

  useEffect(() => {
    // If already hidden, nothing to do.
    if (alreadyShown) {
      void hideNativeSplash();
      return;
    }

    let brandingTimeout: number | undefined;
    let frame: number | undefined;

    const showBranding = () => {
      frame = window.requestAnimationFrame(() => {
        void hideNativeSplash();
        setPhase("branding");
        brandingTimeout = window.setTimeout(() => {
          sessionStorage.setItem(SPLASH_SHOWN_KEY, "1");
          setPhase("hidden");
        }, 1500);
      });
    };

    if (document.readyState === "complete") {
      showBranding();
    } else {
      window.addEventListener("load", showBranding, { once: true });
    }

    return () => {
      window.removeEventListener("load", showBranding);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      if (brandingTimeout !== undefined) window.clearTimeout(brandingTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === "hidden") return null;

  if (phase === "loading") {
    return <div className="app-splash" role="status" aria-label="Loading CollegeBook" />;
  }

  return (
    <div className="app-splash" role="status" aria-label="Loading CollegeBook">
      <div className="app-splash-content">
        <img className="app-splash-logo" src={logo} alt="" width={260} height={260} />
        <h1>CollegeBook</h1>
        <p>Build Your College Story</p>
      </div>
    </div>
  );
};

export default AppSplash;
