import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Newspaper,
  Megaphone,
  Plus,
  Trash2,
  Eye,
  LogOut,
  BookOpen,
  TrendingUp,
  DollarSign,
  MessageCircle,
  Tag,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ArrowLeft,
  Loader2,
  Compass,
  Play,
  Pause,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ImageCarousel from "@/components/ImageCarousel";
import AdminDataManagement from "@/components/admin/AdminDataManagement";
import {
  getAdminStats,
  adminCreateAd,
  adminDeleteAd,
  adminGetAds,
  adminToggleAllAds,
  adminToggleAdStatus,
  adminToggleAdComments,
  adminLogin,
  adminLogout,
  type AdminStatsResponse,
  type AdData,
} from "@/lib/api";
import { isValidHttpUrl, normalizeUrl } from "@/lib/urlUtils";
import { toast } from "sonner";

const LOCKOUT_KEY = "cb_admin_lockout_until";
const FAILED_ATTEMPTS_KEY = "cb_admin_failed_attempts";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Admin authentication state (strictly session-scoped)
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    // Clean up any legacy persistent localStorage admin tokens so login is always required
    localStorage.removeItem("cb_admin_token");
    localStorage.removeItem("cb_admin_user");
    return sessionStorage.getItem("cb_admin_token");
  });

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Rate Limiting & 5-minute lockout timer state
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const lockoutUntilStr = localStorage.getItem(LOCKOUT_KEY);
    if (!lockoutUntilStr) return 0;
    const lockoutUntil = parseInt(lockoutUntilStr, 10);
    const now = Date.now();
    return lockoutUntil > now ? Math.ceil((lockoutUntil - now) / 1000) : 0;
  });

  // Countdown effect for lockout timer
  useEffect(() => {
    if (lockoutRemainingSec <= 0) return;

    const timer = setInterval(() => {
      setLockoutRemainingSec((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(LOCKOUT_KEY);
          localStorage.removeItem(FAILED_ATTEMPTS_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutRemainingSec]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Dashboard state
  const [ads, setAds] = useState<AdData[]>([]);
  const [newAd, setNewAd] = useState({
    brand: "",
    title: "",
    description: "",
    imageUrls: "",
    ctaText: "Shop Now",
    ctaLink: "",
    commentsEnabled: true,
    discount: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adCreating, setAdCreating] = useState(false);
  const [bulkToggling, setBulkToggling] = useState(false);
  const [stats, setStats] = useState<AdminStatsResponse>({
    totalUsers: 0,
    totalPosts: 0,
    activeAds: 0,
    totalRevenue: 0,
    totalImpressions: 0,
    totalClicks: 0,
  });
  const [dataLoading, setDataLoading] = useState(false);

  // Load dashboard data when admin is authenticated
  useEffect(() => {
    if (!adminToken) return;

    let alive = true;
    setDataLoading(true);

    Promise.all([getAdminStats(), adminGetAds()])
      .then(([statsData, adsData]) => {
        if (!alive) return;
        setStats({
          totalUsers: statsData?.totalUsers ?? statsData?.students ?? 0,
          totalPosts: statsData?.totalPosts ?? statsData?.posts ?? 0,
          activeAds: statsData?.activeAds ?? (Array.isArray(adsData) ? adsData.filter((a) => a.active).length : 0),
          totalRevenue: statsData?.totalRevenue ?? 0,
          totalImpressions: statsData?.totalImpressions ?? 0,
          totalClicks: statsData?.totalClicks ?? 0,
        });
        if (Array.isArray(adsData)) {
          setAds(adsData);
        }
      })
      .catch((err) => {
        if (!alive) return;
        if (err?.status === 401 || err?.status === 403) {
          toast.error("Admin session expired. Please log in again.");
          handleLogout();
        }
      })
      .finally(() => {
        if (alive) setDataLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [adminToken]);

  const triggerLockout = (seconds = 300) => {
    const lockoutUntil = Date.now() + seconds * 1000;
    localStorage.setItem(LOCKOUT_KEY, String(lockoutUntil));
    setLockoutRemainingSec(seconds);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemainingSec > 0) {
      setLoginError(`Admin login is locked. Please wait ${formatTimer(lockoutRemainingSec)}.`);
      return;
    }

    if (!loginForm.username.trim() || !loginForm.password) {
      setLoginError("Please enter both administrator username and password.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await adminLogin({
        username: loginForm.username.trim(),
        password: loginForm.password,
      });

      if (res?.accessToken) {
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.removeItem(FAILED_ATTEMPTS_KEY);
        setAdminToken(res.accessToken);
        toast.success("Administrator authentication successful");
      } else {
        handleFailedLoginAttempt();
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("locked") || msg.includes("ADMIN_LOCKED")) {
        triggerLockout(300);
        setLoginError("Admin login locked for 5 minutes due to multiple failed attempts.");
        toast.error("Security lockout activated");
      } else {
        handleFailedLoginAttempt(msg);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFailedLoginAttempt = (backendMsg?: string) => {
    const rawAttempts = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    const prevAttempts = rawAttempts ? parseInt(rawAttempts, 10) : 0;
    const currentAttempts = prevAttempts + 1;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, String(currentAttempts));

    if (currentAttempts >= 2) {
      triggerLockout(300);
      setLoginError("Admin login locked for 5 minutes due to 2 consecutive failed attempts.");
      toast.error("Maximum attempts reached. Lockout started for 5 minutes.");
    } else {
      setLoginError(
        backendMsg ||
          `Invalid administrator credentials. (Attempt ${currentAttempts} of 2 before 5-minute security lockout)`
      );
      toast.error(`Invalid login. 1 attempt remaining before 5-minute lockout.`);
    }
  };

  const handleLogout = () => {
    adminLogout();
    setAdminToken(null);
    setAds([]);
    setStats({
      totalUsers: 0,
      totalPosts: 0,
      activeAds: 0,
      totalRevenue: 0,
      totalImpressions: 0,
      totalClicks: 0,
    });
    toast.info("Logged out from admin portal");
  };

  const toggleAdActive = async (id: string, currentActive: boolean) => {
    try {
      const updated = await adminToggleAdStatus(id, !currentActive);
      setAds((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: updated?.active ?? !currentActive } : a))
      );
      setStats((prev) => ({
        ...prev,
        activeAds: Math.max(0, prev.activeAds + (currentActive ? -1 : 1)),
      }));
      toast.success(!currentActive ? "Ad activated" : "Ad paused");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update ad status");
    }
  };

  const toggleAdCommentsSetting = async (id: string, currentComments: boolean) => {
    try {
      const updated = await adminToggleAdComments(id, !currentComments);
      setAds((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, commentsEnabled: updated?.commentsEnabled ?? !currentComments }
            : a
        )
      );
      toast.success(!currentComments ? "Comments enabled" : "Comments disabled");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update comments setting");
    }
  };

  const handleToggleAllAds = async () => {
    const areAnyActive = ads.some((a) => a.active);
    const targetStatus = !areAnyActive;

    try {
      setBulkToggling(true);
      await adminToggleAllAds(targetStatus);
      setAds((prev) => prev.map((a) => ({ ...a, active: targetStatus })));
      setStats((prev) => ({
        ...prev,
        activeAds: targetStatus ? prev.activeAds + (ads.length - prev.activeAds) : 0,
      }));
      toast.success(targetStatus ? "All ad campaigns activated" : "All ad campaigns paused");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update all ads");
    } finally {
      setBulkToggling(false);
    }
  };

  const deleteAd = async (id: string) => {
    try {
      await adminDeleteAd(id);
      setAds((prev) => prev.filter((a) => a.id !== id));
      setStats((prev) => ({
        ...prev,
        activeAds: Math.max(0, prev.activeAds - 1),
      }));
      toast.success("Ad campaign removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove ad");
    }
  };

  const createAd = async () => {
    const rawImages = newAd.imageUrls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!newAd.brand.trim() || !newAd.title.trim() || rawImages.length === 0) {
      toast.error("Please fill in Brand, Title, and at least one image URL");
      return;
    }

    for (let i = 0; i < rawImages.length; i++) {
      if (!isValidHttpUrl(rawImages[i])) {
        toast.error(`Image URL #${i + 1} is not a valid web URL`);
        return;
      }
    }

    if (newAd.ctaLink.trim() && !isValidHttpUrl(newAd.ctaLink.trim())) {
      toast.error("Please provide a valid URL for the Button Link (e.g. https://brand.com/offer)");
      return;
    }

    const images = rawImages.map(normalizeUrl);

    try {
      setAdCreating(true);
      const created = await adminCreateAd({
        brand: newAd.brand.trim(),
        title: newAd.title.trim(),
        description: newAd.description.trim(),
        imageUrl: images[0],
        imageUrls: images,
        ctaText: newAd.ctaText.trim() || "Shop Now",
        ctaLink: newAd.ctaLink.trim() ? normalizeUrl(newAd.ctaLink.trim()) : "#",
        destinationUrl: newAd.ctaLink.trim() ? normalizeUrl(newAd.ctaLink.trim()) : "#",
        discount: newAd.discount.trim() || undefined,
        commentsEnabled: newAd.commentsEnabled,
        allowComments: newAd.commentsEnabled,
      });

      const newAdData: AdData = {
        id: created?.id || String(Date.now()),
        brand: created?.brand || newAd.brand,
        title: created?.title || newAd.title,
        description: created?.description || newAd.description,
        imageUrl: images[0],
        images: created?.images?.length ? created.images : images,
        ctaText: created?.ctaText || "Shop Now",
        ctaLink: created?.ctaLink || "#",
        active: true,
        commentsEnabled: created?.commentsEnabled ?? true,
        allowComments: created?.commentsEnabled ?? true,
        discount: created?.discount || "",
        likes: 0,
        commentsCount: 0,
        impressions: 0,
        clicks: 0,
        revenue: 0,
      };

      setAds((prev) => [newAdData, ...prev]);
      setStats((prev) => ({
        ...prev,
        activeAds: prev.activeAds + 1,
      }));

      setNewAd({
        brand: "",
        title: "",
        description: "",
        imageUrls: "",
        ctaText: "Shop Now",
        ctaLink: "",
        commentsEnabled: true,
        discount: "",
      });
      setDialogOpen(false);
      toast.success("Ad campaign created successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to create ad");
    } finally {
      setAdCreating(false);
    }
  };

  // Safe metrics calculation
  const totalUsers = stats.totalUsers ?? 0;
  const totalPosts = stats.totalPosts ?? 0;
  const activeAds = stats.activeAds ?? 0;
  const totalRevenue = stats.totalRevenue ?? 0;
  const totalImpressions = stats.totalImpressions ?? 0;
  const totalClicks = stats.totalClicks ?? 0;
  const avgCtr =
    totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  const allAdsPaused = ads.length > 0 && ads.every((a) => !a.active);

  // -------------------------------------------------------------------------
  // 1. Admin Login Gate Screen (when not logged in)
  // -------------------------------------------------------------------------
  if (!adminToken) {
    const isLocked = lockoutRemainingSec > 0;

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-hero text-primary-foreground mb-3 shadow-lg">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">CollegeBook Admin Portal</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Restricted management console. Enter administrator credentials to continue.
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-card border-border shadow-card">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Security Lockout Banner */}
              {isLocked ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                    Security Lockout Active
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Maximum failed attempts reached. Admin login is temporarily locked for 5 minutes.
                  </p>
                  <div className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400 pt-1">
                    Try again in: {formatTimer(lockoutRemainingSec)}
                  </div>
                </div>
              ) : loginError ? (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {loginError}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Admin Username</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="e.g. admin"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    disabled={isLocked || loginLoading}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary disabled:opacity-50"
                    autoFocus={!isLocked}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Admin Password</Label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    disabled={isLocked || loginLoading}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLocked || loginLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-colors gap-2 shadow-sm disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
                  </>
                ) : isLocked ? (
                  <>
                    <Lock className="h-4 w-4" /> Locked ({formatTimer(lockoutRemainingSec)})
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Sign In to Admin Console
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to CollegeBook Student Network
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. Admin Dashboard View (when authenticated)
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-hero flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold">CollegeBook</span>
          <Badge variant="secondary" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
            Admin Console
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {/* View Student Feed (Admin View) -> completely isolated route */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs h-8 gap-1.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
          >
            <Link to="/manage-admin/feed-view">
              <Compass className="h-3.5 w-3.5" /> View Student Feed (Admin View)
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-destructive h-8"
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live platform metrics, sponsored ad campaigns, and student network moderation.
            </p>
          </div>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              value: totalUsers.toLocaleString(),
              icon: Users,
              color: "text-blue-500",
            },
            {
              label: "Total Posts",
              value: totalPosts.toLocaleString(),
              icon: Newspaper,
              color: "text-green-500",
            },
            {
              label: "Active Ads",
              value: activeAds,
              icon: Megaphone,
              color: "text-amber-500",
            },
            {
              label: "Ad Revenue",
              value: `₹${totalRevenue.toLocaleString()}`,
              icon: DollarSign,
              color: "text-emerald-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="ads" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="ads">Ads Management</TabsTrigger>
              <TabsTrigger value="data">Colleges & Data</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ads" className="space-y-8">
            {/* Ad Performance Overview */}
            <Card className="p-5 shadow-card">
          <h2 className="font-semibold mb-4 text-sm">Ad Performance Overview</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <Eye className="h-3.5 w-3.5" /> Total Impressions
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3.5 w-3.5" /> Total Clicks
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{avgCtr}%</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <BarChart3 className="h-3.5 w-3.5" /> Avg CTR
              </p>
            </div>
          </div>
        </Card>

        {/* Ads Management Header & Global Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-lg">Manage Ads ({ads.length})</h2>
            {ads.length > 0 && (
              <Badge variant={allAdsPaused ? "outline" : "secondary"} className="text-xs">
                {ads.filter((a) => a.active).length} of {ads.length} Running
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Global Start/Stop All Ads Button */}
            {ads.length > 0 && (
              <Button
                variant={allAdsPaused ? "default" : "outline"}
                size="sm"
                onClick={handleToggleAllAds}
                disabled={bulkToggling}
                className={`gap-1.5 text-xs h-9 ${
                  allAdsPaused
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : "border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                }`}
              >
                {bulkToggling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : allAdsPaused ? (
                  <Play className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                )}
                {allAdsPaused ? "Resume All Ads" : "Pause All Ads"}
              </Button>
            )}

            {/* Create New Ad Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-hero text-primary-foreground gap-2 h-9" size="sm">
                  <Plus className="h-4 w-4" /> New Ad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Ad Campaign</DialogTitle>
                  <DialogDescription>Create and publish a sponsored ad campaign.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Brand Name</Label>
                    <Input
                      placeholder="e.g. Nike"
                      value={newAd.brand}
                      onChange={(e) => setNewAd({ ...newAd, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ad Title</Label>
                    <Input
                      placeholder="Catchy headline"
                      value={newAd.title}
                      onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Ad copy..."
                      value={newAd.description}
                      onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URLs (one per line)</Label>
                    <Textarea
                      placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"}
                      value={newAd.imageUrls}
                      onChange={(e) => setNewAd({ ...newAd, imageUrls: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        placeholder="Shop Now"
                        value={newAd.ctaText}
                        onChange={(e) => setNewAd({ ...newAd, ctaText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Link</Label>
                      <Input
                        placeholder="https://..."
                        value={newAd.ctaLink}
                        onChange={(e) => setNewAd({ ...newAd, ctaLink: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> Student Discount
                    </Label>
                    <Input
                      placeholder="e.g. 20% off with college ID"
                      value={newAd.discount}
                      onChange={(e) => setNewAd({ ...newAd, discount: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Leave empty if no discount applies</p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <Label className="text-sm font-medium">Enable Comments</Label>
                      <p className="text-xs text-muted-foreground">Allow students to comment on this ad</p>
                    </div>
                    <Switch
                      checked={newAd.commentsEnabled}
                      onCheckedChange={(v) => setNewAd({ ...newAd, commentsEnabled: v })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="bg-gradient-hero text-primary-foreground"
                    onClick={createAd}
                    disabled={adCreating}
                  >
                    {adCreating ? "Creating..." : "Create Ad"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Ads List */}
        {ads.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No active ad campaigns</p>
            <p className="text-xs mt-1">Click "New Ad" above to launch a sponsored campaign.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {ads.map((ad, i) => {
              const adImpressions = ad.impressions ?? 0;
              const adClicks = ad.clicks ?? 0;
              const adRevenue = ad.revenue ?? 0;
              const adCtr =
                adImpressions > 0 ? ((adClicks / adImpressions) * 100).toFixed(1) : "0.0";

              const images =
                ad.images && ad.images.length > 0
                  ? ad.images
                  : ad.imageUrl
                  ? [ad.imageUrl]
                  : [];

              return (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="p-4 shadow-card">
                    <div className="flex gap-4">
                      {images.length > 0 && (
                        <div className="w-36 shrink-0">
                          <ImageCarousel images={images} maxHeight="max-h-24" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm">{ad.title}</h3>
                              {ad.brand && (
                                <Badge variant="secondary" className="text-xs">
                                  {ad.brand}
                                </Badge>
                              )}
                              {(ad as any).active ? (
                                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Paused
                                </Badge>
                              )}
                              {ad.commentsEnabled ?? ad.allowComments ? (
                                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs gap-1">
                                  <MessageCircle className="h-3 w-3" /> Comments On
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <MessageCircle className="h-3 w-3" /> Comments Off
                                </Badge>
                              )}
                            </div>
                            {ad.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {ad.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                CTA: {ad.ctaText || "Shop Now"}
                              </Badge>
                              {ad.discount && (
                                <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                                  <Tag className="h-3 w-3" /> {ad.discount}
                                </Badge>
                              )}
                              {ad.ctaLink && (
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {ad.ctaLink}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="flex flex-col items-center gap-1 mr-2">
                              <Label className="text-[10px] text-muted-foreground">Active</Label>
                              <Switch
                                checked={!!(ad as any).active}
                                onCheckedChange={() => toggleAdActive(String(ad.id), !!(ad as any).active)}
                              />
                            </div>
                            <div className="flex flex-col items-center gap-1 mr-2">
                              <Label className="text-[10px] text-muted-foreground">Comments</Label>
                              <Switch
                                checked={!!(ad.commentsEnabled ?? ad.allowComments)}
                                onCheckedChange={() =>
                                  toggleAdCommentsSetting(
                                    String(ad.id),
                                    !!(ad.commentsEnabled ?? ad.allowComments)
                                  )
                                }
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteAd(String(ad.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{adImpressions.toLocaleString()} impressions</span>
                          <span>{adClicks.toLocaleString()} clicks</span>
                          <span>{adCtr}% CTR</span>
                          <span className="text-green-600 font-medium">
                            ₹{adRevenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
          </TabsContent>

          <TabsContent value="data">
            <AdminDataManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
