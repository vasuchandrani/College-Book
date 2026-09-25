import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  FileQuestion,
  MessageSquare,
  Send,
  Lock,
  Trash2,
  MoreHorizontal,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import FormattedContent from "@/components/FormattedContent";
import { PostDetailSkeleton, CommentsSkeleton } from "@/components/Skeletons";
import { formatCount } from "@/lib/formatCount";
import { useDebouncedToggle } from "@/hooks/useDebouncedToggle";
import {
  getPostById,
  likePost as apiLikePost,
  savePost as apiSavePost,
  sharePostLink,
  getComments,
  addComment,
  deleteComment,
  normalizeCourseShort,
  isAuthTokenValid,
  clearAuthSession,
  type FeedPost,
  type PostComment,
} from "@/lib/api";
import { formatSmartDate } from "@/lib/dateUtils";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const token = typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;
  const isAuthenticated = isAuthTokenValid(token);

  const { triggerToggle } = useDebouncedToggle(400);

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const currentUser = JSON.parse(
    localStorage.getItem("cb_user") || '{"name":"You","initials":"YO"}'
  );


  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/feed");
    }
  };

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    getPostById(id)
      .then((data) => {
        if (isMounted) {
          setPost(data);
          // Fetch comments
          setCommentsLoading(true);
          getComments(data.id)
            .then((c) => {
              if (isMounted) setComments(c?.comments || []);
            })
            .catch(() => {})
            .finally(() => {
              if (isMounted) setCommentsLoading(false);
            });
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err?.status === 401 || err?.status === 403) {
            clearAuthSession();
            if (typeof window !== "undefined") {
              sessionStorage.setItem("cb_redirect_url", location.pathname + location.search);
            }
            navigate("/login", { replace: true, state: { from: location } });
            return;
          }
          setError(err?.message || "Post not found or has been removed.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleLike = () => {
    if (!post) return;
    const currentLiked = !!post.liked;

    triggerToggle(
      post.id,
      currentLiked,
      (newLiked) => {
        setPost((prev) =>
          prev
            ? {
                ...prev,
                liked: newLiked,
                likes: newLiked
                  ? prev.liked
                    ? prev.likes
                    : prev.likes + 1
                  : prev.liked
                  ? Math.max(0, prev.likes - 1)
                  : prev.likes,
              }
            : null
        );
      },
      (signal) => apiLikePost(post.id, signal)
    );
  };

  const toggleSave = () => {
    if (!post) return;
    const currentSaved = !!post.saved;

    triggerToggle(
      post.id,
      currentSaved,
      (newSaved) => {
        setPost((prev) =>
          prev
            ? {
                ...prev,
                saved: newSaved,
              }
            : null
        );
      },
      (signal) => apiSavePost(post.id, signal)
    );
  };

  const handleShare = async () => {
    if (!post) return;
    await sharePostLink(post.id);
    toast.success("Post link copied to clipboard!");
  };

  // Instant Optimistic Comment Posting (0ms perceived latency)
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!post || !commentBody.trim() || post.commentsEnabled === false) return;

    const trimmed = commentBody.trim();
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
      body: trimmed,
      time: "Just now",
      createdAt: new Date().toISOString(),
    };

    // 1. Instantly render on screen (0ms)
    setComments((prev) => [...prev, optimisticComment]);
    setCommentBody("");
    setPost((prev) =>
      prev
        ? {
            ...prev,
            commentsCount: (prev.commentsCount || comments.length) + 1,
          }
        : null
    );

    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    // 2. Perform API call in background
    try {
      const realComment = await addComment({
        postId: post.id,
        body: trimmed,
      });

      // Replace temp ID with real DB response silently
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? realComment : c))
      );
    } catch (err: any) {
      // Rollback on failure
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: Math.max(0, (prev.commentsCount || 1) - 1),
            }
          : null
      );
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
    setPost((prev) =>
      prev
        ? {
            ...prev,
            commentsCount: Math.max(0, (prev.commentsCount || 1) - 1),
          }
        : null
    );
    toast.success("Comment deleted");

    // 2. Perform API call in background
    try {
      await deleteComment(post.id, commentId);
    } catch (err: any) {
      // Rollback on network failure
      setComments((prev) => [...prev, commentToDelete]);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: (prev.commentsCount || 0) + 1,
            }
          : null
      );
      toast.error(err.message || "Failed to delete comment");
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (!isAuthenticated) {
    clearAuthSession();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cb_redirect_url", location.pathname + location.search);
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 mb-4 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <Card className="p-8 text-center shadow-card border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Post Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {error || "This post may have been deleted by the author or does not exist."}
          </p>
          <Button
            onClick={handleBack}
            className="mt-5 rounded-xl font-medium"
            size="sm"
          >
            Go to Campus Feed
          </Button>
        </Card>
      </div>
    );
  }

  const isCommentsEnabled = post.commentsEnabled !== false;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-20 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Post
        </span>
      </div>

      {/* Main Post Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
          {/* Author Header */}
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border">
            <Link
              to={`/student/${encodeURIComponent(post.authorHandle || post.author)}`}
              className="shrink-0 transition-transform active:scale-95"
            >
              <Avatar className="h-11 w-11 border border-border">
                <AvatarImage src={post.avatarUrl} alt={post.author} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {post.initials || (post.author || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0">
              <Link
                to={`/student/${encodeURIComponent(post.authorHandle || post.author)}`}
                className="font-semibold text-base hover:text-primary hover:underline transition-colors block leading-tight truncate"
              >
                {post.author}
              </Link>
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-0.5">
                {post.authorHandle && (
                  <span className="font-mono text-primary/90 font-medium">
                    @{post.authorHandle}
                  </span>
                )}
                {post.authorHandle && <span>•</span>}
                <span>{normalizeCourseShort(post.course) || post.college || "Campus Student"}</span>
              </div>
            </div>
          </div>

          {/* Bottom Section: Full Width Body, Media, Actions */}
          <div className="w-full">
            {/* Multiline, auto-linked formatted content */}
            <FormattedContent content={post.content} className="mt-2 text-[15px] leading-relaxed" />

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="mt-3.5">
                <ImageCarousel images={post.images} />
              </div>
            )}

            {/* Video */}
            {post.videoUrl && (
              <div className="mt-3.5">
                <VideoPlayer videoUrl={post.videoUrl} videoId={post.videoUrl} />
              </div>
            )}

            {/* Hashtags (plain text, not clickable) */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-1.5 mt-3.5 flex-wrap">
                {post.tags.map((t) => {
                  const cleanTag = t.replace(/^#/, "");
                  return (
                    <span
                      key={cleanTag}
                      className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground select-none"
                    >
                      #{cleanTag}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2 pt-3 mt-3.5 border-t border-border">
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLike}
                  className={`gap-1.5 text-xs transition-colors ${
                    post.liked
                      ? "text-red-500 hover:text-red-600"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 transition-transform active:scale-125 ${
                      post.liked ? "fill-current text-red-500" : ""
                    }`}
                  />
                  <span>{formatCount(post.likes)}</span>
                </Button>

                {post.commentsEnabled !== false && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 font-medium select-none">
                    <MessageSquare className="h-4 w-4" />
                    <span>{formatCount(post.commentsCount)}</span>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSave}
                  className={`text-xs px-2.5 transition-colors ${
                    post.saved
                      ? "text-accent hover:text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={post.saved ? "Unsave post" : "Save post"}
                >
                  <Bookmark
                    className={`h-4 w-4 ${
                      post.saved ? "fill-current" : ""
                    }`}
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await sharePostLink(post.id);
                    toast.success("Post link copied to clipboard!");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <span className="text-[10px] text-muted-foreground shrink-0 select-none ml-auto">
                {formatSmartDate(post.createdAt || post.time)}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Inline Comments Section */}
      <Card className="p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold font-heading text-foreground">
              Comments ({comments.length})
            </h3>
          </div>
        </div>

        {/* Comment input form if enabled */}
        {isCommentsEnabled ? (
          <form onSubmit={handleAddComment} className="space-y-2 pt-1">
            <div className="relative flex items-end gap-2 bg-muted/30 border border-border rounded-xl p-2 focus-within:border-primary/60 transition-colors">
              <Textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                placeholder="Write a comment..."
                rows={2}
                maxLength={1000}
                className="min-h-[48px] max-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 text-xs px-2 py-1 bg-transparent"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!commentBody.trim()}
                className="h-9 px-3.5 rounded-lg shrink-0 gap-1.5 font-medium text-xs shadow-sm bg-gradient-hero text-primary-foreground"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center justify-end text-[11px] text-muted-foreground px-1">
              <span className="text-[10px]">{commentBody.length}/1000</span>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 px-4 text-xs text-muted-foreground bg-muted/30 rounded-xl border border-border/50">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span>Comments are turned off for this post by the author.</span>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {commentsLoading ? (
            <CommentsSkeleton count={3} />
          ) : comments.length === 0 ? (
            <div className="py-8 text-center space-y-1.5">
              <p className="text-sm font-medium text-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground">
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
                <div key={comment.id} className="flex items-start gap-3 group animate-in fade-in-50 duration-200">
                  <Link
                    to={comment.authorHandle ? `/student/${comment.authorHandle}` : "#"}
                    className="shrink-0 transition-transform active:scale-95 mt-0.5"
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

                  {/* Comment Content Area */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {/* Top Row: Author + 3-dot menu */}
                    <div className="flex items-start justify-between gap-2 px-1">
                      <div className="min-w-0 flex flex-col">
                        <Link
                          to={comment.authorHandle ? `/student/${comment.authorHandle}` : "#"}
                          className="text-xs font-bold text-foreground hover:text-primary hover:underline transition-colors truncate"
                        >
                          {comment.author}
                        </Link>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {comment.authorHandle && (
                            <Link
                              to={`/student/${comment.authorHandle}`}
                              className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-mono truncate"
                            >
                              @{comment.authorHandle}
                            </Link>
                          )}
                          {comment.authorHandle && <span className="text-[10px] text-muted-foreground">•</span>}
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium shrink-0">
                            {post.isGlobal
                              ? comment.collegeShortName || comment.collegeName || "Student"
                              : normalizeCourseShort(comment.course) || "Student"}
                          </span>
                        </div>
                      </div>

                      {/* 3-dot menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all shrink-0"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[120px]">
                          {isAuthor ? (
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive focus:text-destructive gap-2 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => toast.info("Report feature coming soon.")}
                              className="gap-2 text-xs"
                            >
                              <Flag className="h-3.5 w-3.5" /> Report
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Comment Bubble */}
                    <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-3.5 py-2.5 border border-border/40">
                      <FormattedContent
                        content={comment.body}
                        className="text-xs leading-relaxed text-foreground"
                      />
                    </div>

                    {/* Time at bottom */}
                    <div className="flex justify-start px-2">
                      <span className="text-[10px] text-muted-foreground select-none">
                        {formatSmartDate(comment.createdAt || comment.time)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>
      </Card>
    </div>
  );
};

export default PostPage;
