import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  Heart,
  Bookmark,
  Share2,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import AdCard, { type AdData } from "@/components/AdCard";
import FormattedContent from "@/components/FormattedContent";
import { FeedSkeleton } from "@/components/Skeletons";
import { formatCount } from "@/lib/formatCount";
import { useDebouncedToggle } from "@/hooks/useDebouncedToggle";
import { formatSmartDate } from "@/lib/dateUtils";
import { toast } from "sonner";
import {
  getFeedPosts,
  getFeedAds,
  likePost as apiLikePost,
  savePost as apiSavePost,
  getProfile,
  sharePostLink,
  normalizeCourseShort,
  getTopHashtags,
  type FeedPost,
} from "@/lib/api";

import { clientCache } from "@/lib/clientCache";

const PAGE_SIZE = 15;

const FeedPage = () => {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const cacheKey = "feed_page_0_" + (selectedTag || "all");
  const cachedFeed = clientCache.get<{ posts: FeedPost[]; hasNext: boolean }>(cacheKey);

  const [posts, setPosts] = useState<FeedPost[]>(cachedFeed?.posts || []);
  const [loadingInitial, setLoadingInitial] = useState(!cachedFeed);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(cachedFeed?.hasNext ?? true);
  const [search, setSearch] = useState("");
  const [tagsExpanded, setTagsExpanded] = useState(false);

  // Ads
  const [ads, setAds] = useState<AdData[]>([]);

  // Top Hashtags
  const [topHashtags, setTopHashtags] = useState<{tag: string, count: number}[]>([]);

  const pageRef = useRef(cachedFeed ? 1 : 0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { triggerToggle } = useDebouncedToggle(400);

  // User/profile state for the header trigger bar
  const [user, setUser] = useState<{
    name: string;
    initials: string;
    avatarUrl?: string;
  }>({
    name: "You",
    initials: "YO",
    avatarUrl: undefined,
  });

  // Load user
  useEffect(() => {
    getProfile()
      .then((p: any) => {
        setUser({
          name: p.name || p.fullName || "You",
          initials: p.initials || "YO",
          avatarUrl: p.avatarUrl,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getFeedAds().then(setAds).catch(() => {});
    getTopHashtags().then(setTopHashtags).catch(() => {});
  }, []);

  const fetchPage = useCallback(
    async (page: number) => {
      try {
        const res = await getFeedPosts(page, PAGE_SIZE, selectedTag || undefined);
        return res;
      } catch {
        return { posts: [], hasNext: false };
      }
    },
    [selectedTag]
  );

  useEffect(() => {
    if (cachedFeed) return;
    let alive = true;
    setLoadingInitial(true);
    fetchPage(0).then((res) => {
      if (!alive) return;
      setPosts(res.posts);
      setHasMore(res.hasNext);
      setLoadingInitial(false);
      pageRef.current = 1;
      clientCache.set(cacheKey, res);
    });
    return () => {
      alive = false;
    };
  }, [selectedTag]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasMore || loadingMore || loadingInitial) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadingMore(true);
          fetchPage(pageRef.current).then((res) => {
            setPosts((prev) => {
              const ids = new Set(prev.map((p) => p.id));
              const unique = res.posts.filter((p: FeedPost) => !ids.has(p.id));
              return [...prev, ...unique];
            });
            setHasMore(res.hasNext);
            pageRef.current += 1;
            setLoadingMore(false);
          });
        }
      },
      { rootMargin: "200px" }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadingInitial, fetchPage]);

  // Like / Save toggling (optimistic, debounced)
  const toggleLike = (postId: string | number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
          : p
      )
    );
    triggerToggle(
      String(postId) + "-like",
      () => apiLikePost(postId),
      (err) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
              : p
          )
        );
        toast.error(err.message || "Failed to update like");
      }
    );
  };

  const toggleSave = (postId: string | number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, saved: !p.saved } : p
      )
    );
    triggerToggle(
      String(postId) + "-save",
      () => apiSavePost(postId),
      (err) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, saved: !p.saved } : p
          )
        );
        toast.error(err.message || "Failed to update save");
      }
    );
  };


  // Filter posts
  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.content?.toLowerCase().includes(q) ||
        p.author?.toLowerCase().includes(q) ||
        p.authorHandle?.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));
      const matchesTag =
        !selectedTag ||
        (p.tags &&
          p.tags.some(
            (t) => t.toLowerCase().replace(/^#/, "") === selectedTag.toLowerCase().replace(/^#/, "")
          ));
      return matchesSearch && matchesTag;
    });
  }, [posts, search, selectedTag]);

  const getAdForSlot = (index: number) =>
    ads[Math.floor(index / 5) % Math.max(ads.length, 1)];



  const renderFeed = () => {
    if (loadingInitial) {
      return <FeedSkeleton count={4} />;
    }

    if (filtered.length === 0) {
      return (
        <Card className="p-8 text-center shadow-card">
          <p className="text-muted-foreground text-sm">
            {selectedTag
              ? `No posts found for #${selectedTag}.`
              : search
              ? "No matching posts found."
              : "No posts yet. Be the first to share something!"}
          </p>
          {selectedTag && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTag(null)}
              className="mt-3 text-xs"
            >
              Clear tag filter
            </Button>
          )}
        </Card>
      );
    }

    const items: React.ReactNode[] = [];
    filtered.forEach((post, i) => {

      items.push(
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.03, 0.3) }}
        >
          <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow relative">
            {/* Open Post Arrow */}
            <button
              type="button"
              onClick={() => navigate(`/post/${post.id}`)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all z-10"
              title="Open post"
              aria-label="Open post detail"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>

            {/* Author Header */}
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border pr-8">
              <Link
                to={`/student/${encodeURIComponent(post.authorHandle || post.author)}`}
                className="shrink-0 transition-transform active:scale-95"
              >
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={post.avatarUrl} alt={post.author} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {post.initials || (post.author || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/student/${encodeURIComponent(post.authorHandle || post.author)}`}
                  className="font-semibold text-sm hover:text-primary hover:underline transition-colors block leading-tight truncate"
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

            {/* Body, Media, Actions */}
            <div className="w-full">
              <FormattedContent content={post.content} className="mt-1" />

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="mt-3">
                  <ImageCarousel images={post.images} />
                </div>
              )}

              {/* Video */}
              {post.videoUrl && (
                <div className="mt-3">
                  <VideoPlayer videoUrl={post.videoUrl} videoId={post.videoUrl} />
                </div>
              )}

              {/* Hashtags (plain text, not clickable) */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
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
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-1 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={`gap-1.5 text-xs ${
                      post.liked ? "text-red-500" : "text-muted-foreground"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        post.liked ? "fill-red-500" : ""
                      }`}
                    />{" "}
                    {formatCount(post.likes)}
                  </Button>
                  {post.commentsEnabled !== false && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{formatCount(post.commentsCount)}</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSave(post.id)}
                    className={`text-xs px-2.5 ${
                      post.saved ? "text-accent" : "text-muted-foreground"
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
                <div className="flex flex-col items-end gap-0.5 ml-auto shrink-0 select-none text-[10px] text-muted-foreground">
                  <span>{formatSmartDate(post.createdAt || post.time)}</span>
                  <span>{post.isGlobal ? "Global" : "Campus"}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      );

      if ((i + 1) % 5 === 0 && ads.length > 0) {
        const ad = getAdForSlot(i);
        if (ad) {
          items.push(<AdCard key={`ad-${i}`} ad={ad} />);
        }
      }
    });

    return items;
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6 pb-20">
      <SEO
        title="Campus Feed"
        description="Explore live updates, student ideas, hackathon achievements, and campus discussions at your university on CollegeBook."
        keywords="collegebook feed, campus feed, university updates, student posts, college life"
      />
      <div className="mb-4 sm:mb-6">
        <h1 className="font-heading text-xl sm:text-2xl font-bold">Campus Feed</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          What's happening at {user.name !== "You" ? "your campus" : "campus"}
        </p>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts, people, #hashtags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Dynamic Trending Hashtags Filter */}
      {topHashtags.length > 0 && (
        <div className="mb-6 bg-card/60 border border-border/70 rounded-xl p-2.5 shadow-xs backdrop-blur-sm relative">
          <div className={`flex items-center gap-1.5 flex-wrap ${topHashtags.length > 6 ? "pr-8" : ""}`}>
            {(tagsExpanded ? topHashtags : topHashtags.slice(0, 6)).map(({ tag }) => {
              const isSelected = selectedTag?.toLowerCase().replace(/^#/, "") === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/70 hover:bg-muted text-foreground border-border/50 hover:border-border"
                  }`}
                >
                  <span>#{tag}</span>
                </button>
              );
            })}
          </div>

          {topHashtags.length > 6 && (
            <button
              type="button"
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="absolute top-2.5 right-2.5 inline-flex items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1.5 rounded-full bg-muted/60 hover:bg-muted border border-border/50 hover:border-border shadow-xs"
              title={tagsExpanded ? "Collapse hashtags" : "Expand all hashtags"}
            >
              {tagsExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {selectedTag && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground px-1">
              <span>
                Filtering by <strong className="text-foreground">#{selectedTag}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-primary hover:underline text-xs font-medium"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Post Action Button / Trigger Bar */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/create-post")}
          className="w-full p-3 sm:p-4 rounded-xl border border-border/80 bg-card/90 hover:bg-card hover:border-primary/40 shadow-card hover:shadow-elevated transition-all flex items-center justify-between gap-3 group text-left cursor-pointer"
          aria-label="Create a post"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-9 w-9 shrink-0 border border-border">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user.initials || "YO"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
              Share an idea, achievement, or opportunity...
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-gradient-hero text-primary-foreground text-xs sm:text-sm font-semibold h-8 sm:h-9 px-3.5 sm:px-4 rounded-lg shadow-xs shrink-0 group-hover:opacity-95 transition-opacity">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Post</span>
          </div>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">{renderFeed()}</div>

      {/* Infinite Scroll Sentinel & Bottom Loader */}
      {hasMore && posts.length > 0 && (
        <div ref={loadMoreRef} className="py-6 flex items-center justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading more posts...</span>
            </div>
          )}
        </div>
      )}
      {!hasMore && posts.length > 0 && !loadingInitial && (
        <div className="py-6 flex items-center justify-center">
          <p className="text-xs text-muted-foreground/70 font-medium">
            You're all caught up!
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
