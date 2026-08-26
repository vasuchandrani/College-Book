import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Award,
  Globe,
  Github,
  Mail,
  CheckCircle2,
  ExternalLink,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

interface ShowcaseProfileTabProps {
  resetScroll: () => void;
}

export const ShowcaseProfileTab: React.FC<ShowcaseProfileTabProps> = ({ resetScroll }) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onAnimationStart={resetScroll}
      className="space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0 box-border overflow-hidden"
    >
      <div>
        <h3 className="font-heading text-sm sm:text-base font-bold text-foreground truncate">Student Profile</h3>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">Verified campus portfolio & myCon credentials</p>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2.5 w-full min-w-0 box-border overflow-hidden">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="h-10 w-10 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            VC
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-foreground truncate">Vatsal Chandrani</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
            </div>
            <div className="text-[10px] text-muted-foreground truncate">@vatsalchandrani • 4th Year</div>
            <div className="text-[9px] text-primary font-medium truncate">Dharmsinh Desai University</div>
          </div>
        </div>

        <p className="text-[10px] sm:text-[11px] text-foreground/90 leading-relaxed min-w-0">
          Founder & Full-Stack Developer @ CollegeBook. Passionate about building seamless campus networking and verified collaboration platforms.
        </p>

        <div className="flex items-center gap-1.5 pt-1 border-t border-border/50 text-[10px] text-muted-foreground flex-wrap min-w-0">
          <span className="font-semibold text-foreground">5</span> Projects
          <span>•</span>
          <span className="font-semibold text-foreground">18</span> Posts
          <span>•</span>
          <span className="font-semibold text-emerald-600">3 myCon Badges</span>
        </div>
      </div>

      {/* myCon Skill Badges */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-1 text-xs font-bold text-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verified myCon Badges</span>
          </div>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold shrink-0">
            Proof Verified
          </span>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 border border-border/40 text-[10px] min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="font-semibold text-foreground truncate">Full Stack Developer</span>
            </div>
            <span className="text-[9px] text-primary font-mono shrink-0 ml-1">Level 3 • 4 Proofs</span>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 border border-border/40 text-[10px] min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Code2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground truncate">React & TypeScript</span>
            </div>
            <span className="text-[9px] text-primary font-mono shrink-0 ml-1">Level 3 • 3 Proofs</span>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 border border-border/40 text-[10px] min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-foreground truncate">PostgreSQL & Cloud</span>
            </div>
            <span className="text-[9px] text-primary font-mono shrink-0 ml-1">Level 2 • 2 Proofs</span>
          </div>
        </div>
      </div>

      {/* Social / Contact Links */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
        <span className="text-xs font-bold text-foreground block">Verified Links & Contacts</span>

        <div className="grid grid-cols-2 gap-1.5 min-w-0">
          <a
            href="https://github.com/vasuchandrani"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/40 hover:bg-muted/70 text-[10px] text-foreground font-medium transition-colors min-w-0"
          >
            <Github className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">vasuchandrani</span>
            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/60 ml-auto shrink-0" />
          </a>

          <a
            href="https://vatsalchandrani.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/40 hover:bg-muted/70 text-[10px] text-foreground font-medium transition-colors min-w-0"
          >
            <Globe className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate">Portfolio</span>
            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/60 ml-auto shrink-0" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ShowcaseProfileTab;
