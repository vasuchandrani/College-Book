import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Send,
  Loader2,
  X,
  Hash,
  Globe,
  School,
  MessageSquare,
  Sparkles,
  Check,
  Video,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  createPost as apiCreatePost,
  uploadImageFile,
  uploadVideoFile,
  getProfile,
  formatApiError,
  normalizeCourseShort,
  type FeedPost,
} from "@/lib/api";
import { clientCache } from "@/lib/clientCache";

interface PendingImage {
  file: File;
  previewUrl: string;
}

interface PendingVideo {
  file: File;
  previewUrl: string;
}

const POPULAR_TAGS = ["hackathon", "project", "campus", "tech", "internship", "design", "coding"];

const CreatePostPage = () => {
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [postTags, setPostTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [pendingVideo, setPendingVideo] = useState<PendingVideo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [isGlobal, setIsGlobal] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("cb_user");
    return raw
      ? JSON.parse(raw)
      : {
          name: "You",
          initials: "YO",
          college: "Dharmsinh Desai University",
          collegeShort: "DDU",
          course: "B.Tech",
        };
  });

  const collegeDisplay =
    user.collegeShort ||
    (user.college === "Dharmsinh Desai University" ? "DDU" : user.college) ||
    "DDU";

  useEffect(() => {
    getProfile()
      .then((p) => {
        if (p) {
          const loadedCollege = p.collegeName || p.college || "Dharmsinh Desai University";
          const loadedCollegeShort =
            p.collegeShort ||
            p.collegeShortName ||
            (loadedCollege === "Dharmsinh Desai University"
              ? "DDU"
              : loadedCollege
                  .split(" ")
                  .map((w: string) => w[0])
                  .join(""));
          setUser((currentUser: any) => {
            const updated = {
              ...currentUser,
              id: p.userId || currentUser.id,
              name: p.name || p.fullName || currentUser.name,
              college: loadedCollege,
              collegeShort: loadedCollegeShort,
              course: p.courseName || currentUser.course,
              currentYear: p.currentYear || currentUser.currentYear,
              defaultBio: p.defaultBio || currentUser.defaultBio,
            };
            localStorage.setItem("cb_user", JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: PendingImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("video/")) {
        if (file.size > 500 * 1024 * 1024) {
          toast.error("Video exceeds maximum allowed size (500 MB)");
          continue;
        }
        setPendingVideo({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      } else {
        newImages.push({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    }

    if (newImages.length > 0) {
      setPendingImages((prev) => [...prev, ...newImages]);
    }
    if (mediaInputRef.current) mediaInputRef.current.value = "";
  };

  const handleAddTag = (tagToAdd?: string) => {
    const raw = (tagToAdd || tagInput).trim().replace(/^#/, "");
    if (!raw) return;
    if (postTags.includes(raw)) {
      toast.info("Tag already added");
      setTagInput("");
      return;
    }
    if (postTags.length >= 5) {
      toast.error("You can add only 5 hashtags in one post");
      return;
    }
    setPostTags((prev) => [...prev, raw]);
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPostTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handlePost = async () => {
    const hasContent = Boolean(content.trim());
    const hasMedia = pendingImages.length > 0 || Boolean(pendingVideo);

    if (!hasContent && !hasMedia) {
      toast.error("Please enter some text or attach an image/video to publish.");
      return;
    }
    setIsUploading(true);

    try {
      const mediaKeys: Array<{
        objectKey?: string;
        url?: string;
        mediaType: string;
        storageProvider: string;
        videoId?: string;
      }> = [];

      if (pendingImages.length > 0) {
        setUploadStatusText("Uploading images...");
        for (let i = 0; i < pendingImages.length; i++) {
          const res = await uploadImageFile(pendingImages[i].file);
          mediaKeys.push({
            objectKey: res.objectKey,
            url: res.publicUrl || res.url,
            mediaType: "IMAGE",
            storageProvider: res.storageProvider || "S3",
          });
        }
      }

      if (pendingVideo) {
        setUploadStatusText("Uploading video (this may take a moment)...");
        const res = await uploadVideoFile(pendingVideo.file);
        mediaKeys.push({
          videoId: res.videoId,
          objectKey: res.objectKey || res.videoId,
          url: res.publicUrl || res.url,
          mediaType: "VIDEO",
          storageProvider: res.storageProvider || "S3",
        });
      }

      setUploadStatusText("Publishing post...");
      const cleanedContent = content.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      const created = await apiCreatePost({
        author: user.name,
        initials: user.initials,
        course: user.course,
        content: cleanedContent,
        mediaKeys,
        tags: postTags,
        isGlobal,
        commentsEnabled,
      });

      // Update feed cache and notify active FeedPage
      const cached = clientCache.get<{ posts: FeedPost[]; hasNext: boolean }>("feed_page_0_all");
      if (cached) {
        clientCache.set(
          "feed_page_0_all",
          {
            posts: [created, ...(cached.posts || []).filter((p) => p.id !== created.id)],
            hasNext: cached.hasNext,
          },
          300_000
        );
      }
      clientCache.invalidate("feed_page_");

      window.dispatchEvent(
        new CustomEvent("cb_post_created", {
          detail: created,
        })
      );

      toast.success("Post published!");
      navigate("/feed");
    } catch (err: any) {
      toast.error(formatApiError(err, "Failed to publish post. Please try again."));
    } finally {
      setIsUploading(false);
      setUploadStatusText("");
    }
  };

  const isSubmitDisabled =
    (!content.trim() && pendingImages.length === 0 && !pendingVideo) || isUploading;

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6 pb-24">
      <SEO
        title="Create Post | CollegeBook"
        description="Share an idea, achievement, project, or opportunity with students and faculty at your university on CollegeBook."
        keywords="collegebook create post, share campus update, student project post"
      />

      {/* Header with Back Navigation and Title */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/feed")}
            className="h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Back to feed"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-heading text-lg sm:text-2xl font-bold tracking-tight">Create Post</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Share with {collegeDisplay} {isGlobal ? "and beyond" : "campus only"}
            </p>
          </div>
        </div>

        {/* Quick submit button in header */}
        <Button
          type="button"
          onClick={handlePost}
          disabled={isSubmitDisabled}
          className="bg-gradient-hero text-primary-foreground font-semibold gap-1.5 shadow-sm hover:opacity-95 text-xs sm:text-sm h-9 px-4 sm:px-5 rounded-full transition-all shrink-0"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>Post</span>
        </Button>
      </div>

      {/* Dedicated Composer Box Card */}
      <Card className="p-4 sm:p-6 shadow-card border-border/80 bg-card/95 backdrop-blur-sm rounded-2xl">
        {/* Author Header */}
        <div className="flex items-center gap-3 pb-4 mb-3 border-b border-border/60">
          <Avatar className="h-11 w-11 border border-border">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {user.initials || "YO"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm sm:text-base text-foreground truncate">
              {user.name}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-0.5">
              {user.course && (
                <span className="font-medium text-foreground/80">
                  {normalizeCourseShort(user.course)}
                </span>
              )}
              {user.course && collegeDisplay && <span>•</span>}
              <span className="truncate">{collegeDisplay}</span>
            </div>
          </div>

          {/* Quick Visibility Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-muted/80 text-muted-foreground border border-border/50">
            {isGlobal ? (
              <>
                <Globe className="h-3 w-3 text-primary" />
                <span className="hidden sm:inline">Global Feed</span>
                <span className="sm:hidden">Global</span>
              </>
            ) : (
              <>
                <School className="h-3 w-3 text-primary" />
                <span className="hidden sm:inline">Campus Only</span>
                <span className="sm:hidden">Campus</span>
              </>
            )}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="w-full">
          <Textarea
            placeholder="Share an idea, achievement, or opportunity... What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value.replace(/\n{3,}/g, "\n\n"))}
            className="min-h-[140px] sm:min-h-[180px] border-none shadow-none resize-none p-2 bg-transparent rounded-md focus-visible:ring-0 text-sm sm:text-base placeholder:text-muted-foreground/70 leading-relaxed"
            disabled={isUploading}
            autoFocus
          />

          {/* Post Tags Chips */}
          {postTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/40">
              {postTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2.5 py-1 gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors rounded-full"
                >
                  <Hash className="h-3 w-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-primary/70 hover:text-destructive transition-colors ml-0.5"
                    title="Remove tag"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Inline Hashtag Input */}
          {showTagInput && (
            <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    ref={tagInputRef}
                    placeholder="Type a hashtag (e.g. hackathon) and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="h-9 pl-8 text-xs bg-muted/30 border-muted rounded-lg"
                    autoFocus
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-9 text-xs px-3 rounded-lg"
                  onClick={() => handleAddTag()}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>

              {/* Popular Tag Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                <span className="text-muted-foreground text-[11px] font-medium mr-1">Suggested:</span>
                {POPULAR_TAGS.filter((t) => !postTags.includes(t)).slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Previews */}
          {pendingImages.length > 0 && (
            <div className="flex gap-2.5 mt-3 pt-3 border-t border-border/40 flex-wrap">
              {pendingImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.previewUrl}
                    alt=""
                    className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-xl border border-border shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPendingImages(pendingImages.filter((_, j) => j !== idx))
                    }
                    className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Video Preview */}
          {pendingVideo && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <div className="relative group inline-block max-w-full">
                <video
                  src={pendingVideo.previewUrl}
                  className="max-h-48 sm:max-h-60 w-auto rounded-xl border border-border"
                  controls
                />
                <button
                  type="button"
                  onClick={() => setPendingVideo(null)}
                  className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow-sm"
                  title="Remove video"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Video attached ({Math.round(pendingVideo.file.size / 1024 / 1024)} MB)
                </span>
              </div>
            </div>
          )}

          {/* Upload Progress Status Indicator */}
          {isUploading && (
            <div className="flex items-center gap-2.5 mt-3 p-2.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span>{uploadStatusText}</span>
            </div>
          )}

          {/* Toolbar and Options */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
                multiple
                className="hidden"
                onChange={handleMediaSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-foreground gap-1.5 px-3 h-8 sm:h-9 text-xs rounded-lg hover:bg-muted"
                onClick={() => mediaInputRef.current?.click()}
                disabled={isUploading}
              >
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                <span>Add Media</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`gap-1.5 px-3 h-8 sm:h-9 text-xs rounded-lg ${
                  showTagInput || postTags.length > 0
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => {
                  setShowTagInput(!showTagInput);
                  if (!showTagInput) {
                    setTimeout(() => tagInputRef.current?.focus(), 100);
                  }
                }}
                disabled={isUploading}
              >
                <Hash className="h-3.5 w-3.5 text-primary" />
                <span>Hashtag</span>
              </Button>

              {/* Global vs Campus selector */}
              <div className="flex bg-muted p-0.5 rounded-lg border border-border/40">
                <button
                  type="button"
                  onClick={() => setIsGlobal(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    isGlobal
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Globe className="h-3 w-3" />
                  <span>Global</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsGlobal(false)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    !isGlobal
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <School className="h-3 w-3" />
                  <span>Campus</span>
                </button>
              </div>

              {/* Comments Enabled Toggle */}
              <button
                type="button"
                onClick={() => setCommentsEnabled(!commentsEnabled)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                  commentsEnabled
                    ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                    : "bg-muted text-muted-foreground border-border/60 hover:text-foreground"
                }`}
                title={commentsEnabled ? "Comments allowed on your post" : "Comments turned off"}
              >
                <MessageSquare className="h-3 w-3" />
                <span>{commentsEnabled ? "Comments On" : "Comments Off"}</span>
              </button>
            </div>

            {/* Bottom Actions: Cancel & Post */}
            <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/feed")}
                disabled={isUploading}
                className="h-9 px-4 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handlePost}
                disabled={isSubmitDisabled}
                className="bg-gradient-hero text-primary-foreground gap-1.5 h-9 px-5 text-xs sm:text-sm font-semibold rounded-lg shadow-sm hover:opacity-95"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Post</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreatePostPage;
