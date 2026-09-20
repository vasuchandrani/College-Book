import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Compass,
  MessageCircle,
  Heart,
  Trash2,
  RefreshCw,
  Search,
  BookOpen,
  Globe,
  Loader2,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import { FormattedContent } from "@/components/FormattedContent";
import {
  adminGetCampusFeed,
  adminGetExploreFeed,
  adminDeletePost,
  getColleges,
  type Post,
} from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface CollegeItem {
  id: number;
  uuid?: string;
  name: string;
  short: string;
  emailDomain?: string;
}

const AdminFeedViewPage = () => {
  const navigate = useNavigate();

  // Admin authentication guard (strictly session-scoped)
  const adminToken =
    typeof window !== "undefined" ? sessionStorage.getItem("cb_admin_token") : null;

  useEffect(() => {
    if (!adminToken) {
      toast.error("Please login to the Admin Portal first");
      navigate("/manage-admin", { replace: true });
    }
  }, [adminToken, navigate]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"campus" | "explore">("campus");

  // Colleges list & selected college UUID
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [selectedCollegeUuid, setSelectedCollegeUuid] = useState<string>("");
  const [collegesLoading, setCollegesLoading] = useState(false);

  // Posts data
  const [campusPosts, setCampusPosts] = useState<Post[]>([]);
  const [explorePosts, setExplorePosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Post deletion modal
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load Colleges on mount
  useEffect(() => {
    let alive = true;
    setCollegesLoading(true);

    getColleges()
      .then((data: any) => {
        if (!alive) return;
        const list: CollegeItem[] = Array.isArray(data) ? data : [];
        setColleges(list);
        if (list.length > 0 && !selectedCollegeUuid) {
          const firstUuid = list[0].uuid || String(list[0].id);
          setSelectedCollegeUuid(firstUuid);
        }
      })
      .catch(() => {
        if (alive) toast.error("Failed to load colleges list");
      })
      .finally(() => {
        if (alive) setCollegesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Fetch campus feed using the real UUID
  const fetchCampusPosts = async (collegeUuid: string) => {
    if (!collegeUuid) return;
    setLoadingPosts(true);
    try {
      const res: any = await adminGetCampusFeed(collegeUuid, 0, 30);
      const items = res?.items || res?.posts || res?.content || (Array.isArray(res) ? res : []);
      setCampusPosts(items);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch campus posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch explore feed
  const fetchExplorePosts = async () => {
    setLoadingPosts(true);
    try {
      const res: any = await adminGetExploreFeed(0, 30);
      const items = res?.items || res?.posts || res?.content || (Array.isArray(res) ? res : []);
      setExplorePosts(items);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch explore posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (!adminToken) return;
    if (activeTab === "campus" && selectedCollegeUuid) {
      fetchCampusPosts(selectedCollegeUuid);
    } else if (activeTab === "explore") {
      fetchExplorePosts();
    }
  }, [activeTab, selectedCollegeUuid, adminToken]);

  const handleRefresh = () => {
    if (activeTab === "campus") {
      fetchCampusPosts(selectedCollegeUuid);
    } else {
      fetchExplorePosts();
    }
    toast.info("Feed refreshed");
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    try {
      await adminDeletePost(String(postToDelete.id));
      toast.success("Post deleted by administrator");
      setCampusPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setExplorePosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setPostToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const selectedCollege = colleges.find(
    (c) => (c.uuid && c.uuid === selectedCollegeUuid) || String(c.id) === selectedCollegeUuid
  );

  // Filter posts by search query
  const displayedPosts = (activeTab === "campus" ? campusPosts : explorePosts).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const author = (p as any).author || p.authorName || "";
    const college = (p as any).college || p.collegeName || "";
    const course = (p as any).course || p.courseName || "";
    return (
      p.content?.toLowerCase().includes(q) ||
      author.toLowerCase().includes(q) ||
      p.authorHandle?.toLowerCase().includes(q) ||
      college.toLowerCase().includes(q) ||
      course.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  if (!adminToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Standard CollegeBook Admin Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-hero flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold">CollegeBook</span>
          <Badge variant="secondary" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
            Admin Feed Inspector
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs h-8 gap-1.5"
          >
            <Link to="/manage-admin">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loadingPosts}
            className="text-xs h-8 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingPosts ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Student Feed Inspector</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Admin-exclusive view of live student posts with direct moderation actions.
            </p>
          </div>
        </div>

        {/* Tab & Filter Controls */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "campus" | "explore")}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <TabsList className="bg-muted p-1">
              <TabsTrigger
                value="campus"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
              >
                <Building2 className="h-3.5 w-3.5" /> Campus Feed
              </TabsTrigger>
              <TabsTrigger
                value="explore"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
              >
                <Compass className="h-3.5 w-3.5" /> Explore Feed
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search text, author, #tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Campus Feed Tab Content */}
          <TabsContent value="campus" className="space-y-4 mt-4">
            {/* College picker card */}
            <Card className="p-4 shadow-card bg-card border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Select University Campus</h3>
                  <p className="text-xs text-muted-foreground">
                    Switch between partner colleges to inspect campus-specific student posts.
                  </p>
                </div>
              </div>

              <div className="w-full md:w-80">
                <Select
                  value={selectedCollegeUuid}
                  onValueChange={(val) => setSelectedCollegeUuid(val)}
                  disabled={collegesLoading}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select a university" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {colleges.map((col) => {
                      const value = col.uuid || String(col.id);
                      return (
                        <SelectItem key={value} value={value} className="text-xs">
                          {col.name} ({col.short})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Selected College Summary */}
            {selectedCollege && (
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  Showing campus posts for <strong className="text-foreground">{selectedCollege.name}</strong>
                </span>
                <span>{displayedPosts.length} posts</span>
              </div>
            )}
          </TabsContent>

          {/* Explore Feed Tab Content */}
          <TabsContent value="explore" className="space-y-4 mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Showing cross-campus student posts across <strong className="text-foreground">all partner universities</strong>
              </span>
              <span>{displayedPosts.length} posts</span>
            </div>
          </TabsContent>
        </Tabs>

        {/* Posts Stream */}
        {loadingPosts ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs">Loading feed stream...</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          <Card className="py-16 text-center border-dashed text-muted-foreground space-y-2">
            <Compass className="h-10 w-10 mx-auto opacity-50" />
            <h3 className="font-semibold text-foreground text-sm">No posts found</h3>
            <p className="text-xs max-w-sm mx-auto">
              {searchQuery
                ? `No posts matched your search "${searchQuery}".`
                : "There are currently no active posts in this feed."}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayedPosts.map((post, idx) => {
              const authorName = (post as any).author || post.authorName || "Student Author";
              const initials = post.initials || authorName.charAt(0) || "U";
              const collegeName = (post as any).college || post.collegeName || "Student";
              const courseName = (post as any).course || post.courseName;
              const images = post.images && post.images.length > 0 ? post.images : [];
              const videoMedia = (post as any).media?.find((m: any) => m.mediaType === "VIDEO");
              const videoUrl = post.videoUrl || videoMedia?.url || videoMedia?.videoId;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                >
                  <Card className="p-5 shadow-card bg-card border-border">
                    {/* Post Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">
                              {authorName}
                            </span>
                            {post.authorHandle && (
                              <span className="text-xs text-muted-foreground">@{post.authorHandle}</span>
                            )}
                            <Badge variant="secondary" className="text-[10px]">
                              {collegeName}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            {courseName && <span>{courseName}</span>}
                            <span>•</span>
                            <span>{post.time || "Recently"}</span>
                            <span>•</span>
                            {post.isGlobal ? (
                              <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/20">
                                <Globe className="h-2.5 w-2.5 mr-1" /> Cross-Campus
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px]">
                                Campus-Only
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin Moderation Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPostToDelete(post)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8 text-xs border border-destructive/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Post
                      </Button>
                    </div>

                    {/* Post Content */}
                    {post.content && (
                      <FormattedContent content={post.content} className="mt-3" />
                    )}

                    {/* Images / Carousel */}
                    {images.length > 0 && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-border">
                        <ImageCarousel images={images} maxHeight="max-h-96" />
                      </div>
                    )}

                    {/* Video Player */}
                    {videoUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-border">
                        <VideoPlayer videoUrl={videoUrl} videoId={videoUrl} />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] gap-1"
                          >
                            <Tag className="h-2.5 w-2.5" /> #{tag.replace(/^#/, "")}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Post Stats Footer */}
                    <div className="flex items-center justify-between border-t border-border pt-3 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                          {post.likes ?? 0} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                          {post.commentsCount ?? 0} comments
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Post ID: {String(post.id).substring(0, 8)}...
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Delete Student Post?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              As an administrator, this action will permanently remove this post and all associated comments,
              likes, and media from the live student platform. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePost}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium gap-1.5"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFeedViewPage;
