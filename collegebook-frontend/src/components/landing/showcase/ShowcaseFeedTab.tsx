import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Building2,
  Globe2,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Send,
  Sparkles,
  Image as ImageIcon,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { ShowcaseComment } from "./showcaseTypes";

interface ShowcaseFeedTabProps {
  feedMode: "campus" | "global";
  setFeedMode: (mode: "campus" | "global") => void;
  allowComments: boolean;
  setAllowComments: (val: boolean | ((prev: boolean) => boolean)) => void;
  feedLiked: boolean;
  setFeedLiked: (val: boolean | ((prev: boolean) => boolean)) => void;
  feedLikesCount: number;
  setFeedLikesCount: (fn: (c: number) => number) => void;
  ronakLiked: boolean;
  setRonakLiked: (val: boolean | ((prev: boolean) => boolean)) => void;
  ronakLikesCount: number;
  setRonakLikesCount: (fn: (c: number) => number) => void;
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

export const ShowcaseFeedTab: React.FC<ShowcaseFeedTabProps> = ({
  feedMode,
  setFeedMode,
  allowComments,
  setAllowComments,
  feedLiked,
  setFeedLiked,
  feedLikesCount,
  setFeedLikesCount,
  ronakLiked,
  setRonakLiked,
  ronakLikesCount,
  setRonakLikesCount,
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
      key="feed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onAnimationStart={resetScroll}
      className="space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0 box-border overflow-hidden"
    >
      {/* Page Header */}
      <div>
        <h3 className="font-heading text-sm sm:text-base font-bold text-foreground truncate">Campus Feed</h3>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">What's happening at Dharmsinh Desai University</p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full min-w-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          readOnly
          placeholder="Search posts, people, #hashtags..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-card text-[11px] text-muted-foreground outline-none shadow-xs box-border"
        />
      </div>

      {/* Hashtag Filter Pills */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
        {["#campus", "#student", "#university", "#collaboration", "#mycon"].map((tag, idx) => (
          <span
            key={idx}
            className="px-1.5 sm:px-2 py-0.5 rounded-md bg-muted text-[9px] sm:text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Post Creator Box */}
      <div className="rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-xs space-y-2 w-full min-w-0 box-border overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-[9px] font-bold shrink-0">
            VC
          </div>
          <div className="flex-1 min-w-0 text-[10px] sm:text-[11px] text-muted-foreground/80 bg-muted/40 hover:bg-muted/60 rounded-lg px-2.5 py-1 border border-border/50 transition-colors cursor-pointer truncate">
            Share an idea, fun, or opportunity...
          </div>
        </div>

        <div className="pt-1.5 border-t border-border/50 flex flex-col gap-1.5 min-w-0">
          {/* Sub-row 1: Quick Attachments */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground px-0.5 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => toast.info("Attach photos & videos in the full app!")}
                className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
              >
                <ImageIcon className="h-3 w-3 text-primary/80" />
                <span className="font-medium">Media</span>
              </button>
              <button
                type="button"
                onClick={() => toast.info("Add hashtags to categorize your post!")}
                className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
              >
                <Hash className="h-3 w-3 text-primary/80" />
                <span className="font-medium">Tag</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setAllowComments((prev: boolean) => !prev);
                toast.info(!allowComments ? "Comments enabled for new post" : "Comments turned off for new post");
              }}
              className={`flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                allowComments ? "text-primary font-medium" : "text-muted-foreground line-through opacity-70"
              }`}
              title={allowComments ? "Comments: On" : "Comments: Off"}
            >
              <MessageSquare className="h-3 w-3" />
              <span className="truncate">Comments: {allowComments ? "On" : "Off"}</span>
            </button>
          </div>

          {/* Sub-row 2: Scope Selector + Post Button */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border/30 min-w-0">
            <div className="inline-flex items-center bg-muted/80 p-0.5 rounded-md border border-border/50 shrink-0">
              <button
                type="button"
                onClick={() => setFeedMode("campus")}
                className={`px-2 py-0.5 rounded text-[9px] font-semibold transition-all flex items-center gap-1 ${
                  feedMode === "campus"
                    ? "bg-background text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-2.5 w-2.5" /> Campus
              </button>
              <button
                type="button"
                onClick={() => setFeedMode("global")}
                className={`px-2 py-0.5 rounded text-[9px] font-semibold transition-all flex items-center gap-1 ${
                  feedMode === "global"
                    ? "bg-background text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe2 className="h-2.5 w-2.5" /> Global
              </button>
            </div>

            <button
              type="button"
              onClick={() => toast.success("Draft preview post created! Join CollegeBook to share with your peers.")}
              className="h-6 px-2.5 rounded-md bg-gradient-hero text-primary-foreground text-[10px] font-bold shadow-xs hover:opacity-95 transition-opacity flex items-center gap-1 shrink-0"
            >
              <Sparkles className="h-2.5 w-2.5" /> Post
            </button>
          </div>
        </div>
      </div>

      {/* Post 1: Vatsal Chandrani */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 max-w-full box-border overflow-hidden">
        <div className="flex items-start gap-2 pb-2 border-b border-border/60 min-w-0">
          <div className="h-8 w-8 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-[11px] font-bold shrink-0">
            VC
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground truncate">Vatsal Chandrani</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">
                Founder
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground truncate">@vatsalchandrani • Dharmsinh Desai University</div>
          </div>
        </div>

        <div className="space-y-1.5 text-[11px] sm:text-xs text-foreground/90 leading-relaxed min-w-0">
          <p>
            Welcome to CollegeBook! 🎉 Designed specifically for college students to share insights, find teammates, and build real portfolio connections across universities.
          </p>
          <p>
            Check out Collab Hub to partner on hackathons, find co-founders, and verify your skills with myCon badges. Let's make campus collaboration effortless! 🚀
          </p>
        </div>

        <div className="flex gap-1 sm:gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">#welcome</span>
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">#campuslife</span>
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">#collegebook</span>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] sm:text-[11px] text-muted-foreground gap-1 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFeedLiked(!feedLiked);
                setFeedLikesCount((c) => (feedLiked ? c - 1 : c + 1));
              }}
              className={`flex items-center gap-0.5 transition-colors ${feedLiked ? "text-red-500 font-semibold" : "hover:text-foreground"}`}
            >
              <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${feedLiked ? "fill-red-500" : ""}`} />
              <span>{feedLikesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleComments("vatsal_post")}
              className={`flex items-center gap-0.5 transition-colors ${expandedComments["vatsal_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
            >
              <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{(commentsMap["vatsal_post"] || []).length}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSave("vatsal_post")}
              className={`flex items-center gap-0.5 transition-colors ${savedPosts["vatsal_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
            >
              <Bookmark className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${savedPosts["vatsal_post"] ? "fill-primary" : ""}`} />
              <span>{savedPosts["vatsal_post"] ? "Saved" : "Save"}</span>
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

          <span className="text-[9px] sm:text-[10px] text-muted-foreground select-none ml-auto">Just now</span>
        </div>

        {/* Expandable Comments Drawer */}
        {expandedComments["vatsal_post"] && (
          <div className="pt-2 border-t border-border/60 space-y-2 min-w-0">
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {(commentsMap["vatsal_post"] || []).map((c) => (
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
              onSubmit={(e) => handleAddPreviewComment("vatsal_post", e)}
              className="flex items-center gap-1 pt-0.5"
            >
              <input
                type="text"
                value={commentInputs["vatsal_post"] || ""}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, vatsal_post: e.target.value }))}
                placeholder="Write a comment..."
                className="flex-1 px-2 py-1 text-[10px] sm:text-[11px] rounded-lg bg-background border border-border outline-none focus:border-primary box-border"
              />
              <button
                type="submit"
                disabled={!(commentInputs["vatsal_post"] || "").trim()}
                className="h-6 px-2 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-0.5 disabled:opacity-50 shrink-0"
              >
                <Send className="w-2.5 h-2.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Post 2: Ronak Patel */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2 w-full min-w-0 max-w-full box-border overflow-hidden">
        <div className="flex items-start gap-2 pb-2 border-b border-border/60 min-w-0">
          <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[11px] font-bold shrink-0">
            RP
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground truncate">Ronak Patel</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium shrink-0">
                Student
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground truncate">@ronakpatel • IT • 3rd Year</div>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-foreground/90 leading-relaxed min-w-0">
          Our hackathon team just finished building the prototype for Smart Campus Navigation! Looking for 1 UI/UX designer on Collab Hub. 💻🔥
        </p>

        <div className="flex gap-1 sm:gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[9px] sm:text-[10px] font-medium">#hackathon</span>
          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[9px] sm:text-[10px] font-medium">#smartcampus</span>
          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[9px] sm:text-[10px] font-medium">#hiring</span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] sm:text-[11px] text-muted-foreground gap-1 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRonakLiked(!ronakLiked);
                setRonakLikesCount((c) => (ronakLiked ? c - 1 : c + 1));
              }}
              className={`flex items-center gap-0.5 transition-colors ${ronakLiked ? "text-red-500 font-semibold" : "hover:text-foreground"}`}
            >
              <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${ronakLiked ? "fill-red-500" : ""}`} />
              <span>{ronakLikesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleComments("ronak_post")}
              className={`flex items-center gap-0.5 transition-colors ${expandedComments["ronak_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
            >
              <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{(commentsMap["ronak_post"] || []).length}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSave("ronak_post")}
              className={`flex items-center gap-0.5 transition-colors ${savedPosts["ronak_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
            >
              <Bookmark className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${savedPosts["ronak_post"] ? "fill-primary" : ""}`} />
              <span>{savedPosts["ronak_post"] ? "Saved" : "Save"}</span>
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

          <span className="text-[9px] sm:text-[10px] text-muted-foreground select-none ml-auto">1h ago</span>
        </div>

        {/* Expandable Comments Drawer */}
        {expandedComments["ronak_post"] && (
          <div className="pt-2 border-t border-border/60 space-y-2 min-w-0">
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {(commentsMap["ronak_post"] || []).map((c) => (
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
              onSubmit={(e) => handleAddPreviewComment("ronak_post", e)}
              className="flex items-center gap-1 pt-0.5"
            >
              <input
                type="text"
                value={commentInputs["ronak_post"] || ""}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, ronak_post: e.target.value }))}
                placeholder="Write a comment..."
                className="flex-1 px-2 py-1 text-[10px] sm:text-[11px] rounded-lg bg-background border border-border outline-none focus:border-primary box-border"
              />
              <button
                type="submit"
                disabled={!(commentInputs["ronak_post"] || "").trim()}
                className="h-6 px-2 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-0.5 disabled:opacity-50 shrink-0"
              >
                <Send className="w-2.5 h-2.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShowcaseFeedTab;
