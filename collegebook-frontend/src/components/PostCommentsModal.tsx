import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Send, Lock, Trash2, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormattedContent } from "@/components/FormattedContent";
import { ThemedLoader } from "@/components/ThemedLoader";
import { getComments, addComment, deleteComment } from "@/lib/api";
import type { FeedPost, ExplorePost, PostComment } from "@/types";
import { toast } from "sonner";

interface PostCommentsModalProps {
  post: FeedPost | ExplorePost | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: (postId: string | number, newCount: number) => void;
}

export const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  post,
  isOpen,
  onClose,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const currentUser = JSON.parse(
    localStorage.getItem("cb_user") || '{"name":"You","initials":"YO"}'
  );

  const isCommentsEnabled = post ? post.commentsEnabled !== false : true;

  useEffect(() => {
    if (!isOpen || !post) return;

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
  }, [isOpen, post]);

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Instant Optimistic Comment Submission (0ms perceived latency)
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!post || !body.trim() || !isCommentsEnabled) return;

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
    if (onCommentAdded) {
      onCommentAdded(post.id, newCount);
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
      if (onCommentAdded) {
        onCommentAdded(post.id, prevCount);
      }
      toast.error(err.message || "Failed to add comment");
    }
  };

  // Instant Optimistic Comment Deletion (0ms perceived latency)
  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;

    const commentToDelete = comments.find((c) => c.id === commentId);
    if (!commentToDelete) return;

    // 1. Instantly remove from screen (0ms)
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    const prevCount = post.commentsCount || comments.length;
    const newCount = Math.max(0, prevCount - 1);
    if (onCommentAdded) {
      onCommentAdded(post.id, newCount);
    }
    toast.success("Comment deleted");

    // 2. Perform API call in background
    try {
      await deleteComment(post.id, commentId);
    } catch (err: any) {
      // Rollback on network failure
      setComments((prev) => [...prev, commentToDelete]);
      if (onCommentAdded) {
        onCommentAdded(post.id, prevCount);
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

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-border/80 bg-muted/20 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold font-heading text-foreground">
                Comments
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {comments.length} {comments.length === 1 ? "comment" : "comments"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Post Brief Snippet */}
        <div className="px-5 py-3 bg-muted/40 border-b border-border/60 text-xs text-muted-foreground flex items-center gap-2.5">
          <Avatar className="h-6 w-6 border border-border shrink-0">
            {post.avatarUrl ? (
              <AvatarImage src={post.avatarUrl} alt={post.author} />
            ) : (
              <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                {post.initials || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1 truncate">
            <span className="font-semibold text-foreground">{post.author}</span>
            {post.authorHandle && (
              <span className="text-muted-foreground ml-1">@{post.authorHandle}</span>
            )}
            : <span className="italic text-foreground/80">{post.content?.slice(0, 70)}...</span>
          </div>
        </div>

        {/* Comments Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 min-h-[220px] max-h-[400px]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <ThemedLoader size="md" />
              <p className="text-xs text-muted-foreground">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {isCommentsEnabled
                  ? "Be the first to share your thoughts on this post!"
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
                  className="flex items-start gap-3 group animate-in fade-in-50 duration-200"
                >
                  <Link
                    to={comment.authorHandle ? `/student/${comment.authorHandle}` : "#"}
                    className="shrink-0 transition-transform active:scale-95"
                  >
                    <Avatar className="h-8 w-8 border border-border">
                      {comment.avatarUrl ? (
                        <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                      ) : (
                        <AvatarFallback className="text-xs bg-gradient-hero text-primary-foreground font-semibold">
                          {comment.initials || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Link>

                  <div className="relative flex-1 min-w-0 bg-muted/40 hover:bg-muted/60 transition-colors rounded-2xl px-3.5 py-2.5 border border-border/40">
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
                            className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-mono"
                          >
                            @{comment.authorHandle}
                          </Link>
                        )}
                        {(comment.collegeShortName || comment.collegeName) && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary text-secondary-foreground font-medium">
                            {comment.collegeShortName || comment.collegeName}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-muted-foreground shrink-0 select-none">
                        {comment.time}
                      </span>
                    </div>

                    <FormattedContent
                      content={comment.body}
                      className="text-xs leading-relaxed text-foreground"
                    />

                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="absolute bottom-2 right-2 p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Footer Input or Disabled Notice */}
        <div className="p-3 md:p-4 border-t border-border/80 bg-background/95 backdrop-blur">
          {isCommentsEnabled ? (
            <form onSubmit={handleAddComment} className="space-y-2">
              <div className="relative flex items-end gap-2 bg-muted/30 border border-border rounded-xl p-1.5 focus-within:border-primary/60 transition-colors">
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a comment..."
                  rows={2}
                  maxLength={1000}
                  className="min-h-[44px] max-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 text-xs px-2.5 py-1.5 bg-transparent"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!body.trim()}
                  className="h-9 px-3.5 rounded-lg shrink-0 gap-1.5 font-medium text-xs shadow-sm bg-gradient-hero text-primary-foreground"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex items-center justify-end text-[11px] text-muted-foreground px-1">
                <span className="text-[10px]">{body.length}/1000</span>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground bg-muted/40 rounded-xl border border-border/50">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Comments are disabled for this post by the author.</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostCommentsModal;
