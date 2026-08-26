import React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Rocket,
  Users,
  Star,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { CollabSubTab } from "./showcaseTypes";

interface ShowcaseCollabTabProps {
  collabSubTab: CollabSubTab;
  handleCollabSubTabChange: (tab: CollabSubTab) => void;
  starredProjects: Record<string, boolean>;
  toggleStar: (id: string) => void;
  joinedTeams: Record<string, boolean>;
  setJoinedTeams: (val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  resetScroll: () => void;
}

export const ShowcaseCollabTab: React.FC<ShowcaseCollabTabProps> = ({
  collabSubTab,
  handleCollabSubTabChange,
  starredProjects,
  toggleStar,
  joinedTeams,
  setJoinedTeams,
  resetScroll,
}) => {
  return (
    <motion.div
      key="collab"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onAnimationStart={resetScroll}
      className="space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0 box-border overflow-hidden"
    >
      <div>
        <h3 className="font-heading text-sm sm:text-base font-bold text-foreground truncate">Collab Hub</h3>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">Discover open-source repos and assemble teams</p>
      </div>

      {/* 3 Sub-Tabs */}
      <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-xl bg-muted/60 border border-border/60 text-xs min-w-0">
        <button
          type="button"
          onClick={() => handleCollabSubTabChange("open_source")}
          className={`flex-1 py-1 px-1 rounded-lg text-[9px] sm:text-[10px] font-semibold transition-all flex items-center justify-center gap-1 truncate ${
            collabSubTab === "open_source"
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> <span className="truncate">Open Source</span>
        </button>
        <button
          type="button"
          onClick={() => handleCollabSubTabChange("hackathon")}
          className={`flex-1 py-1 px-1 rounded-lg text-[9px] sm:text-[10px] font-semibold transition-all flex items-center justify-center gap-1 truncate ${
            collabSubTab === "hackathon"
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Rocket className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> <span className="truncate">Hackathons</span>
        </button>
        <button
          type="button"
          onClick={() => handleCollabSubTabChange("project")}
          className={`flex-1 py-1 px-1 rounded-lg text-[9px] sm:text-[10px] font-semibold transition-all flex items-center justify-center gap-1 truncate ${
            collabSubTab === "project"
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> <span className="truncate">Projects</span>
        </button>
      </div>

      {/* Sub-tab 1: Open Source */}
      {collabSubTab === "open_source" && (
        <div className="space-y-2 min-w-0">
          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
            <div className="flex items-center justify-between min-w-0">
              <span className="text-xs font-bold text-foreground truncate">CityStore Platform</span>
              <button
                type="button"
                onClick={() => toggleStar("city_store")}
                className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold transition-colors shrink-0 ${
                  starredProjects["city_store"]
                    ? "bg-amber-500/15 text-amber-600 border border-amber-500/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Star className={`h-3 w-3 ${starredProjects["city_store"] ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>{starredProjects["city_store"] ? "54" : "53"}</span>
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed min-w-0">
              CityStore is a city-wide store discovery platform bringing local stores onto a single app.
            </p>
            <div className="flex gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">React</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">TypeScript</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">Tailwind</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">Full Stack</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] sm:text-[11px] min-w-0">
              <span className="text-muted-foreground truncate">Lead: @vatsalchandrani</span>
              <a
                href="https://github.com/vasuchandrani/CityStore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold flex items-center gap-1 hover:underline shrink-0 ml-1"
              >
                github.com/CityStore <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
            <div className="flex items-center justify-between min-w-0">
              <span className="text-xs font-bold text-foreground truncate">CampusOS Kernel</span>
              <button
                type="button"
                onClick={() => toggleStar("campus_os")}
                className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold transition-colors shrink-0 ${
                  starredProjects["campus_os"]
                    ? "bg-amber-500/15 text-amber-600 border border-amber-500/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Star className={`h-3 w-3 ${starredProjects["campus_os"] ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>{starredProjects["campus_os"] ? "129" : "128"}</span>
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed min-w-0">
              Educational microkernel operating system written in Rust and C for university OS labs.
            </p>
            <div className="flex gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">Rust</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">C</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">RISC-V</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] sm:text-[11px] min-w-0">
              <span className="text-muted-foreground truncate">Lead: @iitb_systems</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold flex items-center gap-1 hover:underline shrink-0 ml-1"
              >
                github.com/campus-os <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Hackathons */}
      {collabSubTab === "hackathon" && (
        <div className="space-y-2 min-w-0">
          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
            <div className="flex items-center justify-between min-w-0">
              <div>
                <span className="text-xs font-bold text-foreground block truncate">Smart India Hackathon 2025</span>
                <span className="text-[9px] text-primary font-semibold block truncate">Team: EcoTrack Energy</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold shrink-0">
                2/4 Members
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed min-w-0">
              Building an AI-driven smart energy grid anomaly detector for renewable power clusters.
            </p>
            <div>
              <span className="text-[9px] font-semibold text-primary block mb-1">Looking for roles:</span>
              <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">ML Engineer</span>
                <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">FastAPI Dev</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-border/60 min-w-0">
              <span className="text-[10px] text-muted-foreground truncate">Lead: @aryan_gupta</span>
              <button
                type="button"
                onClick={() => {
                  setJoinedTeams((prev) => ({ ...prev, sih_team: !prev.sih_team }));
                  toast.success(joinedTeams["sih_team"] ? "Withdrew join request" : "Join request sent to @aryan_gupta!");
                }}
                className={`h-6 px-2.5 rounded-md text-[10px] font-bold shadow-xs transition-colors shrink-0 ${
                  joinedTeams["sih_team"]
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-gradient-hero text-primary-foreground hover:opacity-95"
                }`}
              >
                {joinedTeams["sih_team"] ? "Request Sent ✓" : "Request to Join"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Projects */}
      {collabSubTab === "project" && (
        <div className="space-y-2 min-w-0">
          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
            <div className="flex items-center justify-between min-w-0">
              <span className="text-xs font-bold text-foreground truncate">AI Campus Buddy</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">
                1/3 Members
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed min-w-0">
              RAG-based conversational AI trained on syllabus notes, timetable, and campus announcements.
            </p>
            <div className="flex gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Python</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">LangChain</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">React</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-border/60 min-w-0">
              <span className="text-[10px] text-muted-foreground truncate">Lead: @priya_sharma</span>
              <button
                type="button"
                onClick={() => {
                  setJoinedTeams((prev) => ({ ...prev, buddy_team: !prev.buddy_team }));
                  toast.success(joinedTeams["buddy_team"] ? "Withdrew join request" : "Join request sent to @priya_sharma!");
                }}
                className={`h-6 px-2.5 rounded-md text-[10px] font-bold shadow-xs transition-colors shrink-0 ${
                  joinedTeams["buddy_team"]
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-gradient-hero text-primary-foreground hover:opacity-95"
                }`}
              >
                {joinedTeams["buddy_team"] ? "Request Sent ✓" : "Request to Join"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ShowcaseCollabTab;
