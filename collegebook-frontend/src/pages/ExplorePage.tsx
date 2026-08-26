import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  Heart,
  Bookmark,
  Share2,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import AdCard, { type AdData } from "@/components/AdCard";
import FormattedContent from "@/components/FormattedContent";
import ThemedLoader from "@/components/ThemedLoader";
import InlineCommentsSection from "@/components/InlineCommentsSection";
import { useDebouncedToggle } from "@/hooks/useDebouncedToggle";
import { formatSmartDate } from "@/lib/dateUtils";
import { toast } from "sonner";
import {
  getExplorePosts,
  getExploreAds,
  likePost as apiLikePost,
  savePost as apiSavePost,
  sharePostLink,
} from "@/lib/api";
import type { ExplorePost } from "@/types";

const PAGE_SIZE = 15;

const ExplorePage = () => {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | number | null>(null);
  const [ads, setAds] = useState<AdData[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { triggerToggle } = useDebouncedToggle(400);

  // Initial fetch / tag filter change
  useEffect(() => {
    let alive = true;
    setLoadingInitial(true);
    setPage(0);
    setHasMore(true);

    getExplorePosts(0, PAGE_SIZE, selectedTag || undefined)
      .then((res) => {
        if (alive) {
          setPosts(res.posts || []);
          setHasMore(Boolean(res.hasNext && res.posts && res.posts.length > 0));
        }
      })
      .catch(() => {
        if (alive) {
          setPosts([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (alive) setLoadingInitial(false);
      });

    getExploreAds()
      .then((data) => alive && setAds(data || []))
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [selectedTag]);

  // Load next page of posts
  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore || loadingInitial) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    getExplorePosts(nextPage, PAGE_SIZE, selectedTag || undefined)
      .then((res) => {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id)));
          const fresh = (res.posts || []).filter((p) => !existingIds.has(String(p.id)));
          return [...prev, ...fresh];
        });
        setPage(nextPage);
        setHasMore(Boolean(res.hasNext && res.posts && res.posts.length > 0));
      })
      .catch(() => {
        setHasMore(false);
      })
      .finally(() => {
        setLoadingMore(false);
      });
  }, [page, hasMore, loadingMore, loadingInitial, selectedTag]);

  // IntersectionObserver for infinite scrolling sentinel
  useEffect(() => {
    if (loadingInitial || !hasMore || posts.length === 0) {
      if (observerRef.current) observerRef.current.disconnect();
      return;
    }

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMorePosts, hasMore, loadingMore, loadingInitial, posts.length]);

  // Compute dynamic hashtags with usage counts, sorted descending (most used to least used)
  const dynamicTagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        const clean = t.replace(/^#/, "").trim();
        if (clean) {
          counts[clean] = (counts[clean] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const toggleLike = (id: string | number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const currentLiked = !!post.liked;

    triggerToggle(
      id,
      currentLiked,
      (newLiked) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  liked: newLiked,
                  likes: newLiked
                    ? p.liked
                      ? p.likes
                      : p.likes + 1
                    : p.liked
                    ? Math.max(0, p.likes - 1)
                    : p.likes,
                }
              : p
          )
        );
      },
      (signal) => apiLikePost(id, signal)
    );
  };

  const toggleSave = (id: string | number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const currentSaved = !!post.saved;

    triggerToggle(
      id,
      currentSaved,
      (newSaved) => {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, saved: newSaved } : p))
        );
      },
      (signal) => apiSavePost(id, signal)
    );
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase().replace(/^#/, "");
    return posts.filter((p) => {
      const matchesSearch =
        !query ||
        p.content.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().replace(/^#/, "").includes(query)));
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
      return (
        <div className="py-16 flex items-center justify-center">
          <ThemedLoader size="md" />
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <Card className="p-8 text-center shadow-card">
          <p className="text-muted-foreground text-sm">
            {selectedTag
              ? `No posts found for #${selectedTag}.`
              : search
              ? "No matching posts found."
              : "No explore posts available right now."}
          </p>
          {selectedTag && (
            <Button
              variant="outline"
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
          <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
            {/* Top Section: Author Profile Header */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
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
                <div className="min-w-0">
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
                    {post.authorHandle && post.college && <span>•</span>}
                    {post.college && <span className="truncate">{post.college}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Full Width Body, Media, Actions, Comments */}
            <div className="w-full">
              {/* Multiline, 2-line gap normalized, auto-linked content */}
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
                  <VideoPlayer
                    videoUrl={post.videoUrl}
                    videoId={post.videoUrl}
                  />
                </div>
              )}

              {/* Hashtags below content/media and above actions bar */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {post.tags.map((t) => {
                    const cleanTag = t.replace(/^#/, "");
                    const isSelected = selectedTag?.toLowerCase().replace(/^#/, "") === cleanTag.toLowerCase();
                    return (
                      <button
                        key={cleanTag}
                        type="button"
                        onClick={() => setSelectedTag(isSelected ? null : cleanTag)}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        #{cleanTag}
                      </button>
                    );
                  })}
                </div>
              )}

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
                    {post.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSave(post.id)}
                    className={`gap-1.5 text-xs ${
                      post.saved ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        post.saved ? "fill-current" : ""
                      }`}
                    />{" "}
                    Save
                  </Button>
                  {post.commentsEnabled !== false && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedCommentsPostId((prev) =>
                          prev === post.id ? null : post.id
                        )
                      }
                      className={`gap-1.5 text-xs transition-colors ${
                        expandedCommentsPostId === post.id
                          ? "text-primary bg-primary/10 font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.commentsCount || 0}</span>
                    </Button>
                  )}
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
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 select-none ml-auto">
                  {formatSmartDate(post.createdAt || post.time)}
                </span>
              </div>

              {/* Inline Expandable Comments Stream */}
              <AnimatePresence>
                {expandedCommentsPostId === post.id && (
                  <InlineCommentsSection
                    post={post}
                    onCommentCountChange={(newCount) => {
                      setPosts((prev) =>
                        prev.map((p) =>
                          p.id === post.id
                            ? { ...p, commentsCount: newCount }
                            : p
                        )
                      );
                    }}
                    onClose={() => setExpandedCommentsPostId(null)}
                  />
                )}
              </AnimatePresence>
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
        title="Cross-Campus Explore"
        description="Discover student innovations, questions, hackathon ideas, and open-source projects across engineering campuses nationwide on CollegeBook."
        keywords="cross campus explore, collegebook explore, student ideas, hackathon projects, engineering students"
      />
      <div className="mb-4 sm:mb-6">
        <h1 className="font-heading text-xl sm:text-2xl font-bold">Explore</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Discover ideas from students across all campuses
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

      {/* Dynamic Trending Hashtags Filter (Fixed-position Expand/Collapse button, no scrollbars) */}
      {dynamicTagsWithCounts.length > 0 && (
        <div className="mb-6 bg-card/60 border border-border/70 rounded-xl p-2.5 shadow-xs backdrop-blur-sm relative">
          <div className={`flex items-center gap-1.5 flex-wrap ${dynamicTagsWithCounts.length > 6 ? "pr-24" : ""}`}>
            {(tagsExpanded ? dynamicTagsWithCounts : dynamicTagsWithCounts.slice(0, 6)).map(({ tag }) => {
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

          {dynamicTagsWithCounts.length > 6 && (
            <button
              type="button"
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted border border-border/50 hover:border-border shadow-xs"
              title={tagsExpanded ? "Collapse hashtags" : "Expand all hashtags"}
            >
              <span>{tagsExpanded ? "Collapse" : "Expand"}</span>
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

export default ExplorePage;
