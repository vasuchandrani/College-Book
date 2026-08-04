import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNativeShell } from "@/lib/native";

// No-op in the browser; configures status bar, keyboard, back button and
// hides the splash screen inside the Capacitor native shell.
void initNativeShell();

createRoot(document.getElementById("root")!).render(<App />);
