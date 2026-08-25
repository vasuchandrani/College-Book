import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Send, Trash2, MessageSquare, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormattedContent } from "@/components/FormattedContent";
import { ThemedLoader } from "@/components/ThemedLoader";
import { getComments, addComment, deleteComment } from "@/lib/api";
import { formatSmartDate } from "@/lib/dateUtils";
import type { FeedPost, ExplorePost, PostComment } from "@/types";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface InlineCommentsSectionProps {
  post: FeedPost | ExplorePost;
  onCommentCountChange?: (newCount: number) => void;
  onClose?: () => void;
}

export const InlineCommentsSection: React.FC<InlineCommentsSectionProps> = ({
  post,
  onCommentCountChange,
  onClose,
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const currentUser = JSON.parse(
    localStorage.getItem("cb_user") || '{"name":"You","initials":"YO"}'
  );

  const isCommentsEnabled = post.commentsEnabled !== false;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setComments([]);

    getComments(post.id)
      .then((data) => {
        if (alive) {
          setComments(data || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load comments:", err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [post.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Instant Optimistic Comment Posting (0ms perceived latency)
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!body.trim() || !isCommentsEnabled) return;

    const trimmedBody = body.trim();
    const tempId = "temp-" + Date.now();

    const optimisticComment: PostComment = {
      id: tempId,
      postId: post.id,
      author: currentUser.name || "You",
      authorHandle: currentUser.handle || currentUser.username,
      avatarUrl: currentUser.avatarUrl,
      initials: currentUser.initials || "YO",
      collegeName: currentUser.collegeName,
      collegeShortName: currentUser.collegeShortName,
      body: trimmedBody,
      time: "Just now",
      createdAt: new Date().toISOString(),
    };

    // 1. Instantly render to screen (0ms)
    setComments((prev) => [...prev, optimisticComment]);
    setBody("");
    scrollToBottom();

    const prevCount = post.commentsCount || comments.length;
    const newCount = prevCount + 1;
    if (onCommentCountChange) {
      onCommentCountChange(newCount);
    }

    // 2. Perform API call in background
    try {
      const realComment = await addComment({
        postId: post.id,
        body: trimmedBody,
      });

      // Replace temp ID with real DB response silently
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? realComment : c))
      );
    } catch (err: any) {
      // Rollback optimistic update on network failure
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      if (onCommentCountChange) {
        onCommentCountChange(prevCount);
      }
      toast.error(err.message || "Failed to add comment");
    }
  };

  // Instant Optimistic Comment Deletion (0ms perceived latency)
  const handleDeleteComment = async (commentId: string) => {
    const commentToDelete = comments.find((c) => c.id === commentId);
    if (!commentToDelete) return;

    // 1. Instantly remove from screen (0ms)
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    const prevCount = post.commentsCount || comments.length;
    const newCount = Math.max(0, prevCount - 1);
    if (onCommentCountChange) {
      onCommentCountChange(newCount);
    }
    toast.success("Comment deleted");

    // 2. Perform API call in background
    try {
      await deleteComment(post.id, commentId);
    } catch (err: any) {
      // Rollback on network failure
      setComments((prev) => [...prev, commentToDelete]);
      if (onCommentCountChange) {
        onCommentCountChange(prevCount);
      }
      toast.error(err.message || "Failed to delete comment");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden mt-3 pt-3 border-t border-border/60"
    >
      <div className="bg-muted/20 rounded-2xl p-3 sm:p-4 border border-border/50 space-y-3">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span>Comments</span>
            <span className="text-[11px] text-muted-foreground font-normal">
              ({comments.length})
            </span>
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 -mr-1"
            >
              <span>Hide</span>
              <ChevronUp className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Scrollable Comment Stream */}
        <div className="max-h-[280px] sm:max-h-[340px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {loading ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2">
              <ThemedLoader size="sm" />
              <p className="text-[11px] text-muted-foreground">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-6 text-center space-y-1 bg-background/50 rounded-xl border border-dashed border-border/50">
              <p className="text-xs font-medium text-foreground">No comments yet</p>
              <p className="text-[11px] text-muted-foreground">
                {isCommentsEnabled
                  ? "Be the first to share your thoughts!"
                  : "Comments are disabled on this post."}
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isAuthor =
                currentUser &&
                ((currentUser.id && currentUser.id === comment.authorId) ||
                  (currentUser.handle &&
                    comment.authorHandle &&
                    currentUser.handle.replace(/^@/, "").toLowerCase() ===
                      comment.authorHandle.replace(/^@/, "").toLowerCase()) ||
                  (currentUser.name &&
                    comment.author &&
                    currentUser.name === comment.author));

              return (
                <div
                  key={comment.id}
                  className="flex items-start gap-2.5 group animate-in fade-in-50 duration-200"
                >
                  <Link
                    to={comment.authorHandle ? `/student/${comment.authorHandle}` : "#"}
                    className="shrink-0 transition-transform active:scale-95 mt-0.5"
                  >
                    <Avatar className="h-7 w-7 border border-border">
                      {comment.avatarUrl ? (
                        <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                      ) : (
                        <AvatarFallback className="text-[10px] bg-gradient-hero text-primary-foreground font-semibold">
                          {comment.initials || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Link>

                  {/* Comment Bubble with top-right timestamp and bottom-right delete button */}
                  <div className="relative flex-1 min-w-0 bg-background/80 hover:bg-background transition-colors rounded-xl px-3 py-2 border border-border/40 shadow-2xs">
                    {/* Top Row: Author on Left, Time in Top-Right Corner */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <Link
                          to={comment.authorHandle ? `/student/${comment.authorHandle}` : "#"}
                          className="text-xs font-semibold text-foreground hover:text-primary transition-colors truncate"
                        >
                          {comment.author}
                        </Link>
                        {comment.authorHandle && (
                          <Link
                            to={`/student/${comment.authorHandle}`}
                            className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-mono"
                          >
                            @{comment.authorHandle}
                          </Link>
                        )}
                        {(comment.collegeShortName || comment.collegeName) && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-secondary text-secondary-foreground font-medium">
                            {comment.collegeShortName || comment.collegeName}
                          </span>
                        )}
                      </div>

                      {/* Time placed cleanly in the top-right corner */}
                      <span className="text-[10px] text-muted-foreground shrink-0 select-none">
                        {formatSmartDate(comment.createdAt || comment.time)}
                      </span>
                    </div>

                    {/* Content */}
                    <FormattedContent
                      content={comment.body}
                      className="text-xs leading-relaxed text-foreground"
                    />

                    {/* Delete button positioned at the bottom-right corner */}
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="absolute bottom-1.5 right-1.5 p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Inline Input Box */}
        {isCommentsEnabled ? (
          <form onSubmit={handleAddComment} className="space-y-1.5 pt-1">
            <div className="relative flex items-end gap-2 bg-background border border-border rounded-xl p-1.5 focus-within:border-primary/60 transition-colors shadow-2xs">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a comment..."
                rows={1}
                maxLength={1000}
                className="min-h-[38px] max-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 text-xs px-2 py-1 bg-transparent"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!body.trim()}
                className="h-8 px-3 rounded-lg shrink-0 gap-1 font-medium text-xs shadow-xs bg-gradient-hero text-primary-foreground"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center justify-end text-[10px] text-muted-foreground px-1">
              <span>{body.length}/1000</span>
            </div>
          </form>
        ) : (
          <div className="py-2 text-center text-xs text-muted-foreground bg-background/50 rounded-xl border border-border/40">
            Comments are turned off for this post by the author.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InlineCommentsSection;
