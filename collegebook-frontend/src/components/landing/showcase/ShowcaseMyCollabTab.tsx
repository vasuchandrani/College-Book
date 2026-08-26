import React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Users,
  Inbox,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MyCollabSubTab } from "./showcaseTypes";

interface ShowcaseMyCollabTabProps {
  myCollabSubTab: MyCollabSubTab;
  handleMyCollabSubTabChange: (tab: MyCollabSubTab) => void;
  incomingAccepted: boolean | null;
  setIncomingAccepted: (val: boolean | null | ((prev: boolean | null) => boolean | null)) => void;
  resetScroll: () => void;
}

export const ShowcaseMyCollabTab: React.FC<ShowcaseMyCollabTabProps> = ({
  myCollabSubTab,
  handleMyCollabSubTabChange,
  incomingAccepted,
  setIncomingAccepted,
  resetScroll,
}) => {
  return (
    <motion.div
      key="my_collab"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onAnimationStart={resetScroll}
      className="space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0 box-border overflow-hidden"
    >
      <div>
        <h3 className="font-heading text-sm sm:text-base font-bold text-foreground truncate">My Collaboration</h3>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">Manage teams, track applications & review applicants</p>
      </div>

      {/* 3 Sub-Tabs */}
      <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-xl bg-muted/60 border border-border/60 text-xs min-w-0">
        <button
          type="button"
          onClick={() => handleMyCollabSubTabChange("created")}
          className={`flex-1 py-1 px-1 rounded-lg text-[9px] sm:text-[10px] font-semibold transition-all flex items-center justify-center gap-1 truncate ${
            myCollabSubTab === "created"
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> <span className="truncate">Created (2)</span>
        </button>
        <button
          type="button"
          onClick={() => handleMyCollabSubTabChange("my_requests")}
          className={`flex-1 py-1 px-1 rounded-lg text-[9px] sm:text-[10px] font-semibold transition-all flex items-center justify-center gap-1 truncate ${
            myCollabSubTab === "my_requests"
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> <span className="truncate">Sent (1)</span>
        </button>
        <button
          type="button"
          onClick={() => handleMyCollabSubTabChange("incoming")}
          className={`flex-1 py-1 px-1 rounded-lg text-[9px] sm:text-[10px] font-semibold transition-all flex items-center justify-center gap-1 truncate ${
            myCollabSubTab === "incoming"
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Inbox className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> <span className="truncate">Incoming (2)</span>
        </button>
      </div>

      {/* Sub-tab 1: Created Teams */}
      {myCollabSubTab === "created" && (
        <div className="space-y-2 min-w-0">
          {/* Card 1: CityStore */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
            <div className="flex items-center justify-between min-w-0">
              <span className="text-xs font-bold text-foreground truncate">CityStore Platform</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">
                Open Source
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed min-w-0">
              CityStore local business discovery platform for colleges and towns.
            </p>
            <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] min-w-0">
              <span className="text-muted-foreground truncate">Lead: You</span>
              <button
                type="button"
                onClick={() => toast.info("Manage team members and GitHub link in full app!")}
                className="text-primary font-semibold hover:underline shrink-0 ml-1"
              >
                Manage Team →
              </button>
            </div>
          </div>

          {/* Card 2: SIH 2025 AI Bot */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
            <div className="flex items-center justify-between min-w-0">
              <span className="text-xs font-bold text-foreground truncate">Smart Campus Bot</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold shrink-0">
                Hackathon Team
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground min-w-0">
              <span>Hiring: Frontend & UI/UX</span>
              <span className="font-semibold text-foreground shrink-0 ml-1">2/4 Members</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] min-w-0">
              <span className="text-muted-foreground truncate">2 pending requests</span>
              <button
                type="button"
                onClick={() => handleMyCollabSubTabChange("incoming")}
                className="text-primary font-semibold hover:underline shrink-0 ml-1"
              >
                View Requests (2) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Sent Requests */}
      {myCollabSubTab === "my_requests" && (
        <div className="space-y-2 min-w-0">
          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
            <div className="flex items-center justify-between min-w-0">
              <span className="text-xs font-bold text-foreground truncate">EcoTrack Energy</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium flex items-center gap-1 shrink-0">
                <Clock className="h-2.5 w-2.5" /> Pending
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground min-w-0">
              Applied as: <strong className="text-foreground">ML Engineer</strong>
            </p>
            <div className="p-2 rounded-lg bg-muted/40 text-[10px] text-foreground/80 italic min-w-0">
              "Experience with PyTorch, time-series forecasting, and smart meter datasets."
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] text-muted-foreground min-w-0">
              <span className="truncate">Sent to @aryan_gupta</span>
              <span className="text-[9px] shrink-0 ml-1">Today</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Incoming Join Requests */}
      {myCollabSubTab === "incoming" && (
        <div className="space-y-2 min-w-0">
          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
            <div className="flex items-start justify-between gap-1 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-foreground truncate">Sneha Rao</span>
                  <span className="text-[8px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium shrink-0">
                    IIT Delhi
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">Applied for: Frontend Dev (Smart Campus Bot)</div>
              </div>
              <div className="flex items-center gap-0.5 text-[9px] text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                <Shield className="h-2.5 w-2.5" /> myCon Verified
              </div>
            </div>

            <div className="p-2 rounded-lg bg-muted/40 text-[10px] text-foreground/80 min-w-0">
              "Hey Vatsal, built 3 React production apps and won HackX last semester!"
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-border/60 min-w-0">
              {incomingAccepted === null && (
                <div className="flex items-center gap-1.5 w-full justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIncomingAccepted(false);
                      toast.error("Candidate request rejected");
                    }}
                    className="h-6 px-2 rounded-md bg-muted text-muted-foreground hover:text-foreground text-[10px] font-semibold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIncomingAccepted(true);
                      toast.success("Sneha Rao accepted into Smart Campus Bot!");
                    }}
                    className="h-6 px-2.5 rounded-md bg-gradient-hero text-primary-foreground text-[10px] font-bold shadow-xs hover:opacity-95 transition-opacity"
                  >
                    Accept Candidate
                  </button>
                </div>
              )}

              {incomingAccepted === true && (
                <div className="flex items-center justify-between w-full text-[10px] text-emerald-600 font-semibold min-w-0">
                  <span className="flex items-center gap-1 truncate"><CheckCircle2 className="h-3 w-3 shrink-0" /> Accepted & Added to Team</span>
                  <button
                    type="button"
                    onClick={() => setIncomingAccepted(null)}
                    className="text-[9px] text-muted-foreground hover:underline shrink-0 ml-1"
                  >
                    Undo
                  </button>
                </div>
              )}

              {incomingAccepted === false && (
                <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground font-semibold min-w-0">
                  <span className="flex items-center gap-1 text-destructive truncate"><XCircle className="h-3 w-3 shrink-0" /> Application Rejected</span>
                  <button
                    type="button"
                    onClick={() => setIncomingAccepted(null)}
                    className="text-[9px] text-primary hover:underline shrink-0 ml-1"
                  >
                    Undo Rejection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ShowcaseMyCollabTab;
