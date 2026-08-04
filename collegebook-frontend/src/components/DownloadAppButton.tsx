import { useMemo, useState } from "react";
import { Apple, Download, QrCode, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { appConfig, isIosBuildAvailable } from "@/config/app.config";
import { detectVisitorPlatform } from "@/lib/platform";
import { toast } from "sonner";
import heroImg from "@/assets/hero-illustration.png";

/**
 * Single "Download CollegeBook" CTA.
 *
 * Android  → downloads the APK from `appConfig.mobile.apkUrl`
 * iOS      → opens `appConfig.mobile.iosUrl`, or a "coming soon" notice
 * Desktop  → modal with an APK button, a QR code and the iOS status
 *
 * URLs are configuration, never hardcoded here — see `src/config/app.config.ts`.
 */
const DownloadAppButton = () => {
  const [open, setOpen] = useState(false);
  const platform = useMemo(() => detectVisitorPlatform(), []);
  const { apkUrl, iosUrl, androidVersion } = appConfig.mobile;

  const downloadApk = () => {
    const link = document.createElement("a");
    link.href = apkUrl;
    link.setAttribute("download", "collegebook.apk");
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Download started", {
      description: "Allow installs from unknown sources to finish setup.",
    });
  };

  const handleClick = () => {
    if (platform === "android") return downloadApk();
    if (platform === "ios") {
      if (isIosBuildAvailable) {
        window.location.href = iosUrl;
        return;
      }
      toast("The iOS version is coming soon", {
        description: "Android is available today — iOS lands shortly.",
      });
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={handleClick}
        className="gap-3 text-base px-6 border-primary/30 hover:bg-primary/5"
      >
        <img
          src={heroImg}
          alt="CollegeBook app icon"
          className="h-6 w-6 object-contain"
          width={24}
          height={24}
          loading="lazy"
        />
        <span className="text-left leading-tight">
          <span className="text-xs text-muted-foreground block">Mobile App</span>
          <span className="font-semibold text-sm">Download CollegeBook</span>
        </span>
        <Download className="h-4 w-4 ml-1" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Get CollegeBook on your phone</DialogTitle>
            <DialogDescription>
              Install the Android app directly from our site — no store required.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <QRCodeSVG value={apkUrl} size={168} level="M" includeMargin={false} />
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrCode className="h-4 w-4" />
              Scan with your Android phone to download
            </p>

            <Button
              onClick={downloadApk}
              className="w-full gap-2 bg-gradient-hero text-primary-foreground"
            >
              <Smartphone className="h-4 w-4" />
              Download APK
              <span className="text-xs opacity-80">v{androidVersion}</span>
            </Button>

            <div className="w-full rounded-lg border border-border bg-muted/40 p-3 text-center">
              {isIosBuildAvailable ? (
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href={iosUrl}>
                    <Apple className="h-4 w-4" />
                    Install on iOS
                  </a>
                </Button>
              ) : (
                <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Apple className="h-4 w-4" />
                  The iOS version is coming soon.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DownloadAppButton;
