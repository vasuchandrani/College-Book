import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Users,
  Compass,
  BadgeCheck,
  Heart,
  Bookmark,
  Share2,
  CheckCircle2,
  ArrowRight,
  Search,
  BookOpen,
  LogOut,
  FolderGit2,
  UserCircle,
  Image as ImageIcon,
  Hash,
  Globe,
  Building2,
  Send,
  Sparkles,
  ExternalLink,
  Mail,
  Award,
  Code2,
  Rocket,
  Star,
  Clock,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DownloadAppButton from "@/components/DownloadAppButton";
import { toast } from "sonner";

const InteractiveFeatureShowcase = () => {
  const [activeTab, setActiveTab] = useState<"feed" | "explore" | "collab" | "mycollab" | "profile">("feed");
  const [feedMode, setFeedMode] = useState<"campus" | "global">("campus");
  const [collabSubTab, setCollabSubTab] = useState<"open_source" | "hackathon" | "project">("open_source");
  const [myCollabSubTab, setMyCollabSubTab] = useState<"open_source" | "requests" | "active" | "completed">("active");

  const [feedLiked, setFeedLiked] = useState(false);
  const [feedLikesCount, setFeedLikesCount] = useState(1104);
  const [ronakLiked, setRonakLiked] = useState(false);
  const [ronakLikesCount, setRonakLikesCount] = useState(680);
  const [exploreLiked, setExploreLiked] = useState(false);
  const [exploreLikesCount, setExploreLikesCount] = useState(98);
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [starredProjects, setStarredProjects] = useState<Record<string, boolean>>({ "city_store": true });

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success(savedPosts[id] ? "Removed from saved" : "Saved to your bookmarks!");
  };

  const toggleStar = (id: string) => {
    setStarredProjects((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success(starredProjects[id] ? "Removed star" : "Starred project on CollegeBook!");
  };

  return (
    <section id="experience" className="py-14 sm:py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background Accent Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left Column: Descriptive Content & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Full Interactive Mobile Preview</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15]">
              The Entire Campus Experience.{" "}
              <span className="text-gradient-hero">In Your Pocket.</span>
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Experience all core features of CollegeBook. Test the live interactive mobile app on the right — switch tabs between <strong>Campus Feed</strong>, <strong>Cross-Campus Explore</strong>, <strong>Collab Hub</strong>, <strong>My Collaboration</strong>, and <strong>Student Profiles</strong>.
            </p>

            {/* Pillar Feature Checklist */}
            <div className="space-y-3 pt-2 text-left max-w-lg mx-auto lg:mx-0">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-xs">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Newspaper className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Dual-Scope Campus & Global Feed</h4>
                  <p className="text-xs text-muted-foreground">Chronological, distraction-free campus updates with one-touch toggle between your university and cross-campus pulse.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-xs">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Cross-Campus Horizon</h4>
                  <p className="text-xs text-muted-foreground">Discover hackathon, fest and events invites from top universities.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-xs">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Collab Hub & Verified myCon Badges</h4>
                  <p className="text-xs text-muted-foreground">Assemble dream teams for hackathons, startups, and open-source projects.</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Button size="lg" className="bg-gradient-hero text-primary-foreground gap-2 font-semibold px-7 h-11 w-full sm:w-auto" asChild>
                <Link to="/signup">
                  Join Your Campus <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <div className="w-full sm:w-auto">
                <DownloadAppButton />
              </div>
            </div>
          </div>

          {/* Right Column: Live Mobile App Frame */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="w-full max-w-[360px] sm:max-w-[390px] rounded-[2.5rem] bg-background border-[6px] border-border shadow-2xl overflow-hidden flex flex-col relative h-[680px] sm:h-[720px] ring-1 ring-primary/20">

              {/* Smartphone Top Speaker / Notch simulation */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-muted/80 rounded-full z-40" />

              {/* Mobile Top Header */}
              <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-gradient-hero flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-heading text-sm font-bold text-foreground">CollegeBook</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast.info("myCon verified proof badges: We will introduce it soon!");
                    }}
                    className="flex items-center justify-center gap-1.5 px-2.5 h-7 rounded-full bg-muted text-foreground border border-border/40 text-[11px] font-semibold hover:bg-muted/80 transition-colors"
                  >
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                    <span>myCon</span>
                  </button>

                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-muted-foreground border border-border/40">
                    <LogOut className="h-3.5 w-3.5" />
                  </div>
                </div>
              </header>

              {/* Mobile Scrollable Viewport */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 pb-16 no-scrollbar">
                <AnimatePresence mode="wait">

                  {/* 1. CAMPUS FEED TAB */}
                  {activeTab === "feed" && (
                    <motion.div
                      key="feed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {/* Page Header (Matches Explore layout) */}
                      <div>
                        <h3 className="font-heading text-base font-bold text-foreground">Campus Feed</h3>
                        <p className="text-[11px] text-muted-foreground">
                          {feedMode === "campus" ? "What's happening at Dharmsinh Desai University" : "Global Cross-Campus Pulse"}
                        </p>
                      </div>

                      {/* Search Bar (Matches Explore) */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          readOnly
                          placeholder="Search posts, people, #hashtags..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground outline-none shadow-xs"
                        />
                      </div>

                      {/* Hashtag Filter Pills (Matches Explore) */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {["#campus", "#student", "#university", "#collaboration", "#mycon"].map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Post Creator Box (Compact, mobile-friendly & overflow-proof) */}
                      <div className="rounded-xl border border-border bg-card p-2.5 shadow-xs space-y-2">
                        <div className="text-xs text-muted-foreground italic">
                          Share an idea, fun, or opportunity...
                        </div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px] gap-1">
                          <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                            <span className="flex items-center gap-0.5 hover:text-foreground cursor-pointer">
                              <ImageIcon className="h-3 w-3" /> Media
                            </span>
                            <span className="flex items-center gap-0.5 hover:text-foreground cursor-pointer">
                              <Hash className="h-3 w-3" /> Tag
                            </span>
                          </div>

                          {/* Both Campus and Global buttons shown compactly */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="inline-flex items-center bg-muted/80 p-0.5 rounded-md border border-border/40">
                              <button
                                type="button"
                                onClick={() => setFeedMode("campus")}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all flex items-center gap-0.5 ${feedMode === "campus"
                                  ? "bg-background text-primary shadow-xs"
                                  : "text-muted-foreground hover:text-foreground"
                                  }`}
                              >
                                <Building2 className="h-2.5 w-2.5" /> Campus
                              </button>
                              <button
                                type="button"
                                onClick={() => setFeedMode("global")}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all flex items-center gap-0.5 ${feedMode === "global"
                                  ? "bg-background text-primary shadow-xs"
                                  : "text-muted-foreground hover:text-foreground"
                                  }`}
                              >
                                <Globe className="h-2.5 w-2.5" /> Global
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => toast.success("Sign up to publish live posts!")}
                              className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground font-semibold text-[10px] flex items-center gap-0.5 hover:opacity-90 shadow-xs shrink-0"
                            >
                              <Send className="h-2.5 w-2.5" /> Post
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Post Card 1: Vatsal Chandrani (Founder) */}
                      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            VC
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground truncate">Vatsal Chandrani</span>
                              <span className="text-[10px] text-muted-foreground">Just now</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">@vatsalchandrani • B.Tech Information Technology</div>
                            <div className="text-[10px] text-primary font-semibold">Founder @ CollegeBook</div>
                          </div>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Hey everyone! 👋 I am really happy and excited to see all your interactions and vibrant energy on CollegeBook! CollegeBook is a platform to build your authentic college story.
                        </p>

                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Here, you can share ideas freely with your peers, connect with students across campuses, and bridge university networks through our Collab Hub.
                        </p>
                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Your account is degree time-bound, and upon graduation, you'll receive a timeless digital Memory Book compiling your entire college journey, projects, and achievements.
                        </p>

                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Earn verified myCon badges for your real skills, share fun activities with your campus friends using Campus posts, or pitch a startup/project idea to the entire nation with Global posts. Excited to see you all create, collaborate, and thrive together! 🚀🎓
                        </p>

                        <div className="flex gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">#campus</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">#collaboration</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">#collabhub</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">#memorybook</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => {
                              setFeedLiked(!feedLiked);
                              setFeedLikesCount((c) => (feedLiked ? c - 1 : c + 1));
                            }}
                            className={`flex items-center gap-1.5 transition-colors ${feedLiked ? "text-red-500 font-semibold" : "hover:text-foreground"}`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${feedLiked ? "fill-red-500" : ""}`} />
                            <span>{feedLikesCount}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSave("vatsal_feed_post")}
                            className={`flex items-center gap-1.5 transition-colors ${savedPosts["vatsal_feed_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${savedPosts["vatsal_feed_post"] ? "fill-primary" : ""}`} />
                            <span>{savedPosts["vatsal_feed_post"] ? "Saved" : "Save"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toast.success("Post link copied to clipboard!")}
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>

                      {/* Post Card 2: Ronak Gondaliya (Incubyte, AI-driven dev & TDD) */}
                      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            RG
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground truncate">Ronak Gondaliya</span>
                              <span className="text-[10px] text-muted-foreground">13h ago</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">@ronakgondaliya • B.Tech Information Technology</div>
                          </div>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Recently explored how the engineering team at <strong>Incubyte</strong> approaches software engineering, and I was genuinely inspired by their AI-driven development workflow paired with strict <strong>Test-Driven Development (TDD)</strong>! 💻🔥
                        </p>
                        <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 p-2 rounded-lg border border-border/40">
                          <strong>How TDD works:</strong> You write a failing test first (🔴 <em>Red</em>), write minimal code to make it pass (🟢 <em>Green</em>), and then clean up the architecture (🔵 <em>Refactor</em>). Combining this with AI tools accelerates development while guaranteeing 100% bug-free quality.
                        </p>
                        <p className="text-xs text-foreground/90 leading-relaxed">
                          I’ve published a GitHub starter repository: <a href="https://github.com/ronakgondaliya/learn-tdd" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline">github.com/ronakgondaliya/learn-tdd</a>. For all juniors aiming for high-standard tech companies like Incubyte, learning TDD now gives you a massive hiring edge! 🚀
                        </p>

                        <div className="flex gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">#incubyte</span>
                          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">#tdd</span>
                          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">#aidrivendev</span>
                          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">#placements</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => {
                              setRonakLiked(!ronakLiked);
                              setRonakLikesCount((c) => (ronakLiked ? c - 1 : c + 1));
                            }}
                            className={`flex items-center gap-1.5 transition-colors ${ronakLiked ? "text-red-500 font-semibold" : "hover:text-foreground"}`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${ronakLiked ? "fill-red-500" : ""}`} />
                            <span>{ronakLikesCount}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSave("ronak_post")}
                            className={`flex items-center gap-1.5 transition-colors ${savedPosts["ronak_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${savedPosts["ronak_post"] ? "fill-primary" : ""}`} />
                            <span>{savedPosts["ronak_post"] ? "Saved" : "Save"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toast.success("Post link copied to clipboard!")}
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. EXPLORE TAB */}
                  {activeTab === "explore" && (
                    <motion.div
                      key="explore"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {/* Page Header */}
                      <div>
                        <h3 className="font-heading text-base font-bold text-foreground">Cross-Campus Explore</h3>
                        <p className="text-[11px] text-muted-foreground">Discover events, ideas & discussions across all universities</p>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          readOnly
                          placeholder="Search IIT Bombay, DDU, events, #standup..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground outline-none shadow-xs"
                        />
                      </div>

                      {/* Hashtags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {["#standupcomedy", "#iitbombay", "#campuslife", "#collabhub", "#openmic"].map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Explore Post 1: Vatsal Chandrani Global Post (Exact same as Campus Feed) */}
                      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            VC
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground truncate">Vatsal Chandrani</span>
                            </div>
                            <div className="text-[10px] text-primary font-semibold">@vatsalchandrani • Dharmsinh Desai University</div>
                            <div className="text-[10px] text-muted-foreground">Founder @ CollegeBook</div>
                          </div>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Hey everyone! 👋 I am really happy and excited to see all your interactions and vibrant energy on CollegeBook! CollegeBook is a platform to build your authentic college story.
                        </p>

                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Here, you can share ideas freely with your peers, connect with students across campuses, and bridge university networks through our Collab Hub.
                        </p>
                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Your account is degree time-bound, and upon graduation, you'll receive a timeless digital Memory Book compiling your entire college journey, projects, and achievements.
                        </p>

                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Earn verified myCon badges for your real skills, share fun activities with your campus friends using Campus posts, or pitch a startup/project idea to the entire nation with Global posts. Excited to see you all create, collaborate, and thrive together! 🚀🎓
                        </p>

                        <div className="flex gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">#campus</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">#collaboration</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">#collabhub</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">#memorybook</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => {
                              setFeedLiked(!feedLiked);
                              setFeedLikesCount((c) => (feedLiked ? c - 1 : c + 1));
                            }}
                            className={`flex items-center gap-1.5 transition-colors ${feedLiked ? "text-red-500 font-semibold" : "hover:text-foreground"}`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${feedLiked ? "fill-red-500" : ""}`} />
                            <span>{feedLikesCount}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSave("vatsal_explore_post")}
                            className={`flex items-center gap-1.5 transition-colors ${savedPosts["vatsal_explore_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${savedPosts["vatsal_explore_post"] ? "fill-primary" : ""}`} />
                            <span>{savedPosts["vatsal_explore_post"] ? "Saved" : "Save"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toast.success("Post link copied to clipboard!")}
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>

                      {/* Explore Post 2: Jaykrishna Gadhavi from IIT Bombay */}
                      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">
                            JG
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground truncate">Jaykrishna Gadhavi</span>
                              <span className="text-[10px] text-muted-foreground">30m ago</span>
                            </div>
                            <div className="text-[10px] text-amber-600 font-semibold">@jaykrishnagadhavi • IIT Bombay</div>
                          </div>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Hey folks! 🎤 Performing an impromptu Stand-Up Comedy show today right beside Canteen-1 / Open Air Theatre! Drop by after evening lectures for some campus humor, hostel life roasts, and chilled vibes. Everyone from all departments and visiting campuses is warmly welcome! See you all at 6 PM! 😂🔥
                        </p>

                        <div className="flex gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">#standupcomedy</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">#iitbombay</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">#campuslife</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">#canteen</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => {
                              setExploreLiked(!exploreLiked);
                              setExploreLikesCount((c) => (exploreLiked ? c - 1 : c + 1));
                            }}
                            className={`flex items-center gap-1.5 transition-colors ${exploreLiked ? "text-red-500 font-semibold" : "hover:text-foreground"}`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${exploreLiked ? "fill-red-500" : ""}`} />
                            <span>{exploreLikesCount}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSave("jaykrishna_post")}
                            className={`flex items-center gap-1.5 transition-colors ${savedPosts["jaykrishna_post"] ? "text-primary font-semibold" : "hover:text-foreground"}`}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${savedPosts["jaykrishna_post"] ? "fill-primary" : ""}`} />
                            <span>{savedPosts["jaykrishna_post"] ? "Saved" : "Save"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toast.success("Post link copied to clipboard!")}
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>

                      {/* Explore Post 3: Sneha Mukherjee */}
                      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2">
                        <div className="flex items-start gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                            SM
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground truncate">Sneha Mukherjee</span>
                              <span className="text-[10px] text-muted-foreground">2h ago</span>
                            </div>
                            <div className="text-[10px] text-blue-600 font-medium">@snehamukherjee • BITS Pilani</div>
                          </div>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed">
                          Inter-College Hackathon registrations are live! Looking for 2 backend specialists to assemble our squad on Collab Hub. 💻🏆
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. COLLAB HUB TAB (with CityStore in Open Source) */}
                  {activeTab === "collab" && (
                    <motion.div
                      key="collab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div>
                        <h3 className="font-heading text-base font-bold text-foreground">Collab Hub</h3>
                        <p className="text-[11px] text-muted-foreground">Discover open-source repos and assemble teams</p>
                      </div>

                      {/* 3 Sub-Tabs */}
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 text-xs">
                        <button
                          type="button"
                          onClick={() => setCollabSubTab("open_source")}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1 ${collabSubTab === "open_source"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          <Code2 className="h-3 w-3" /> Open Source
                        </button>
                        <button
                          type="button"
                          onClick={() => setCollabSubTab("hackathon")}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1 ${collabSubTab === "hackathon"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          <Rocket className="h-3 w-3" /> Hackathons
                        </button>
                        <button
                          type="button"
                          onClick={() => setCollabSubTab("project")}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1 ${collabSubTab === "project"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          <Users className="h-3 w-3" /> Projects
                        </button>
                      </div>

                      {/* Sub-tab 1: CityStore Open Source Project */}
                      {collabSubTab === "open_source" && (
                        <div className="space-y-2.5">
                          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">CityStore Platform</span>
                              <button
                                type="button"
                                onClick={() => toggleStar("city_store")}
                                className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold transition-colors ${starredProjects["city_store"]
                                  ? "bg-amber-500/15 text-amber-600 border border-amber-500/20"
                                  : "bg-muted text-muted-foreground"
                                  }`}
                              >
                                <Star className={`h-3 w-3 ${starredProjects["city_store"] ? "fill-amber-500 text-amber-500" : ""}`} />
                                <span>{starredProjects["city_store"] ? "54" : "53"}</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              CityStore is a city-wide store discovery platform that brings every local store — grocers, electronics dealers, pharmacies, bakeries, restaurants, boutiques and more — onto a single, beautifully designed app. Instead of guessing which shop offers the best price, is nearby, and has the stocks you need, CityStore lets you browse them all in one place, peek into their catalog, see whether they are open right now, and reach out directly.
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">React</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">TypeScript</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">Tailwind</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">Full Stack</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
                              <span className="text-muted-foreground">Lead: @vatsalchandrani</span>
                              <a
                                href="https://github.com/vasuchandrani/CityStore"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-semibold flex items-center gap-1 hover:underline"
                              >
                                github.com/CityStore <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>

                          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">Autonomous Drone ROS Node</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                                <Star className="h-3 w-3" /> 23
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Path planning nodes and computer vision models for search & rescue quadcopters.
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className="text-[9px] px-2 py-0.5 rounded bg-muted font-medium">Python</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-muted font-medium">ROS2</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-muted font-medium">OpenCV</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 2: Hackathon Teams */}
                      {collabSubTab === "hackathon" && (
                        <div className="space-y-2.5">
                          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">Smart India Hackathon 2025</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">2 Slots Left</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Building an AI-assisted diagnostic & triage tool. Looking for PyTorch & Next.js contributors.
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">PyTorch</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">FastAPI</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">Next.js</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toast.success("Sign up to submit your join request with reason & role!")}
                              className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
                            >
                              Request to Join Team
                            </button>
                          </div>

                          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">HackDU 2025 • Web3 Campus</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">1 Slot Left</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Decentralized micro-credential issuer. Need 1 Smart Contract developer.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 3: Team Projects */}
                      {collabSubTab === "project" && (
                        <div className="space-y-2.5">
                          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">Campus Placement Analytics</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">3 / 4 Members</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Real-time test analytics and interview preparation tracker for engineering departments.
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">Spring Boot</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">PostgreSQL</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">React</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toast.success("Sign up to submit your join request!")}
                              className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-xs"
                            >
                              Apply as Contributor
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 4. MY COLLAB TAB (with 4 interactive sub-tabs: Open Source, My Requests, Active, Done) */}
                  {activeTab === "mycollab" && (
                    <motion.div
                      key="mycollab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div>
                        <h3 className="font-heading text-base font-bold text-foreground">My Collaboration</h3>
                        <p className="text-[11px] text-muted-foreground">Manage your projects, teams & join requests</p>
                      </div>

                      {/* 4 Sub-Tabs */}
                      <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 text-xs text-center">
                        <button
                          type="button"
                          onClick={() => setMyCollabSubTab("open_source")}
                          className={`py-1 px-1 rounded-lg text-[9px] font-semibold transition-all truncate ${myCollabSubTab === "open_source"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          Open Source
                        </button>
                        <button
                          type="button"
                          onClick={() => setMyCollabSubTab("requests")}
                          className={`py-1 px-1 rounded-lg text-[9px] font-semibold transition-all truncate ${myCollabSubTab === "requests"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          My Requests
                        </button>
                        <button
                          type="button"
                          onClick={() => setMyCollabSubTab("active")}
                          className={`py-1 px-1 rounded-lg text-[9px] font-semibold transition-all truncate ${myCollabSubTab === "active"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() => setMyCollabSubTab("completed")}
                          className={`py-1 px-1 rounded-lg text-[9px] font-semibold transition-all truncate ${myCollabSubTab === "completed"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          Done
                        </button>
                      </div>

                      {/* Sub-tab 1: Open Source (Mine) */}
                      {myCollabSubTab === "open_source" && (
                        <div className="space-y-2.5">
                          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">CityStore Open Initiative</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">Lead</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              CityStore open repo for local commerce indexing. 16 student contributors active across universities.
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/50">
                              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> 54 Stars</span>
                              <span className="text-primary font-semibold">Public Repo</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 2: My Requests */}
                      {myCollabSubTab === "requests" && (
                        <div className="space-y-2.5">
                          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">Team QuantumAI</span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-bold">
                                PENDING
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Role Applied: <strong>Frontend Developer</strong>
                            </p>
                            <p className="text-[10px] text-muted-foreground italic bg-muted/40 p-1.5 rounded-md">
                              "Proficient in React, Tailwind, and WebSocket chat integrations."
                            </p>
                          </div>

                          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">IITB RoboTech Squad</span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold">
                                ACCEPTED
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Role: <strong>Systems Engineer</strong> • Team chat unlocked!
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 3: Active Teams */}
                      {myCollabSubTab === "active" && (
                        <div className="space-y-2.5">
                          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">Campus Rover AI</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">Team Lead</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Autonomous navigation simulation for smart campus delivery. 4 / 4 members confirmed.
                            </p>
                            <div className="p-2 rounded-lg bg-muted/60 text-[11px] text-muted-foreground flex items-center justify-between">
                              <span className="flex items-center gap-1 text-primary font-semibold"><Check className="h-3.5 w-3.5" /> Team Chat Active</span>
                              <span className="text-emerald-600 font-semibold">SIH 2025 Ready</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-tab 4: Done / Completed */}
                      {myCollabSubTab === "completed" && (
                        <div className="space-y-2.5">
                          <div className="rounded-xl border border-border bg-card p-3 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">Placement Prep Quiz Engine</span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">Completed</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Project finished and archived to student memory portfolios.
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 5. PROFILE TAB (with CP, Open Source, Web Dev, and Pending ML Badges) */}
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {/* Profile Card */}
                      <div className="rounded-xl border border-border bg-card p-4 shadow-xs text-center space-y-2.5">
                        <div className="h-14 w-14 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto shadow-sm">
                          VC
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">Vatsal Chandrani</h4>
                          <p className="text-[11px] text-primary font-semibold">@vatsalchandrani</p>
                          <p className="text-[11px] text-muted-foreground">B.Tech IT • 4th Year • Dharmsinh Desai University</p>
                        </div>
                      </div>

                      {/* Verified myCon Badges with 4 requested badges */}
                      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-primary" />
                            <span>myCon Skill Badges</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">3 Verified • 1 Pending</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* 1. CP Badge */}
                          <div className="p-2 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground text-[11px]">CP Specialist</span>
                              <BadgeCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <p className="text-[9px] text-muted-foreground">Codeforces Rating 1650+</p>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold inline-block">
                              Verified Proof
                            </span>
                          </div>

                          {/* 2. Open Source Badge */}
                          <div className="p-2 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground text-[11px]">Open Source</span>
                              <BadgeCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <p className="text-[9px] text-muted-foreground">50+ Merged GitHub PRs</p>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold inline-block">
                              Verified Proof
                            </span>
                          </div>

                          {/* 3. Web Dev Badge */}
                          <div className="p-2 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground text-[11px]">Web Dev</span>
                              <BadgeCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <p className="text-[9px] text-muted-foreground">Full-Stack Architect</p>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold inline-block">
                              Verified Proof
                            </span>
                          </div>

                          {/* 4. Machine Learning Badge (PENDING APPROVAL) */}
                          <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground text-[11px]">Machine Learning</span>
                              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-pulse" />
                            </div>
                            <p className="text-[9px] text-muted-foreground">Model Benchmarking</p>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 font-bold inline-block">
                              ⏳ Pending Approval
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Details Card (Discord removed, Portfolio clickable) */}
                      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          <span>Contact Details</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <span className="text-muted-foreground text-[11px]">Email</span>
                            <a
                              href="mailto:vatsal.chandrani.11@gmail.com"
                              className="text-primary font-medium text-[11px] hover:underline"
                            >
                              vatsal.chandrani.11@gmail.com
                            </a>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <span className="text-muted-foreground text-[11px]">Portfolio</span>
                            <a
                              href="https://vatsal-chandrani.me"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-medium text-[11px] flex items-center gap-1 hover:underline"
                            >
                              vatsal-chandrani.me <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Social & Portfolio Links (Codolio updated to vatsalchandrani) */}
                      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-primary" />
                          <span>Links & Portfolios</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <span className="text-muted-foreground text-[11px]">GitHub</span>
                            <a
                              href="https://github.com/vasuchandrani"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-medium text-[11px] flex items-center gap-1 hover:underline"
                            >
                              github.com/vasuchandrani <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <span className="text-muted-foreground text-[11px]">Codolio</span>
                            <a
                              href="https://codolio.com/profile/vatsalchandrani"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-medium text-[11px] flex items-center gap-1 hover:underline"
                            >
                              codolio.com/profile/vatsalchandrani <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Mobile Bottom Navigation Bar (Exact 5 tabs from BottomNav.tsx) */}
              <nav className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur z-40">
                <div className="flex items-center justify-around h-14 px-1">
                  {[
                    { id: "feed", title: "Feed", icon: Newspaper },
                    { id: "explore", title: "Explore", icon: Compass },
                    { id: "collab", title: "Collab", icon: Users },
                    { id: "mycollab", title: "My Collab", icon: FolderGit2 },
                    { id: "profile", title: "Profile", icon: UserCircle },
                  ].map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors ${isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        <Icon className={`h-4 w-4 transition-transform ${isActive ? "scale-110 stroke-[2.5]" : "stroke-[2]"}`} />
                        <span>{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InteractiveFeatureShowcase;
