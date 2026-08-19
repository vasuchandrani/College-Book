import { useState, useEffect } from "react";
import { BarChart3, Users, Newspaper, Megaphone, Plus, Trash2, Eye, LogOut, BookOpen, TrendingUp, DollarSign, MessageCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import ImageCarousel from "@/components/ImageCarousel";
import { getAdminStats, adminCreateAd, adminDeleteAd, type AdminStatsResponse } from "@/lib/api";
import { toast } from "sonner";

interface Ad {
  id: string | number;
  brand: string;
  title: string;
  description: string;
  images: string[];
  ctaText: string;
  ctaLink: string;
  active: boolean;
  commentsEnabled: boolean;
  discount: string;
  impressions: number;
  clicks: number;
  revenue: number;
}

const AdminDashboard = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;
  if (!token) {
    return <Navigate to="/" replace />;
  }

  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [newAd, setNewAd] = useState({ brand: "", title: "", description: "", imageUrls: "", ctaText: "Shop Now", ctaLink: "", commentsEnabled: true, discount: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStatsResponse>({
    totalUsers: 0,
    totalPosts: 0,
    activeAds: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    let alive = true;
    getAdminStats()
      .then((data) => {
        if (alive) setStats(data);
      })
      .catch(() => {
        // graceful fallback if not logged in as admin
      });
    return () => { alive = false; };
  }, []);

  const toggleAd = (id: string | number) => setAds(ads.map(a => a.id === id ? { ...a, active: !a.active } : a));
  const toggleComments = (id: string | number) => setAds(ads.map(a => a.id === id ? { ...a, commentsEnabled: !a.commentsEnabled } : a));
  
  const deleteAd = async (id: string | number) => {
    try {
      if (typeof id === "string") {
        await adminDeleteAd(id);
      }
      setAds(ads.filter(a => a.id !== id));
      toast.success("Ad removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove ad");
    }
  };

  const createAd = async () => {
    const images = newAd.imageUrls.split("\n").map(u => u.trim()).filter(Boolean);
    if (!newAd.brand || !newAd.title || images.length === 0) {
      toast.error("Please fill in Brand, Title, and at least one image URL");
      return;
    }

    try {
      setLoading(true);
      const created = await adminCreateAd({
        brand: newAd.brand,
        title: newAd.title,
        description: newAd.description,
        imageUrls: images,
        ctaText: newAd.ctaText || "Shop Now",
        ctaLink: newAd.ctaLink || "#",
        discount: newAd.discount,
        commentsEnabled: newAd.commentsEnabled,
      });

      setAds([{
        id: created.id || Date.now().toString(),
        brand: created.brand,
        title: created.title,
        description: created.description,
        images: created.images || images,
        ctaText: created.ctaText || "Shop Now",
        ctaLink: created.ctaLink || "#",
        active: true,
        commentsEnabled: created.commentsEnabled ?? true,
        discount: created.discount || "",
        impressions: 0,
        clicks: 0,
        revenue: 0,
      }, ...ads]);

      setNewAd({ brand: "", title: "", description: "", imageUrls: "", ctaText: "Shop Now", ctaLink: "", commentsEnabled: true, discount: "" });
      setDialogOpen(false);
      toast.success("Ad campaign created successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to create ad");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_refresh_token");
    localStorage.removeItem("cb_user");
    localStorage.removeItem("cb_profile");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-hero flex items-center justify-center"><BookOpen className="h-4 w-4 text-primary-foreground" /></div>
          <span className="font-heading font-bold">CollegeBook</span>
          <Badge variant="secondary" className="text-xs">Admin</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground"><LogOut className="h-4 w-4" /> Logout</Button>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-500" },
            { label: "Total Posts", value: stats.totalPosts.toLocaleString(), icon: Newspaper, color: "text-green-500" },
            { label: "Active Ads", value: stats.activeAds, icon: Megaphone, color: "text-amber-500" },
            { label: "Ad Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                  <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="p-5 shadow-card mb-8">
          <h2 className="font-semibold mb-4">Ad Performance Overview</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div><p className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</p><p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Eye className="h-3.5 w-3.5" /> Total Impressions</p></div>
            <div><p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p><p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Total Clicks</p></div>
            <div><p className="text-2xl font-bold">{((stats.totalClicks / stats.totalImpressions) * 100).toFixed(1)}%</p><p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> Avg CTR</p></div>
          </div>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Manage Ads</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-hero text-primary-foreground gap-2" size="sm"><Plus className="h-4 w-4" /> New Ad</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Ad</DialogTitle>
                <DialogDescription>Create and publish a sponsored ad campaign.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Brand Name</Label><Input placeholder="e.g. Nike" value={newAd.brand} onChange={e => setNewAd({ ...newAd, brand: e.target.value })} /></div>
                <div className="space-y-2"><Label>Ad Title</Label><Input placeholder="Catchy headline" value={newAd.title} onChange={e => setNewAd({ ...newAd, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Ad copy..." value={newAd.description} onChange={e => setNewAd({ ...newAd, description: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Image URLs (one per line)</Label>
                  <Textarea placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"} value={newAd.imageUrls} onChange={e => setNewAd({ ...newAd, imageUrls: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Button Text</Label><Input placeholder="Shop Now" value={newAd.ctaText} onChange={e => setNewAd({ ...newAd, ctaText: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Button Link</Label><Input placeholder="https://..." value={newAd.ctaLink} onChange={e => setNewAd({ ...newAd, ctaLink: e.target.value })} /></div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Student Discount</Label>
                  <Input placeholder="e.g. 20% off with college ID" value={newAd.discount} onChange={e => setNewAd({ ...newAd, discount: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Leave empty if no discount applies</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div><Label className="text-sm font-medium">Enable Comments</Label><p className="text-xs text-muted-foreground">Allow students to comment on this ad</p></div>
                  <Switch checked={newAd.commentsEnabled} onCheckedChange={v => setNewAd({ ...newAd, commentsEnabled: v })} />
                </div>
              </div>
              <DialogFooter><Button className="bg-gradient-hero text-primary-foreground" onClick={createAd}>Create Ad</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {ads.map((ad, i) => (
            <motion.div key={ad.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4 shadow-card">
                <div className="flex gap-4">
                  <div className="w-36 shrink-0"><ImageCarousel images={ad.images} maxHeight="max-h-24" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{ad.title}</h3>
                          <Badge variant="secondary" className="text-xs">{ad.brand}</Badge>
                          {ad.active ? <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Active</Badge> : <Badge variant="secondary" className="text-xs">Paused</Badge>}
                          {ad.commentsEnabled ? <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs gap-1"><MessageCircle className="h-3 w-3" /> Comments On</Badge> : <Badge variant="secondary" className="text-xs gap-1"><MessageCircle className="h-3 w-3" /> Comments Off</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ad.description}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">CTA: {ad.ctaText}</Badge>
                          {ad.discount && <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20 gap-1"><Tag className="h-3 w-3" /> {ad.discount}</Badge>}
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">{ad.ctaLink}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex flex-col items-center gap-1 mr-2">
                          <Label className="text-[10px] text-muted-foreground">Active</Label>
                          <Switch checked={ad.active} onCheckedChange={() => toggleAd(ad.id)} />
                        </div>
                        <div className="flex flex-col items-center gap-1 mr-2">
                          <Label className="text-[10px] text-muted-foreground">Comments</Label>
                          <Switch checked={ad.commentsEnabled} onCheckedChange={() => toggleComments(ad.id)} />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteAd(ad.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{ad.impressions.toLocaleString()} impressions</span>
                      <span>{ad.clicks.toLocaleString()} clicks</span>
                      <span>{((ad.clicks / ad.impressions) * 100).toFixed(1)}% CTR</span>
                      <span className="text-green-600 font-medium">₹{ad.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
