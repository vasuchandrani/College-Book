import { useState } from "react";
import { Heart, MessageCircle, ExternalLink, Megaphone, Send, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ImageCarousel from "./ImageCarousel";
import type { AdData } from "@/types";

export type { AdData };

interface AdCardProps {
  ad: AdData;
}

interface Comment {
  id: number;
  author: string;
  initials: string;
  text: string;
  time: string;
}

const AdCard = ({ ad }: AdCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 200) + 20);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, author: "Ananya S.", initials: "AS", text: "Love this collection! 🔥", time: "2h ago" },
    { id: 2, author: "Rohan M.", initials: "RM", text: "Great deal for students!", time: "4h ago" },
  ]);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(l => liked ? l - 1 : l + 1);
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    setComments([{ id: Date.now(), author: "You", initials: "YO", text: commentText, time: "Just now" }, ...comments]);
    setCommentText("");
  };

  return (
    <Card className="shadow-card overflow-hidden border-dashed border-muted-foreground/20">
      <div className="relative">
        <ImageCarousel images={ad.images} maxHeight="max-h-64" />
        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-foreground text-xs gap-1 z-10">
          <Megaphone className="h-3 w-3" /> Sponsored
        </Badge>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{ad.brand}</span>
          <span className="text-xs text-muted-foreground">• Promoted</span>
        </div>
        <h3 className="font-semibold text-base mb-1">{ad.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{ad.description}</p>

        {ad.discount && (
          <div className="flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 w-fit">
            <Tag className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-600">{ad.discount}</span>
          </div>
        )}
        
        <a href={ad.ctaLink} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            {ad.ctaText} <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>

        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={toggleLike}
            className={`gap-1.5 text-xs ${liked ? "text-red-500" : "text-muted-foreground"}`}>
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} /> {likes}
          </Button>
          {ad.commentsEnabled && (
            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}
              className="gap-1.5 text-xs text-muted-foreground">
              <MessageCircle className="h-4 w-4" /> {comments.length}
            </Button>
          )}
        </div>

        {ad.commentsEnabled && showComments && (
          <div className="mt-3 pt-3 border-t border-border space-y-3">
            <div className="flex gap-2">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">YO</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} className="h-8 text-xs" />
                <Button size="icon" className="h-8 w-8 shrink-0 bg-primary text-primary-foreground" onClick={addComment} disabled={!commentText.trim()}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground text-[9px] font-semibold">{c.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{c.author}</span>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdCard;
