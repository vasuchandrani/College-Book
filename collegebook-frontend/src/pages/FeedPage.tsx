import { useEffect, useRef, useState } from "react";
import { Heart, Bookmark, Share2, MoreHorizontal, Image as ImageIcon, Send, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ImageCarousel from "@/components/ImageCarousel";
import AdCard, { type AdData } from "@/components/AdCard";
import {
  getFeedPosts,
  getFeedAds,
  getFeedTags,
  createPost,
  likePost as apiLikePost,
  savePost as apiSavePost,
} from "@/lib/api";
import type { FeedPost as Post } from "@/data/mock";

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [ads, setAds] = useState<AdData[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = JSON.parse(localStorage.getItem("cb_user") || '{"name":"You","initials":"YO","college":"IIT Delhi","collegeShort":"IIT-D","course":"B.Tech"}');
  const collegeShort = user.collegeShort || "IIT-D";

  useEffect(() => {
    getFeedPosts().then(setPosts);
    getFeedAds().then(setAds);
    getFeedTags().then(setTags);
  }, []);

  const toggleLike = (id: number) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)));
    apiLikePost(id);
  };

  const toggleSave = (id: number) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
    apiSavePost(id);
  };


  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map(f => URL.createObjectURL(f));
      setNewImages(prev => [...prev, ...urls]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!newPost.trim() && newImages.length === 0) return;
    const post = await createPost({
      author: user.name || "You",
      initials: user.initials || "YO",
      course: user.course || "B.Tech",
      content: newPost,
      images: newImages,
    });
    setPosts([post, ...posts]);
    setNewPost("");
    setNewImages([]);
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
                    <span className="text-muted-foreground text-xs ml-2">{post.course}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                  </div>
                </div>
                <p className="text-sm mt-2 leading-relaxed">{post.content}</p>

                {post.images.length > 0 && (
                  <div className="mt-3">
                    <ImageCarousel images={post.images} />
                  </div>
                )}

                {post.videoUrl && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">🎬 Video attached — click to watch</p>
                )}

                {post.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">#{tag}</span>
                    ))}
                  </div>
                )}
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
        <h1 className="text-2xl font-bold mb-1">Campus Feed</h1>
        <p className="text-muted-foreground text-sm">What's happening at {collegeShort}</p>
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

      <Card className="p-4 mb-6 shadow-card">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{user.initials || "YO"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea placeholder="Share an idea, achievement, or opportunity..." value={newPost} onChange={(e) => setNewPost(e.target.value)} className="min-h-[80px] border-none shadow-none resize-none p-0 focus-visible:ring-0 text-sm" />

            {newImages.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {newImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt="" className="h-16 w-16 object-cover rounded-md" />
                    <button
                      onClick={() => setNewImages(newImages.filter((_, j) => j !== idx))}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="h-4 w-4" /> Photo
                </Button>
              </div>
              <Button size="sm" onClick={handlePost} disabled={!newPost.trim() && newImages.length === 0} className="bg-gradient-hero text-primary-foreground gap-1.5">
                <Send className="h-3.5 w-3.5" /> Post
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">{renderFeed()}</div>
    </div>
  );
};

export default FeedPage;
