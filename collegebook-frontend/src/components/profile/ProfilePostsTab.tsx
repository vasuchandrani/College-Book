import FormattedContent from '@/components/FormattedContent';
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Heart, MessageSquare, Bookmark, Share2, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import { formatCount } from "@/lib/formatCount";
import { formatSmartDate } from "@/lib/dateUtils";

interface ProfilePostsTabProps {
  activityPosts: any[];
  profile: any;
  initials: string;
  setPostToDelete: (id: string) => void;
  togglePostLike: (id: string) => void;
  togglePostSave: (id: string) => void;
  handleSharePost: (id: string) => void;
  activityPostsHasMore: boolean;
  activitySentinelRef: React.RefObject<HTMLDivElement>;
  activityPostsLoadingMore: boolean;
}

export function ProfilePostsTab({
  activityPosts,
  profile,
  initials,
  setPostToDelete,
  togglePostLike,
  togglePostSave,
  handleSharePost,
  activityPostsHasMore,
  activitySentinelRef,
  activityPostsLoadingMore,
}: ProfilePostsTabProps) {
  const navigate = useNavigate();

  return (
    <TabsContent value="posts">
      <div className="max-w-2xl mx-auto space-y-4">
        {activityPosts.length === 0 && (
          <Card className="p-8 text-center shadow-card">
            <p className="text-muted-foreground text-sm">No posts yet. Share something with your campus!</p>
          </Card>
        )}
        {activityPosts.map((post, i) => (
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
                  <Avatar className="h-10 w-10 border border-border shrink-0">
                    {profile.avatarUrl ? (
                      <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="font-semibold text-sm block leading-tight truncate">
                      {profile.name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-0.5">
                      {profile.handle && (
                        <span className="font-mono text-primary/90 font-medium">
                          @{profile.handle.replace(/^@/, "")}
                        </span>
                      )}
                      {profile.handle && (profile.courseName || profile.bio) && <span>•</span>}
                      {(profile.courseName || profile.bio) && (
                        <span className="truncate">{profile.courseName || profile.bio}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                  onClick={() => setPostToDelete(post.id)}
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Bottom Section: Full Width Body, Media, Actions */}
              <div className="w-full">
                {/* Multiline clickable post content */}
                <FormattedContent content={post.content} className="mt-1" truncateLength={1000} readMoreLink={`/post/${post.id}`} />

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mt-3">
                    <ImageCarousel images={post.images} />
                  </div>
                )}

                {/* Post Video */}
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
                      className={`text-xs px-2.5 ${post.saved ? "text-accent font-semibold" : "text-muted-foreground"
                        }`}
                      title={post.saved ? "Unsave post" : "Save post"}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${post.saved ? "fill-current" : ""
                          }`}
                      />
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
        {activityPostsHasMore && activityPosts.length > 0 && (
          <div ref={activitySentinelRef} className="py-4 flex justify-center">
            {activityPostsLoadingMore ? (
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
