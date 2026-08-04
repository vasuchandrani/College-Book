import { useEffect, useState } from "react";
import { Heart, Bookmark, Share2, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ImageCarousel from "@/components/ImageCarousel";
import AdCard, { type AdData } from "@/components/AdCard";
import {
  getExplorePosts,
  getExploreAds,
  getTrendingTags,
  likePost as apiLikePost,
  savePost as apiSavePost,
} from "@/lib/api";
import type { ExplorePost } from "@/data/mock";

const ExplorePage = () => {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [ads, setAds] = useState<AdData[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    getExplorePosts().then(setPosts);
    getExploreAds().then(setAds);
    getTrendingTags().then(setTags);
  }, []);

  const toggleLike = (id: number) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)));
    apiLikePost(id);
  };

  const toggleSave = (id: number) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
    apiSavePost(id);
  };

  const filtered = posts.filter(p => {
    const matchesSearch = !search || p.content.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || p.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const getAdForSlot = (index: number) => ads[Math.floor(index / 5) % Math.max(ads.length, 1)];


  const renderFeed = () => {
    const items: React.ReactNode[] = [];
    filtered.forEach((post, i) => {
      items.push(
        <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
          <Card className="p-5 shadow-card hover:shadow-elevated transition-shadow">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{post.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <Link to={`/student/${encodeURIComponent(post.author)}`} className="font-semibold text-sm hover:text-primary hover:underline transition-colors">
                      {post.author}
                    </Link>
                    <span className="text-muted-foreground text-xs ml-2">{post.college}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
                <p className="text-sm mt-2 leading-relaxed">{post.content}</p>

                {post.images.length > 0 && (
                  <div className="mt-3"><ImageCarousel images={post.images} /></div>
                )}

                {post.videoUrl && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">🎬 Video attached — click to watch</p>
                )}

                <div className="flex gap-1.5 mt-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => toggleLike(post.id)} className={`gap-1.5 text-xs ${post.liked ? "text-red-500" : "text-muted-foreground"}`}>
                    <Heart className={`h-4 w-4 ${post.liked ? "fill-red-500" : ""}`} /> {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleSave(post.id)} className={`gap-1.5 text-xs ${post.saved ? "text-accent" : "text-muted-foreground"}`}>
                    <Bookmark className={`h-4 w-4 ${post.saved ? "fill-current" : ""}`} /> Save
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      );

      if ((i + 1) % 5 === 0 && i < filtered.length - 1) {
        const ad = getAdForSlot(i);
        items.push(
          <motion.div key={ad.id + "-" + i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <AdCard ad={ad} />
          </motion.div>
        );
      }
    });
    return items;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold mb-1">Explore</h1>
        <p className="text-muted-foreground text-sm">Discover ideas from students across all campuses</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search posts, people..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map(tag => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "secondary"}
            className={`cursor-pointer transition-colors ${selectedTag === tag ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
          >
            #{tag}
          </Badge>
        ))}
      </div>

      <div className="space-y-4">{renderFeed()}</div>
    </div>
  );
};

export default ExplorePage;
