/**
 * BACKEND INTEGRATION
 * ------------------------------------------------------------------
 * This page renders mock data today. When the Spring Boot API is live,
 * replace the local state seeds with these calls from the single HTTP layer:
 *
 *   import { getAdminStats, adminCreateAd, adminDeleteAd } from "@/lib/api";
 *
 *   useEffect(() => {
 *     let alive = true;
 *     setLoading(true);
 *     getAdminStats()
 *       .then((data) => alive && setData(data))
 *       .catch((e) => alive && setError(e.message))
 *       .finally(() => alive && setLoading(false));
 *     return () => { alive = false; };
 *   }, []);
 *
 * Never call fetch/axios here — `src/lib/api.ts` is the only HTTP file.
 */
import { useState } from "react";
import { BarChart3, Users, Newspaper, Megaphone, Plus, Trash2, Eye, LogOut, BookOpen, TrendingUp, DollarSign, MessageCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ImageCarousel from "@/components/ImageCarousel";

interface Ad {
  id: number;
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

const initialAds: Ad[] = [
  { id: 1, brand: "Nike", title: "Just Do It — Campus Edition", description: "Gear up for the semester with Nike's student exclusive collection.", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=300&fit=crop", "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=300&fit=crop"], ctaText: "Shop Now", ctaLink: "https://nike.com", active: true, commentsEnabled: true, discount: "20% off with college ID", impressions: 12400, clicks: 890, revenue: 4450 },
  { id: 2, brand: "Adidas", title: "Ultraboost for Students", description: "Run further, study harder. Adidas Ultraboost with exclusive campus colorways.", images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=300&fit=crop", "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=300&fit=crop"], ctaText: "Explore", ctaLink: "https://adidas.com", active: true, commentsEnabled: true, discount: "15% student discount", impressions: 9800, clicks: 720, revenue: 3600 },
  { id: 3, brand: "H&M", title: "Campus Style Guide 2025", description: "Fresh styles for the new semester. Starting at ₹499.", images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop"], ctaText: "Browse Collection", ctaLink: "https://hm.com", active: true, commentsEnabled: false, discount: "Flat ₹200 off on ₹999+", impressions: 8200, clicks: 610, revenue: 3050 },
  { id: 4, brand: "Puma", title: "Puma x College Drops", description: "Limited edition sneakers for campus lifestyle.", images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=300&fit=crop"], ctaText: "Get Yours", ctaLink: "https://puma.com", active: true, commentsEnabled: true, discount: "", impressions: 6500, clicks: 480, revenue: 2400 },
  { id: 5, brand: "Rado", title: "Time for Excellence", description: "Celebrate milestones with Rado.", images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=300&fit=crop"], ctaText: "Discover", ctaLink: "https://rado.com", active: false, commentsEnabled: true, discount: "15% off for toppers", impressions: 3200, clicks: 190, revenue: 950 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [newAd, setNewAd] = useState({ brand: "", title: "", description: "", imageUrls: "", ctaText: "Shop Now", ctaLink: "", commentsEnabled: true, discount: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = {
    totalUsers: 2847,
    totalPosts: 1293,
    activeAds: ads.filter(a => a.active).length,
    totalRevenue: ads.reduce((s, a) => s + a.revenue, 0),
    totalImpressions: ads.reduce((s, a) => s + a.impressions, 0),
    totalClicks: ads.reduce((s, a) => s + a.clicks, 0),
  };

  const toggleAd = (id: number) => setAds(ads.map(a => a.id === id ? { ...a, active: !a.active } : a));
  const toggleComments = (id: number) => setAds(ads.map(a => a.id === id ? { ...a, commentsEnabled: !a.commentsEnabled } : a));
  const deleteAd = (id: number) => setAds(ads.filter(a => a.id !== id));

  const createAd = () => {
    const images = newAd.imageUrls.split("\n").map(u => u.trim()).filter(Boolean);
    if (!newAd.brand || !newAd.title || images.length === 0) return;
    setAds([{
      id: Date.now(), brand: newAd.brand, title: newAd.title, description: newAd.description,
      images, ctaText: newAd.ctaText || "Shop Now", ctaLink: newAd.ctaLink || "#",
      active: true, commentsEnabled: newAd.commentsEnabled, discount: newAd.discount,
      impressions: 0, clicks: 0, revenue: 0,
    }, ...ads]);
    setNewAd({ brand: "", title: "", description: "", imageUrls: "", ctaText: "Shop Now", ctaLink: "", commentsEnabled: true, discount: "" });
    setDialogOpen(false);
  };

  const handleLogout = () => { localStorage.removeItem("cb_user"); navigate("/login"); };

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
              <DialogHeader><DialogTitle>Create New Ad</DialogTitle></DialogHeader>
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
