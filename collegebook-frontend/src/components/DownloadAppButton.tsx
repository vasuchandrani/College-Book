import { useState } from "react";
import { Download, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import heroImg from "@/assets/hero-illustration.png";

/**
 * Download CollegeBook CTA.
 * Clicking opens a modal announcing that mobile apps are coming soon.
 */
const DownloadAppButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
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
              Mobile App Coming Soon
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground pt-1">
              We will launch the mobile app soon!
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border/60 text-sm text-muted-foreground leading-relaxed">
              We are currently focused on delivering the best web experience for CollegeBook.
              Native Android and iOS applications will be available soon.
              Enjoy the web experience :)
            </div>

            <Button
              onClick={() => setOpen(false)}
              className="w-full bg-gradient-hero text-primary-foreground font-semibold"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DownloadAppButton;
