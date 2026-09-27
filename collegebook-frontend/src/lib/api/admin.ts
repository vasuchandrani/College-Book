import { normalizeCourseShort } from './users';
import { formatSmartDate } from '@/lib/dateUtils';
import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from '@/types';
import type { Post, PageResponse } from './client';
import { request, clearAuthSession } from './client';

// Admin Dashboard & Management API Endpoints
// =========================================================================

export interface AdminStatsResponse {
  students?: number;
  posts?: number;
  teams?: number;
  ads?: number;
  activeAds?: number;
  totalUsers?: number;
  totalPosts?: number;
  totalRevenue?: number;
  totalImpressions?: number;
  totalClicks?: number;
}



export interface AdminCreateAdPayload {
  brand?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  ctaText?: string;
  ctaLink?: string;
  destinationUrl?: string;
  discount?: string;
  commentsEnabled?: boolean;
  allowComments?: boolean;
}

export interface AdminLoginPayload {
  username: string;
  password: string;
}

export const getAdminStats = async (): Promise<AdminStatsResponse> => {
  return await request<AdminStatsResponse>("/admin/stats");
};

export const adminGetAds = async (): Promise<AdData[]> => {
  return await request<AdData[]>("/admin/ads");
};

export const adminCreateAd = async (payload: AdminCreateAdPayload): Promise<AdData> => {
  return await request<AdData>("/admin/ads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const adminDeleteAd = async (id: string): Promise<void> => {
  return await request<void>(`/admin/ads/${id}`, {
    method: "DELETE",
  });
};

export const adminToggleAllAds = async (
  active: boolean
): Promise<{ success: boolean; active: boolean; message: string }> => {
  return await request<{ success: boolean; active: boolean; message: string }>(
    `/admin/ads/toggle-all?active=${active}`,
    {
      method: "PUT",
    }
  );
};

export const adminToggleAdStatus = async (
  id: string,
  active: boolean
): Promise<AdData> => {
  return await request<AdData>(`/admin/ads/${id}/status?active=${active}`, {
    method: "PUT",
  });
};

export const adminToggleAdComments = async (
  id: string,
  commentsEnabled: boolean
): Promise<AdData> => {
  return await request<AdData>(
    `/admin/ads/${id}/comments?commentsEnabled=${commentsEnabled}`,
    {
      method: "PUT",
    }
  );
};

export const adminGetCampusFeed = async (
  collegeId?: string,
  page: number = 0,
  size: number = 30
): Promise<PageResponse<FeedPost>> => {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (collegeId) query.set("collegeId", collegeId);
  const res = await request<PageResponse<any>>(`/admin/posts/feed?${query.toString()}`);
  const items: FeedPost[] = (res.items || []).map((post: any) => {
    const videoMedia = (post.media || []).find((m: any) => m.mediaType === "VIDEO");
    return {
      id: post.id,
      author: post.authorName || post.author || "Student Author",
      authorHandle: post.authorHandle,
      avatarUrl: post.avatarUrl,
      initials: post.initials || (post.authorName ? post.authorName.charAt(0) : "U"),
      course: normalizeCourseShort(post.courseName || post.course),
      college: post.collegeName || post.college || "Campus",
      time: formatSmartDate(post.createdAt || post.time),
      createdAt: post.createdAt,
      content: post.content || "",
      likes: post.likes || 0,
      liked: post.liked || false,
      commentsCount: post.commentsCount || 0,
      commentsEnabled: post.commentsEnabled !== false,
      saved: post.saved || false,
      tags: post.tags || [],
      images: post.images || [],
      media: post.media || [],
      videoUrl: videoMedia?.url || videoMedia?.videoId || post.videoUrl,
      isGlobal: post.global ?? post.isGlobal ?? true,
    };
  });
  return {
    ...res,
    items,
  };
};

export const adminGetExploreFeed = async (
  page: number = 0,
  size: number = 30
): Promise<PageResponse<FeedPost>> => {
  const res = await request<PageResponse<any>>(`/admin/posts/explore?page=${page}&size=${size}`);
  const items: FeedPost[] = (res.items || []).map((post: any) => {
    const videoMedia = (post.media || []).find((m: any) => m.mediaType === "VIDEO");
    return {
      id: post.id,
      author: post.authorName || post.author || "Student Author",
      authorHandle: post.authorHandle,
      avatarUrl: post.avatarUrl,
      initials: post.initials || (post.authorName ? post.authorName.charAt(0) : "U"),
      course: normalizeCourseShort(post.courseName || post.course),
      college: post.collegeName || post.college || "Campus",
      time: formatSmartDate(post.createdAt || post.time),
      createdAt: post.createdAt,
      content: post.content || "",
      likes: post.likes || 0,
      liked: post.liked || false,
      commentsCount: post.commentsCount || 0,
      commentsEnabled: post.commentsEnabled !== false,
      saved: post.saved || false,
      tags: post.tags || [],
      images: post.images || [],
      media: post.media || [],
      videoUrl: videoMedia?.url || videoMedia?.videoId || post.videoUrl,
      isGlobal: post.global ?? post.isGlobal ?? true,
    };
  });
  return {
    ...res,
    items,
  };
};

export const adminDeletePost = async (id: string): Promise<void> => {
  return await request<void>(`/admin/posts/${id}`, {
    method: "DELETE",
  });
};

export const adminLogin = async (
  credentials: Record<string, any>
): Promise<{ accessToken: string; user?: any;[key: string]: any }> => {
  const res = await request<{ accessToken: string; user?: any;[key: string]: any }>("/auth/admin-login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (res && res.accessToken) {
    sessionStorage.setItem("cb_admin_token", res.accessToken);
    if (res.user) {
      sessionStorage.setItem("cb_admin_user", JSON.stringify(res.user));
    }
    // Clean up any legacy persistent tokens
    localStorage.removeItem("cb_admin_token");
    localStorage.removeItem("cb_admin_user");
  }
  return res;
};

export const adminLogout = (): void => {
  sessionStorage.removeItem("cb_admin_token");
  sessionStorage.removeItem("cb_admin_user");
  localStorage.removeItem("cb_admin_token");
  localStorage.removeItem("cb_admin_user");
};

// ---------------------------------------------------------------------------
// Admin Data Management (Colleges, Courses, Branches)
// ---------------------------------------------------------------------------

export interface CollegeItem {
  id?: string;
  name: string;
  shortName: string;
  slug: string;
  city: string;
  state: string;
  logoUrl?: string;
  emailDomains: string[];
}

export interface CourseItem {
  id?: string;
  collegeId: string;
  name: string;
  shortName: string;
  durationYears: number;
}

export interface BranchItem {
  id?: string;
  courseId: string;
  name: string;
  shortName: string;
}

export const adminCreateCollege = async (payload: Partial<CollegeItem>): Promise<CollegeItem> => {
  return await request<CollegeItem>("/admin/colleges", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const adminGetColleges = async (): Promise<CollegeItem[]> => {
  return await request<CollegeItem[]>("/colleges");
};

export const adminUpdateCollege = async (id: string, payload: Partial<CollegeItem>): Promise<CollegeItem> => {
  return await request<CollegeItem>(`/admin/colleges/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const adminDeleteCollege = async (id: string): Promise<void> => {
  return await request<void>(`/admin/colleges/${id}`, {
    method: "DELETE",
  });
};

export const adminCreateCourse = async (payload: Partial<CourseItem>): Promise<CourseItem> => {
  return await request<CourseItem>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const adminUpdateCourse = async (id: string, payload: Partial<CourseItem>): Promise<CourseItem> => {
  return await request<CourseItem>(`/admin/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const adminDeleteCourse = async (id: string): Promise<void> => {
  return await request<void>(`/admin/courses/${id}`, {
    method: "DELETE",
  });
};

export const adminCreateBranch = async (payload: Partial<BranchItem>): Promise<BranchItem> => {
  return await request<BranchItem>("/admin/branches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const adminUpdateBranch = async (id: string, payload: Partial<BranchItem>): Promise<BranchItem> => {
  return await request<BranchItem>(`/admin/branches/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const adminDeleteBranch = async (id: string): Promise<void> => {
  return await request<void>(`/admin/branches/${id}`, {
    method: "DELETE",
  });
};

// ---------------------------------------------------------------------------