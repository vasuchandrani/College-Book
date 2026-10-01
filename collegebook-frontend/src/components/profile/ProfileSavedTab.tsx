import FormattedContent from '@/components/FormattedContent';
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageSquare, Bookmark, Share2, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import { formatCount } from "@/lib/formatCount";
import { formatSmartDate } from "@/lib/dateUtils";

interface ProfileSavedTabProps {
  savedPostsList: any[];
  togglePostLike: (id: string) => void;
  togglePostSave: (id: string) => void;
  handleSharePost: (id: string) => void;
  savedPostsHasMore: boolean;
  savedSentinelRef: React.RefObject<HTMLDivElement>;
  savedPostsLoadingMore: boolean;
}

export function ProfileSavedTab({
  savedPostsList,
  togglePostLike,
  togglePostSave,
  handleSharePost,
  savedPostsHasMore,
  savedSentinelRef,
  savedPostsLoadingMore,
}: ProfileSavedTabProps) {
  const navigate = useNavigate();

  return (
    <TabsContent value="saved">
      <div className="max-w-2xl mx-auto space-y-4">
        {savedPostsList.length === 0 && (
          <Card className="p-8 text-center shadow-card">
            <p className="text-muted-foreground text-sm">No saved posts</p>
          </Card>
        )}
        {savedPostsList.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 sm:p-5 shadow-card hover:shadow-elevated transition-shadow">
              {/* Top Section: Author Profile Header */}
              <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <Link
                    to={`/student/${encodeURIComponent(post.authorHandle || post.author || post.authorName || "")}`}
                    className="shrink-0 transition-transform active:scale-95"
                  >
                    <Avatar className="h-10 w-10 border border-border">
                      {post.avatarUrl && (
                        <AvatarImage src={post.avatarUrl} alt={post.author || post.authorName} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {post.initials || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/student/${encodeURIComponent(post.authorHandle || post.author || post.authorName || "")}`}
                      className="font-semibold text-sm hover:text-primary hover:underline transition-colors block leading-tight truncate"
                    >
                      {post.author || post.authorName || "Student"}
                    </Link>
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-0.5">
                      {post.authorHandle && (
                        <span className="font-mono text-primary/90 font-medium">
                          @{post.authorHandle.replace(/^@/, "")}
                        </span>
                      )}
                      {post.authorHandle && (post.college || post.collegeName || post.course) && <span>•</span>}
                      {(post.college || post.collegeName || post.course) && (
                        <span className="truncate max-w-[200px] sm:max-w-xs">
                          {post.college || post.collegeName || post.course}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Full Width Body, Media, Actions */}
              <div className="w-full">
                {/* Multiline clickable post content */}
                <FormattedContent content={post.content} className="mt-1" truncateLength={1000} readMoreLink={`/post/${post.id}`} />

                {/* Saved Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mt-3">
                    <ImageCarousel images={post.images} />
                  </div>
                )}

                {/* Saved Post Video */}
                {post.videoUrl && (
                  <div className="mt-3">
                    <VideoPlayer videoUrl={post.videoUrl} videoId={post.videoUrl} />
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {post.tags.map((t: string) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                      >
                        #{t.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interactive Post Actions */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-border gap-2 flex-wrap">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePostLike(post.id)}
                      className={`gap-1.5 text-xs ${post.liked ? "text-red-500" : "text-muted-foreground"
                        }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${post.liked ? "fill-red-500" : ""
                          }`}
                      />
                      <span>{formatCount(post.likes)}</span>
                    </Button>

                    {post.commentsEnabled !== false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{formatCount(post.commentsCount)}</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePostSave(post.id)}
                      className="text-xs px-2.5 text-accent font-semibold"
                      title="Unsave post"
                    >
                      <Bookmark className="h-4 w-4 fill-current" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSharePost(post.id);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <span className="text-[10px] text-muted-foreground shrink-0 select-none ml-auto">
                    {formatSmartDate(post.createdAt || post.time || post.date)}
                  </span>
                </div>

              </div>
            </Card>
          </motion.div>
        ))}
        {savedPostsHasMore && savedPostsList.length > 0 && (
          <div ref={savedSentinelRef} className="py-4 flex justify-center">
            {savedPostsLoadingMore ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <span className="text-xs text-muted-foreground">Scroll to load more</span>
            )}
          </div>
        )}
      </div>
    </TabsContent>
  );
}
