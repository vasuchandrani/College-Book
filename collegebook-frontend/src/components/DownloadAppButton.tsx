import { useState } from "react";
import { Download, Smartphone, Share, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import heroImg from "@/assets/hero-illustration.png";
import { detectVisitorPlatform, isNative } from "@/lib/platform";
import { promptPwaInstall, usePwaInstall } from "@/lib/pwa";

/**
 * Download CollegeBook CTA.
 * Uses the browser's install prompt on Android and gives Safari-specific
 * Add to Home Screen instructions on iOS.
 */
const DownloadAppButton = () => {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop">("desktop");
  const { available, installed } = usePwaInstall();

  const handleOpen = () => {
    setPlatform(detectVisitorPlatform());
    setOpen(true);
  };

  const handleAndroidInstall = async () => {
    const result = await promptPwaInstall();
    if (result === "accepted") setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={handleOpen}
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
        <DialogContent className="max-w-md text-center sm:text-left">
          <DialogHeader className="items-center sm:items-start">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Smartphone className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {installed ? "CollegeBook is installed" : "Keep CollegeBook on your home screen"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground pt-1">
              The CollegeBook mobile app will launch soon.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-4">
            {installed || isNative() ? (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground leading-relaxed flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>CollegeBook is ready on this device. Open it from your home screen for the best experience.</span>
              </div>
            ) : platform === "android" ? (
              <>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/60 text-sm text-muted-foreground leading-relaxed">
                  Install CollegeBook like a mobile app. Your account and data stay connected to the same secure CollegeBook service.
                </div>
                {available ? (
                  <Button onClick={handleAndroidInstall} className="w-full bg-gradient-hero text-primary-foreground font-semibold">
                    <Download className="h-4 w-4 mr-2" />
                    Install CollegeBook
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/60 text-sm text-muted-foreground leading-relaxed">
                    Open your browser menu and choose <strong className="text-foreground">Install app</strong> or <strong className="text-foreground">Add to Home screen</strong>.
                  </div>
                )}
              </>
            ) : platform === "ios" ? (
              <>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/60 text-sm text-muted-foreground leading-relaxed">
                  For now, keep CollegeBook on your iPhone home screen for a fast, app-like experience:
                </div>
                <ol className="space-y-3 text-sm text-left text-muted-foreground">
                  <li className="flex gap-3"><span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">1</span><span>Tap Safari's <strong className="text-foreground">Share</strong> button <Share className="inline h-4 w-4 align-text-bottom" />.</span></li>
                  <li className="flex gap-3"><span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">2</span><span>Choose <strong className="text-foreground">Add to Home Screen</strong>.</span></li>
                  <li className="flex gap-3"><span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">3</span><span>Tap <strong className="text-foreground">Add</strong>. CollegeBook will launch from your home screen.</span></li>
                </ol>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-muted/50 border border-border/60 text-sm text-muted-foreground leading-relaxed">
                On a phone, use the browser menu to install CollegeBook. On desktop, continue using the website while the mobile app is being prepared.
              </div>
            )}

            <Button
              onClick={() => setOpen(false)}
              variant={platform === "android" && available && !installed ? "outline" : "default"}
              className={platform === "android" && available && !installed ? "w-full" : "w-full bg-gradient-hero text-primary-foreground font-semibold"}
            >
              {installed ? "Continue to CollegeBook" : "Got it"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DownloadAppButton;
