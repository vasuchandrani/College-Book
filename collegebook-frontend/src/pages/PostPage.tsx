import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import FormattedContent from "@/components/FormattedContent";
import ThemedLoader from "@/components/ThemedLoader";
import {
  getPostById,
  likePost as apiLikePost,
  savePost as apiSavePost,
  sharePostLink,
  type FeedPost,
} from "@/lib/api";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!localStorage.getItem("cb_token") || !!localStorage.getItem("cb_user");

  const handleBack = () => {
    if (isLoggedIn) {
      navigate("/feed");
    } else {
      navigate("/");
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
        }
      })
      .catch((err) => {
        if (isMounted) {
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
    setPost((prev) =>
      prev
        ? {
            ...prev,
            liked: !prev.liked,
            likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
          }
        : null
    );
    apiLikePost(post.id).catch(() => {});
  };

  const toggleSave = () => {
    if (!post) return;
    setPost((prev) =>
      prev
        ? {
            ...prev,
            saved: !prev.saved,
          }
        : null
    );
    apiSavePost(post.id).catch(() => {});
  };

  const handleShare = async () => {
    if (!post) return;
    await sharePostLink(post.id);
    toast.success("Post link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 min-h-[60vh] flex flex-col items-center justify-center">
        <ThemedLoader size="md" />
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Loading post...</p>
      </div>
    );
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
            {isLoggedIn ? "Go to Campus Feed" : "Go to CollegeBook"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-20">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4">
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
        <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
          <div className="flex items-start gap-3">
            <Avatar className="h-11 w-11 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {post.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    to={`/student/${encodeURIComponent(post.authorHandle || post.author)}`}
                    className="font-semibold text-base hover:text-primary hover:underline transition-colors block leading-tight"
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
                    <span>{post.course}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {post.time}
                </span>
              </div>

              {/* Multiline, auto-linked formatted content */}
              <FormattedContent content={post.content} className="mt-3 text-[15px] leading-relaxed" />

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

              {/* Hashtags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3.5 flex-wrap">
                  {post.tags.map((t) => {
                    const cleanTag = t.replace(/^#/, "");
                    return (
                      <Link
                        key={cleanTag}
                        to={`/explore?tag=${encodeURIComponent(cleanTag)}`}
                        className="text-xs px-2.5 py-0.5 rounded-full font-medium transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                      >
                        #{cleanTag}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-3 mt-3.5 border-t border-border/40">
                <div className="flex items-center gap-1">
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
                    <span>{post.likes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSave}
                    className={`gap-1.5 text-xs transition-colors ${
                      post.saved
                        ? "text-primary hover:text-primary/90"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${post.saved ? "fill-current" : ""}`} />
                    <span>Save</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PostPage;
