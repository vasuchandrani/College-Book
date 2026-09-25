import { Skeleton } from "@/components/ui/skeleton";

/* ─── Post Card Skeleton ─── */
export const PostCardSkeleton = () => (
  <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-card">
    {/* Author row */}
    <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
    {/* Content lines */}
    <div className="space-y-2 mt-1">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-3.5 w-3/5" />
    </div>
    {/* Media placeholder (random height to look realistic) */}
    <Skeleton className="h-40 w-full mt-3 rounded-lg" />
    {/* Action row */}
    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
      <Skeleton className="h-7 w-16 rounded-md" />
      <Skeleton className="h-7 w-16 rounded-md" />
      <Skeleton className="h-7 w-16 rounded-md" />
      <Skeleton className="h-7 w-16 rounded-md ml-auto" />
    </div>
  </div>
);

/* ─── Post Card Skeleton without media (for variety) ─── */
export const PostCardSkeletonCompact = () => (
  <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-card">
    <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="space-y-2 mt-1">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-5/6" />
    </div>
    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
      <Skeleton className="h-7 w-16 rounded-md" />
      <Skeleton className="h-7 w-16 rounded-md" />
      <Skeleton className="h-7 w-16 rounded-md" />
      <Skeleton className="h-7 w-16 rounded-md ml-auto" />
    </div>
  </div>
);

/* ─── Feed Skeleton (multiple post cards) ─── */
export const FeedSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) =>
      i % 2 === 0 ? <PostCardSkeleton key={i} /> : <PostCardSkeletonCompact key={i} />
    )}
  </div>
);

/* ─── Single Post Detail Skeleton ─── */
export const PostDetailSkeleton = () => (
  <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
    {/* Back button */}
    <Skeleton className="h-8 w-20 rounded-md" />
    {/* Card */}
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-card">
      {/* Author */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      {/* Media */}
      <Skeleton className="h-64 w-full rounded-lg" />
      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md ml-auto" />
      </div>
      {/* Comments section */}
      <div className="space-y-3 pt-3 border-t border-border">
        <Skeleton className="h-4 w-24" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Profile Page Skeleton ─── */
export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-12 p-3 sm:p-4 md:p-6">
    {/* Profile header card */}
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 w-full">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-56" />
          <div className="flex gap-4 mt-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
    {/* Bio section */}
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card space-y-3">
      <Skeleton className="h-4 w-16" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
    </div>
    {/* Tabs */}
    <div className="flex gap-2">
      <Skeleton className="h-9 w-20 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-20 rounded-md" />
    </div>
    {/* Post skeletons */}
    <FeedSkeleton count={3} />
  </div>
);

/* ─── Collab Page Skeleton ─── */
export const CollabListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-20 ml-auto" />
        </div>
      </div>
    ))}
  </div>
);

export const CollabSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-4 p-3 sm:p-4 md:p-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-9 w-36 rounded-md" />
    </div>
    {/* Tabs */}
    <div className="flex gap-2">
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
    {/* Collab cards */}
    <CollabListSkeleton />
  </div>
);

/* ─── Collab Detail Skeleton ─── */
export const CollabDetailSkeleton = () => (
  <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
    <Skeleton className="h-8 w-20 rounded-md" />
    <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
      <Skeleton className="h-6 w-3/5" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3.5 w-3/5" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  </div>
);

/* ─── My Collaboration Page Skeleton ─── */
export const MyCollabSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-4 p-3 sm:p-4 md:p-6">
    <Skeleton className="h-7 w-52" />
    <div className="flex gap-2">
      <Skeleton className="h-9 w-28 rounded-md" />
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
    {[1, 2].map((i) => (
      <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-3">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

/* ─── Comment Skeleton (for inline comments loading) ─── */
export const CommentsSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3 py-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);
