import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Users,
  Compass,
  BadgeCheck,
  BookHeart,
  Heart,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Lock,
  Download,
  FileText,
  Terminal,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tabs = [
  {
    id: "feed",
    title: "Campus Feed",
    subtitle: "Distraction-Free Social",
    icon: Newspaper,
    badge: "Campus Only",
  },
  {
    id: "collab",
    title: "Collab Hub",
    subtitle: "Hackathons & Projects",
    icon: Users,
    badge: "Team Building",
  },
  {
    id: "explore",
    title: "Cross-Campus Explore",
    subtitle: "Discover Other Colleges",
    icon: Compass,
    badge: "Broad Reach",
  },
  {
    id: "mycon",
    title: "myCon Skill Badges",
    subtitle: "Verified Proof System",
    icon: BadgeCheck,
    badge: "Anti-Fake",
  },
  {
    id: "memory",
    title: "Digital Memory Archive",
    subtitle: "Graduation Portfolio",
    icon: BookHeart,
    badge: "Time-Bound",
  },
];

const InteractiveFeatureShowcase = () => {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <section id="experience" className="py-14 sm:py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background Accent Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary/5 via-accent/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3 sm:mb-4">
            <span>Interactive Experience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            Designed for How Students Actually Connect & Collaborate
          </h2>
          <p className="text-muted-foreground text-xs sm:text-base md:text-lg">
            Say goodbye to addictive algorithm noise, endless reels, and spam messages.
            Click below to explore each pillar in action.
          </p>
        </div>

        {/* Tab Navigation Buttons (Horizontal scroll with clean scrollbar on mobile, wrap on desktop) */}
        <div className="flex md:flex-wrap items-center justify-start md:justify-center gap-2 sm:gap-3 overflow-x-auto md:overflow-x-visible no-scrollbar mobile-scrollbar pb-3 mb-6 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 border shrink-0 whitespace-nowrap ${isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-xs scale-102"
                  : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-accent" : ""}`} />
                <span className="font-semibold">{tab.title}</span>
                <span
                  className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full ${isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Showcase Panel */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "feed" && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-12 gap-8 items-center bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card"
              >
                <div className="md:col-span-6 space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                    <Newspaper className="h-4 w-4" />
                    <span>Clean Campus Feed</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                    Zero Addictive Algorithms. Just Your Campus Pulse.
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    View student questions, achievements, hackathon updates, and campus life discussions in clean chronological order.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/85">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Anonymous likes:</strong> Appreciate posts freely without hesitation or social pressure.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Instant Hashtags:</strong> Click trending topics like #hackathon or #internships.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Zero Reels & Distractions:</strong> Built for collaboration, student life, and sharing ideas & activities.</span>
                    </li>
                  </ul>
                  <Button className="bg-gradient-hero text-primary-foreground gap-2 mt-2" asChild>
                    <Link to="/signup">
                      Join Campus Feed <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="md:col-span-6">
                  <div className="bg-background/90 border border-border rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center font-bold text-xs">
                          RS
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">Ronak Shah</div>
                          <div className="text-[10px] text-muted-foreground">Information Technology • 3rd Year</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Campus</span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-normal">
                      We open-sourced our autonomous rover simulation library today! 🚜 Check out the GitHub repo and star if you like it.
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">#robotics</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">#opensource</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-red-500 font-medium"><Heart className="h-3.5 w-3.5 fill-red-500" /> 84 likes</span>
                      <span className="flex items-center gap-1"><Bookmark className="h-3.5 w-3.5" /> Saved by 19</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "collab" && (
              <motion.div
                key="collab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-12 gap-8 items-center bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card"
              >
                <div className="md:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                    <Users className="h-4 w-4 text-accent" />
                    <span>Collab Hub</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    Find Hackathon & Project Teammates in Seconds
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Stop asking noisy group chats. Create team openings specifying needed skillsets, review applicant intent, and unlock private group discussions once accepted.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/85">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Intent-Based Join Requests:</strong> Applicants state why they're a fit with proof.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Private Team Chat:</strong> Unlocked exclusively for accepted team members.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Open Source & Hackathon Tags:</strong> Filter by AI, Web, Mobile, Systems.</span>
                    </li>
                  </ul>
                  <Button className="bg-gradient-hero text-primary-foreground gap-2 mt-2" asChild>
                    <Link to="/signup">
                      Find Teammates <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="md:col-span-6">
                  <div className="bg-background/90 border border-border rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Team QuantumAI • Project Opening</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">2 Slots Left</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Building an AI-assisted diagnostic tool. Looking for PyTorch & Next.js specialists.
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">PyTorch</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">FastAPI</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">Next.js</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/60 border border-border/70 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[11px] font-medium">Team Chat unlocks on accept</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> Private</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "explore" && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-12 gap-8 items-center bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card"
              >
                <div className="md:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                    <Compass className="h-4 w-4" />
                    <span>Cross-Campus Horizon</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    Discover Ideas Across All Campuses
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Break out of local campus silos. Tier-2, tier-3, and premier college students can explore what students across all colleges and disciplines are creating, discussing, and achieving.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/85">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Cross-Campus Feeds:</strong> High-signal discussions, projects, and activities across campuses.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Hashtag Discovery:</strong> Find student projects tagged #machinelearning, #webdev, or #robotics.</span>
                    </li>
                  </ul>
                  <Button className="bg-gradient-hero text-primary-foreground gap-2 mt-2" asChild>
                    <Link to="/signup">
                      Explore All Campuses <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="md:col-span-6">
                  <div className="bg-background/90 border border-border rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-xs text-muted-foreground">
                      <Search className="h-3.5 w-3.5" />
                      <span>Filtering by #deeplearning across colleges...</span>
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">Aarav Mehta • Computer Science</span>
                        <span className="text-[10px] text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-xs text-foreground/90">
                        Published benchmark comparison of lightweight LLM quantizations on edge devices. Paper draft open for feedback!
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "mycon" && (
              <motion.div
                key="mycon"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-12 gap-8 items-center bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card"
              >
                <div className="md:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                    <BadgeCheck className="h-4 w-4 text-accent" />
                    <span>myCon Proof System</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    Skills Earned Through Proof. Not Self-Endorsements.
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Anyone can claim to know a language or framework. With myCon, students link verified competitive programming handles, GitHub contributions, or verified competition links.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/85">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Verifiable Credentials:</strong> Codeforces, LeetCode, GitHub PRs.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Recruiter-Grade Proof:</strong> Stand out with zero fluff or fake endorsements.</span>
                    </li>
                  </ul>
                  <Button className="bg-gradient-hero text-primary-foreground gap-2 mt-2" asChild>
                    <Link to="/signup">
                      Verify Your Skills <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="md:col-span-6">
                  <div className="bg-background/90 border border-border rounded-xl p-4 shadow-xs space-y-3">
                    <div className="text-xs font-bold text-foreground">Verified Student Badge Portfolio</div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-lg bg-card border border-border space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <BadgeCheck className="h-4 w-4" />
                          <span>CP Specialist</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Rating 1650+</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">Verified Proof</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-card border border-border space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-foreground">
                          <Terminal className="h-4 w-4 text-accent" />
                          <span>Open Source</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">50+ Merged PRs</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">GitHub Auth</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "memory" && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-12 gap-8 items-center bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card"
              >
                <div className="md:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                    <BookHeart className="h-4 w-4" />
                    <span>Graduation Memory Archive</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    Your Complete College Journey Exported as a Timeless Portfolio
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    CollegeBook is strictly time-bound to your degree program (e.g. 2 years for M.Tech/MCA, 3 years for BCA, 4 years for B.Tech). Upon graduation, all your posts, team projects, hackathons won, and peer appreciation are compiled into a downloadable Memory Book.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/85">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Downloadable PDF / Web Archive:</strong> Cherish your college memories forever.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Verified Portfolio for Life:</strong> Showcase what you actually accomplished.</span>
                    </li>
                  </ul>
                  <Button className="bg-gradient-hero text-primary-foreground gap-2 mt-2" asChild>
                    <Link to="/signup">
                      Start Your Journey <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="md:col-span-6">
                  <div className="bg-background/90 border border-border rounded-xl p-4 shadow-xs space-y-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Graduation Archive</div>
                      <div className="text-[10px] text-muted-foreground">Contains Posts • Teams • Verified Badges</div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" /> Download Memory Book (.PDF)
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default InteractiveFeatureShowcase;
