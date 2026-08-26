import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { ShowcaseComment } from "./showcaseTypes";

interface ShowcaseExploreTabProps {
  exploreLiked: boolean;
  setExploreLiked: (val: boolean | ((prev: boolean) => boolean)) => void;
  exploreLikesCount: number;
  setExploreLikesCount: (fn: (c: number) => number) => void;
  snehaLiked: boolean;
  setSnehaLiked: (val: boolean | ((prev: boolean) => boolean)) => void;
  snehaLikesCount: number;
  setSnehaLikesCount: (fn: (c: number) => number) => void;
  devanshLiked: boolean;
  setDevanshLiked: (val: boolean | ((prev: boolean) => boolean)) => void;
  devanshLikesCount: number;
  setDevanshLikesCount: (fn: (c: number) => number) => void;
  savedPosts: Record<string, boolean>;
  toggleSave: (id: string) => void;
  expandedComments: Record<string, boolean>;
  toggleComments: (id: string) => void;
  commentsMap: Record<string, ShowcaseComment[]>;
  commentInputs: Record<string, string>;
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddPreviewComment: (postId: string, e?: React.FormEvent) => void;
  resetScroll: () => void;
}

export const ShowcaseExploreTab: React.FC<ShowcaseExploreTabProps> = ({
  exploreLiked,
  setExploreLiked,
  exploreLikesCount,
  setExploreLikesCount,
  snehaLiked,
  setSnehaLiked,
  snehaLikesCount,
  setSnehaLikesCount,
  devanshLiked,
  setDevanshLiked,
  devanshLikesCount,
  setDevanshLikesCount,
  savedPosts,
  toggleSave,
  expandedComments,
  toggleComments,
  commentsMap,
  commentInputs,
  setCommentInputs,
  handleAddPreviewComment,
  resetScroll,
}) => {
  return (
    <motion.div
      key="explore"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onAnimationStart={resetScroll}
      className="space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0 box-border overflow-hidden"
    >
      {/* Page Header */}
      <div>
        <h3 className="font-heading text-sm sm:text-base font-bold text-foreground truncate">Cross-Campus Explore</h3>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">Discover events, ideas & discussions across all universities</p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full min-w-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          readOnly
          placeholder="Search IIT Bombay, DDU, events, #standup..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-card text-[11px] text-muted-foreground outline-none shadow-xs box-border"
        />
      </div>

      {/* Hashtags */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
        {["#standupcomedy", "#iitbombay", "#campuslife", "#collabhub", "#openmic"].map((tag, idx) => (
          <span
            key={idx}
            className="px-1.5 sm:px-2 py-0.5 rounded-md bg-muted text-[9px] sm:text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Post 1: Jaykrishna • IIT Bombay (with OAT.png) */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 max-w-full box-border overflow-hidden">
        <div className="flex items-start gap-2 pb-2 border-b border-border/60 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
            JK
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground truncate">Jaykrishna</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium shrink-0">
                IIT Bombay
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground truncate">@jaykrishna • Computer Science</div>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-foreground/90 leading-relaxed min-w-0">
          What an incredible Open Mic & Stand-Up Comedy Night here at Open Air Theatre (OAT), IIT Bombay! 🔥 The energy was surreal! 🎙️✨
        </p>

        {/* Media Container with explicit constraints */}
        <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/20 w-full max-w-full min-w-0 box-border">
          <img
            src="/landing/OAT.png"
            alt="Open Air Theatre IIT Bombay"
            className="w-full max-w-full h-36 sm:h-40 object-cover block"
            loading="lazy"
          />
          <div className="p-1.5 bg-muted/40 text-[9px] sm:text-[10px] text-muted-foreground flex items-center justify-between min-w-0">
            <span className="truncate">Open Air Theatre, IIT Bombay</span>
            <span className="text-primary font-semibold shrink-0 ml-1">Mood Indigo 2025</span>
          </div>
        </div>

        <div className="flex gap-1 sm:gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">#standupcomedy</span>
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">#iitbombay</span>
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">#openmic</span>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] sm:text-[11px] text-muted-foreground gap-1 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setExploreLiked(!exploreLiked);
                setExploreLikesCount((c) => (exploreLiked ? c - 1 : c + 1));
              }}
              className={`flex items-center gap-0.5 transition-colors ${exploreLiked ? "text-red-500 font-semibold" : "hover:text-foreground"}`}
            >
              <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${exploreLiked ? "fill-red-500" : ""}`} />
              <span>{exploreLikesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleComments("jaykrishna_post")}
              className={`flex items-center gap-0.5 transition-colors ${expandedComments["jaykrishna_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
            >
              <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{(commentsMap["jaykrishna_post"] || []).length}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSave("jaykrishna_post")}
              className={`flex items-center gap-0.5 transition-colors ${savedPosts["jaykrishna_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
            >
              <Bookmark className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${savedPosts["jaykrishna_post"] ? "fill-primary" : ""}`} />
              <span>{savedPosts["jaykrishna_post"] ? "Saved" : "Save"}</span>
            </button>

            <button
              type="button"
              onClick={() => toast.success("Post link copied to clipboard!")}
              className="flex items-center gap-0.5 hover:text-foreground transition-colors"
            >
              <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Share</span>
            </button>
          </div>

          <span className="text-[9px] sm:text-[10px] text-muted-foreground select-none ml-auto">12m ago</span>
        </div>

        {/* Expandable Comments */}
        {expandedComments["jaykrishna_post"] && (
          <div className="pt-2 border-t border-border/60 space-y-2 min-w-0">
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {(commentsMap["jaykrishna_post"] || []).map((c) => (
                <div key={c.id} className="p-1.5 rounded-lg bg-background/90 border border-border/40 text-[10px] sm:text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 flex-wrap min-w-0">
                      <span className="font-semibold text-foreground truncate">{c.author}</span>
                      <span className="text-[8px] sm:text-[9px] text-muted-foreground font-mono">@{c.handle}</span>
                      {c.college && (
                        <span className="text-[8px] px-1 py-0.2 rounded bg-secondary text-secondary-foreground font-medium">
                          {c.college}
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-muted-foreground select-none shrink-0">{c.time}</span>
                  </div>
                  <p className="text-foreground/90 text-[10px] sm:text-[11px] leading-snug">{c.body}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => handleAddPreviewComment("jaykrishna_post", e)}
              className="flex items-center gap-1 pt-0.5"
            >
              <input
                type="text"
                value={commentInputs["jaykrishna_post"] || ""}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, jaykrishna_post: e.target.value }))}
                placeholder="Write a comment..."
                className="flex-1 px-2 py-1 text-[10px] sm:text-[11px] rounded-lg bg-background border border-border outline-none focus:border-primary box-border"
              />
              <button
                type="submit"
                disabled={!(commentInputs["jaykrishna_post"] || "").trim()}
                className="h-6 px-2 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-0.5 disabled:opacity-50 shrink-0"
              >
                <Send className="w-2.5 h-2.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Post 2: Sneha Rao • IIT Delhi */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 max-w-full box-border overflow-hidden">
        <div className="flex items-start gap-2 pb-2 border-b border-border/60 min-w-0">
          <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[11px] font-bold shrink-0">
            SR
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground truncate">Sneha Rao</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium shrink-0">
                IIT Delhi
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground truncate">@sneharao • Mechanical & Robotics</div>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-foreground/90 leading-relaxed min-w-0">
          Our robotics club qualified for the International Autonomous Drone Competition! Looking for ROS2 simulation collaborators on Collab Hub.
        </p>

        <div className="flex gap-1 sm:gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[9px] sm:text-[10px] font-medium">#robotics</span>
          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[9px] sm:text-[10px] font-medium">#iitdelhi</span>
          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[9px] sm:text-[10px] font-medium">#collabhub</span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] sm:text-[11px] text-muted-foreground gap-1 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSnehaLiked(!snehaLiked);
                setSnehaLikesCount((c) => (snehaLiked ? c - 1 : c + 1));
              }}
              className={`flex items-center gap-0.5 transition-colors ${snehaLiked ? "text-red-500 font-semibold" : "hover:text-foreground"}`}
            >
              <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${snehaLiked ? "fill-red-500" : ""}`} />
              <span>{snehaLikesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSave("sneha_post")}
              className={`flex items-center gap-0.5 transition-colors ${savedPosts["sneha_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
            >
              <Bookmark className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${savedPosts["sneha_post"] ? "fill-primary" : ""}`} />
              <span>{savedPosts["sneha_post"] ? "Saved" : "Save"}</span>
            </button>

            <button
              type="button"
              onClick={() => toast.success("Post link copied to clipboard!")}
              className="flex items-center gap-0.5 hover:text-foreground transition-colors"
            >
              <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Share</span>
            </button>
          </div>

          <span className="text-[9px] sm:text-[10px] text-muted-foreground select-none ml-auto">2h ago</span>
        </div>
      </div>

      {/* Post 3: Devansh Pathak • BITS Pilani */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 max-w-full box-border overflow-hidden">
        <div className="flex items-start gap-2 pb-2 border-b border-border/60 min-w-0">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[11px] font-bold shrink-0">
            DP
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground truncate">Devansh Pathak</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium shrink-0">
                BITS Pilani
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground truncate">@devansh • Computer Science</div>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-foreground/90 leading-relaxed min-w-0">
          Just published our open-source AI campus note-summarizer repo on Collab Hub! Looking for 2 React & FastAPI contributors across universities. 💻🚀
        </p>

        <div className="flex gap-1 sm:gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">#opensource</span>
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">#bitspilani</span>
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">#collabhub</span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] sm:text-[11px] text-muted-foreground gap-1 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDevanshLiked(!devanshLiked);
                setDevanshLikesCount((c) => (devanshLiked ? c - 1 : c + 1));
              }}
              className={`flex items-center gap-0.5 transition-colors ${devanshLiked ? "text-red-500 font-semibold" : "hover:text-foreground"}`}
            >
              <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${devanshLiked ? "fill-red-500" : ""}`} />
              <span>{devanshLikesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSave("devansh_post")}
              className={`flex items-center gap-0.5 transition-colors ${savedPosts["devansh_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
            >
              <Bookmark className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${savedPosts["devansh_post"] ? "fill-primary" : ""}`} />
              <span>{savedPosts["devansh_post"] ? "Saved" : "Save"}</span>
            </button>

            <button
              type="button"
              onClick={() => toast.success("Post link copied to clipboard!")}
              className="flex items-center gap-0.5 hover:text-foreground transition-colors"
            >
              <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Share</span>
            </button>
          </div>

          <span className="text-[9px] sm:text-[10px] text-muted-foreground select-none ml-auto">4h ago</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ShowcaseExploreTab;
