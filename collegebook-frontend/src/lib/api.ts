/**
 * Centralized HTTP / API layer for CollegeBook.
 *
 * All frontend requests go through the single HTTP wrapper `request()`.
 * Signatures and return types are strictly preserved.
 */

import type { FeedPost, ExplorePost, AdData, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto } from "@/types";
export type { FeedPost, ExplorePost, AdData, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto };
import { appConfig } from "@/config/app.config";
import { formatSmartDate } from "@/lib/dateUtils";
import { checkIsMessageUnread } from "@/lib/chatUnread";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export const API_BASE_URL = appConfig.apiBaseUrl;

const NETWORK_DELAY_MS = appConfig.mockLatencyMs;

const delay = <T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export class ApiError extends Error {
  code?: string;
  status: number;
  field?: string;
  timestamp?: string;
  path?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
    field?: string,
    timestamp?: string,
    path?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.field = field;
    this.timestamp = timestamp;
    this.path = path;
  }
}

/**
 * Returns a human-friendly error message from any API error.
 */
export function formatApiError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!err) return fallback;

  if (err instanceof ApiError) {
    switch (err.code) {
      case "USER_ALREADY_EXISTS":
      case "EMAIL_ALREADY_EXISTS":
        return "An account with this email already exists. Please sign in instead.";
      case "USER_NOT_FOUND":
        return err.message || "No account found with this email. Please check the address or sign up.";
      case "INVALID_OTP":
        return "The 6-digit verification code is incorrect. Please check your email and try again.";
      case "OTP_EXPIRED":
        return "The verification code has expired. Please click Resend to get a new code.";
      case "MAX_OTP_ATTEMPTS":
      case "OTP_MAX_ATTEMPTS":
        return "Too many invalid attempts. Please request a new verification code.";
      case "INVALID_CREDENTIALS":
        return "Incorrect email or password. Please verify your credentials.";
      case "INVALID_EMAIL_DOMAIN":
      case "DOMAIN_NOT_ALLOWED":
        return "Please use your official college-provided email address.";
      case "FILE_TOO_LARGE":
        return "The selected file exceeds the maximum allowed size.";
      case "INVALID_FILE_TYPE":
        return "The selected file format is not supported.";
      case "OTP_COOLDOWN_ACTIVE":
        return err.message || "Please wait 5 minutes before requesting another verification code.";
      case "OTP_LIMIT_REACHED":
        return err.message || "Maximum verification requests reached for this email. Please try again in an hour.";
      case "RATE_LIMIT_EXCEEDED":
        return err.message || "Too many requests. Please slow down and try again in a moment.";
      case "EMAIL_DELIVERY_FAILED":
        return err.message || "Unable to send verification email. Please verify your address and try again shortly.";
      default:
        if (err.message && !err.message.startsWith("{") && !err.message.startsWith("API ")) {
          return err.message;
        }
        return fallback;
    }
  }

  if (err instanceof Error) {
    let msg = err.message || "";
    if (msg.includes("{") && msg.includes("}")) {
      try {
        const jsonStart = msg.indexOf("{");
        const jsonEnd = msg.lastIndexOf("}") + 1;
        const parsed = JSON.parse(msg.slice(jsonStart, jsonEnd));
        if (parsed?.message) return parsed.message;
      } catch {
        // fallback
      }
    }
    if (msg.startsWith("API ")) {
      msg = msg.replace(/^API\s+\d+:\s*/, "");
    }
    return msg || fallback;
  }

  return typeof err === "string" ? err : fallback;
}

/**
 * Thin fetch wrapper to call the Spring Boot backend.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;

  // Intercept write operations for the demo@collegebook.edu guest user
  const method = init.method?.toUpperCase() || "GET";
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    let isGuest = false;
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("cb_user") : null;
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.email?.trim().toLowerCase() === "demo@collegebook.edu") {
          isGuest = true;
        }
      }
    } catch {}

    if (isGuest) {
      const isAllowedAuth =
        path.includes("/auth/login") ||
        path.includes("/auth/signup") ||
        path.includes("/auth/refresh") ||
        path.includes("/auth/logout");
      if (!isAllowedAuth) {
        throw new ApiError(
          "Write operations are disabled in demo mode. Please register for a full student account to participate.",
          403,
          "GUEST_RESTRICTION"
        );
      }
    }
  }

  const cleanBaseUrl = (API_BASE_URL || "/api/v1").replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${cleanBaseUrl}${cleanPath}`;

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });

    // Auto-retry once on 429 Too Many Requests with backoff
    if (res.status === 429) {
      const retryAfterSec = parseInt(res.headers.get("Retry-After") || "1", 10);
      const delayMs = Math.min(Math.max(isNaN(retryAfterSec) ? 1 : retryAfterSec, 1) * 1000, 2500);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      res = await fetch(fullUrl, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init.headers ?? {}),
        },
      });
    }
  } catch (networkError: any) {
    throw new ApiError(
      "Unable to connect to the server. Please check your internet connection.",
      0,
      "NETWORK_ERROR"
    );
  }

  if (!res.ok) {
    let message = res.statusText || `Request failed with status ${res.status}`;
    let code: string | undefined;
    let field: string | undefined;
    let timestamp: string | undefined;
    let reqPath: string | undefined;

    try {
      const data = await res.json();
      if (data && typeof data === "object") {
        message = data.message || data.error || data.detail || message;
        code = data.code;
        field = data.field;
        timestamp = data.timestamp;
        reqPath = data.path;
      } else if (typeof data === "string") {
        message = data;
      }
    } catch {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {
        // use fallback message
      }
    }

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cb_token");
        localStorage.removeItem("cb_refresh_token");
        localStorage.removeItem("cb_user");
        localStorage.removeItem("cb_profile");
        const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
        const currentPath = window.location.pathname;
        if (!publicPaths.includes(currentPath)) {
          window.location.replace("/");
        }
      }
    }

    throw new ApiError(message, res.status, code, field, timestamp, reqPath);
  }

  return (res.status === 204 ? (undefined as T) : await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginPayload { email: string; password: string; }
export interface SignupPayload {
  name: string;
  handle?: string;
  email: string;
  password: string;
  collegeId?: string;
  courseId?: string;
  departmentId?: string;
  currentYear?: number;
  gender?: string;
  college?: string;
  course?: string;
  department?: string;
  year?: string;
}
export interface AuthUser {
  id?: string;
  userId?: string;
  name: string;
  fullName?: string;
  handle?: string;
  avatarUrl?: string;
  initials: string;
  email: string;
  college: string;
  collegeShort: string;
  course: string;
  department?: string;
  currentYear?: number;
  defaultBio?: string;
  role?: string;
}

export const login = async (payload: LoginPayload): Promise<AuthUser> => {
  const res = await request<{
    success?: boolean;
    message?: string;
    code?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id?: string;
      email: string;
      username?: string;
      collegeName?: string;
      collegeShortName?: string;
      profile?: {
        fullName?: string;
        handle?: string;
        avatarUrl?: string;
        collegeName?: string;
        collegeShortName?: string;
        courseName?: string;
        currentYear?: number;
        defaultBio?: string;
      };
    };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res && (res.success === false || !res.accessToken)) {
    throw new ApiError(
      res.message || "Incorrect email or password. Please verify your credentials.",
      200,
      res.code || "INVALID_CREDENTIALS"
    );
  }

  if (res.accessToken) {
    localStorage.setItem("cb_token", res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem("cb_refresh_token", res.refreshToken);
    }
  }

  const fullName = res.user?.profile?.fullName || "User";
  const initials = fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const collegeName = res.user?.collegeName || res.user?.profile?.collegeName || "DDU";
  const collegeShort = res.user?.collegeShortName || res.user?.profile?.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((p) => p[0]).join(""));
  const rawHandle = res.user?.profile?.handle || res.user?.username || payload.email.split("@")[0];
  const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;

  return {
    id: res.user?.id,
    userId: res.user?.id,
    name: fullName,
    fullName: fullName,
    handle,
    initials: initials || "U",
    email: res.user?.email || payload.email,
    avatarUrl: res.user?.profile?.avatarUrl,
    college: collegeName,
    collegeShort: collegeShort,
    course: res.user?.profile?.courseName || "Student",
    currentYear: res.user?.profile?.currentYear,
    defaultBio: res.user?.profile?.defaultBio,
  };
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem("cb_refresh_token");
  if (refreshToken) {
    await request<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  localStorage.removeItem("cb_token");
  localStorage.removeItem("cb_refresh_token");
  localStorage.removeItem("cb_user");
  localStorage.removeItem("cb_profile");
  if (typeof window !== "undefined") {
    window.location.replace("/");
  }
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  return await request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
  });
};

/// ---------------------------------------------------------------------------
// Feed & Explore
// ---------------------------------------------------------------------------

export interface PaginatedPostsResponse<T> {
  posts: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export const getFeedPosts = async (
  page = 0,
  size = 15,
  tag?: string
): Promise<PaginatedPostsResponse<FeedPost>> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (tag) params.set("tag", tag.replace(/^#/, ""));

  const res = await request<PageResponse<any>>(`/feed?${params.toString()}`);
  const posts = (res.items || []).map((post) => {
    const videoMedia = (post.media || []).find((m: any) => m.mediaType === "VIDEO");
    return {
      id: post.id,
      author: post.authorName,
      authorHandle: post.authorHandle,
      avatarUrl: post.avatarUrl,
      initials: post.initials,
      course: normalizeCourseShort(post.courseName),
      college: post.collegeName,
      time: formatSmartDate(post.createdAt || post.time),
      createdAt: post.createdAt,
      content: post.content,
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
    posts,
    page: res.page ?? page,
    size: res.size ?? size,
    totalItems: res.totalItems ?? posts.length,
    totalPages: res.totalPages ?? 1,
    hasNext: res.hasNext ?? (posts.length === size),
  };
};

export const getExplorePosts = async (
  page = 0,
  size = 15,
  tag?: string
): Promise<PaginatedPostsResponse<ExplorePost>> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (tag) params.set("tag", tag.replace(/^#/, ""));

  const res = await request<PageResponse<any>>(`/explore?${params.toString()}`);
  const posts = (res.items || []).map((post) => {
    const videoMedia = (post.media || []).find((m: any) => m.mediaType === "VIDEO");
    return {
      id: post.id,
      author: post.authorName,
      authorHandle: post.authorHandle,
      avatarUrl: post.avatarUrl,
      initials: post.initials,
      college: post.collegeName || "College",
      time: formatSmartDate(post.createdAt || post.time),
      createdAt: post.createdAt,
      content: post.content,
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
    posts,
    page: res.page ?? page,
    size: res.size ?? size,
    totalItems: res.totalItems ?? posts.length,
    totalPages: res.totalPages ?? 1,
    hasNext: res.hasNext ?? (posts.length === size),
  };
};

export const getStudentPosts = async (
  slug: string,
  page = 0,
  size = 15
): Promise<PaginatedPostsResponse<FeedPost>> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  const res = await request<PageResponse<any>>(
    `/students/${encodeURIComponent(slug)}/posts?${params.toString()}`
  );
  const posts = (res.items || []).map((post) => {
    const videoMedia = (post.media || []).find((m: any) => m.mediaType === "VIDEO");
    return {
      id: post.id,
      author: post.authorName,
      authorHandle: post.authorHandle,
      avatarUrl: post.avatarUrl,
      initials: post.initials,
      course: normalizeCourseShort(post.courseName),
      college: post.collegeName,
      time: formatSmartDate(post.createdAt || post.time),
      createdAt: post.createdAt,
      content: post.content,
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
    posts,
    page: res.page ?? page,
    size: res.size ?? size,
    totalItems: res.totalItems ?? posts.length,
    totalPages: res.totalPages ?? 1,
    hasNext: res.hasNext ?? (posts.length === size),
  };
};

export const getFeedTags = async (): Promise<string[]> => {
  return await request<string[]>("/tags/trending");
};

export const getTrendingTags = async (): Promise<string[]> => {
  return await request<string[]>("/tags/trending");
};

export interface MediaKeyPayload {
  objectKey?: string;
  mediaType: "IMAGE" | "VIDEO" | string;
  storageProvider?: "R2" | "CLOUDFLARE_STREAM" | string;
  videoId?: string;
  url?: string;
}

export interface CreatePostPayload {
  author?: string;
  initials?: string;
  course?: string;
  content: string;
  images?: string[];
  mediaKeys?: MediaKeyPayload[];
  tags?: string[];
  isGlobal?: boolean;
  commentsEnabled?: boolean;
}

export const createPost = async (payload: CreatePostPayload): Promise<FeedPost> => {
  const post = await request<any>("/posts", {
    method: "POST",
    body: JSON.stringify({
      content: payload.content,
      images: payload.images || [],
      mediaKeys: payload.mediaKeys || [],
      tags: payload.tags || [],
      isGlobal: payload.isGlobal !== undefined ? payload.isGlobal : true,
      commentsEnabled: payload.commentsEnabled !== undefined ? payload.commentsEnabled : true,
    }),
  });
  const videoMedia = (post.media || []).find((m: any) => m.mediaType === "VIDEO");
  return {
    id: post.id,
    author: post.authorName,
    authorHandle: post.authorHandle,
    avatarUrl: post.avatarUrl,
    initials: post.initials,
    course: normalizeCourseShort(post.courseName),
    college: post.collegeName,
    time: formatSmartDate(post.createdAt || post.time),
    createdAt: post.createdAt,
    content: post.content,
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
};

export const likePost = async (postId: number | string, signal?: AbortSignal) => {
  return await request<{ id: string; liked: boolean; likesCount: number }>("/posts/" + postId + "/like", { method: "POST", signal });
};

export const savePost = async (postId: number | string, signal?: AbortSignal) => {
  return await request<{ id: string; saved: boolean; savesCount: number }>("/posts/" + postId + "/save", { method: "POST", signal });
};

export const getPostById = async (postId: number | string): Promise<FeedPost> => {
  const post = await request<any>("/posts/" + postId);
  const videoMedia = (post.media || []).find((m: any) => m.mediaType === "VIDEO");
  return {
    id: post.id,
    author: post.authorName,
    authorHandle: post.authorHandle,
    avatarUrl: post.avatarUrl,
    initials: post.initials,
    course: normalizeCourseShort(post.courseName),
    college: post.collegeName,
    time: formatSmartDate(post.createdAt || post.time),
    createdAt: post.createdAt,
    content: post.content,
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
};

export const sharePostLink = async (postId: number | string): Promise<{ success: boolean; url: string }> => {
  const url = `${window.location.origin}/post/${postId}`;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return { success: true, url };
    }
  } catch (e) {
    // ignore and fallback
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return { success: true, url };
  } catch (err) {
    return { success: false, url };
  }
};

export const deletePost = async (postId: number | string) => {
  await request<void>("/posts/" + postId, { method: "DELETE" });
  return { id: postId, deleted: true as const };
};

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Ads
// ---------------------------------------------------------------------------

export const getFeedAds = async (): Promise<AdData[]> => {
  try {
    return await request<AdData[]>("/ads/feed");
  } catch (e) {
    return [];
  }
};

export const getExploreAds = async (): Promise<AdData[]> => {
  try {
    return await request<AdData[]>("/ads/explore");
  } catch (e) {
    return [];
  }
};

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export interface CommentPayload {
  postId: number | string;
  body: string;
}

export const getComments = async (
  postId: number | string,
  page = 0,
  size = 50
): Promise<PostComment[]> => {
  const res = await request<PageResponse<any>>(`/posts/${postId}/comments?page=${page}&size=${size}`);
  return (res.items || []).map((c: any) => ({
    id: c.id,
    postId,
    author: c.authorName,
    authorHandle: c.authorHandle,
    avatarUrl: c.avatarUrl,
    initials: c.initials || "U",
    collegeName: c.collegeName,
    collegeShortName: c.collegeShortName,
    body: c.body,
    time: c.time || "Just now",
    createdAt: c.createdAt,
  }));
};

export const addComment = async (payload: CommentPayload): Promise<PostComment> => {
  const c = await request<any>(`/posts/${payload.postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body: payload.body }),
  });
  return {
    id: c.id,
    postId: payload.postId,
    author: c.authorName,
    authorHandle: c.authorHandle,
    avatarUrl: c.avatarUrl,
    initials: c.initials || "U",
    collegeName: c.collegeName,
    collegeShortName: c.collegeShortName,
    body: c.body,
    time: formatSmartDate(c.createdAt || c.time),
    createdAt: c.createdAt,
  };
};

export const deleteComment = async (postId: number | string, commentId: string): Promise<void> => {
  await request<void>(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
};

// ---------------------------------------------------------------------------
// Collab Hub Project Discussions
// ---------------------------------------------------------------------------

export const getTeamDiscussions = async (
  teamId: string,
  page = 0,
  size = 50
): Promise<TeamDiscussion[]> => {
  const res = await request<PageResponse<any>>(`/teams/${teamId}/discussions?page=${page}&size=${size}`);
  return (res.items || []).map((d: any) => ({
    id: d.id,
    teamId: d.teamId || teamId,
    authorId: d.authorId,
    authorName: d.authorName,
    authorHandle: d.authorHandle,
    avatarUrl: d.avatarUrl,
    initials: d.initials || "U",
    collegeName: d.collegeName,
    collegeShortName: d.collegeShortName,
    body: d.body,
    time: d.time || "Just now",
    createdAt: d.createdAt,
  }));
};

export const addTeamDiscussion = async (
  teamId: string,
  body: string
): Promise<TeamDiscussion> => {
  const d = await request<any>(`/teams/${teamId}/discussions`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return {
    id: d.id,
    teamId: d.teamId || teamId,
    authorId: d.authorId,
    authorName: d.authorName,
    authorHandle: d.authorHandle,
    avatarUrl: d.avatarUrl,
    initials: d.initials || "U",
    collegeName: d.collegeName,
    collegeShortName: d.collegeShortName,
    body: d.body,
    time: formatSmartDate(d.createdAt || d.time),
    createdAt: d.createdAt,
  };
};

export const deleteTeamDiscussion = async (
  teamId: string,
  discussionId: string
): Promise<{ message: string }> => {
  return await request<{ message: string }>(`/teams/${teamId}/discussions/${discussionId}`, {
    method: "DELETE",
  });
};

export const getSavedPosts = async (): Promise<FeedPost[]> => {
  const res = await request<PageResponse<any>>("/saved-posts");
  return (res.items || []).map((post) => {
    const videoMedia = (post.media || []).find((m: any) => m.mediaType === "VIDEO");
    return {
      id: post.id,
      author: post.authorName,
      authorHandle: post.authorHandle,
      avatarUrl: post.avatarUrl,
      initials: post.initials,
      course: normalizeCourseShort(post.courseName),
      college: post.collegeName,
      time: post.time || "Just now",
      content: post.content,
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
};

export const getMyPosts = async (): Promise<FeedPost[]> => {
  const res = await request<PageResponse<any>>("/my-posts");
  return (res.items || []).map((post) => {
    const videoMedia = (post.media || []).find((m: any) => m.mediaType === "VIDEO");
    return {
      id: post.id,
      author: post.authorName,
      authorHandle: post.authorHandle,
      avatarUrl: post.avatarUrl,
      initials: post.initials,
      course: normalizeCourseShort(post.courseName),
      college: post.collegeName,
      time: post.time || "Just now",
      content: post.content,
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
};

export const getStarredProjects = async (): Promise<any[]> => {
  try {
    return await request<any[]>("/teams/starred");
  } catch (e) {
    return [];
  }
};

export const unstarProject = async (projectId: number | string, signal?: AbortSignal) => {
  return await request<any>(`/teams/${projectId}/star`, {
    method: "POST",
    signal,
  });
};

// ---------------------------------------------------------------------------
// Collab Hub
// ---------------------------------------------------------------------------

export const getCollabTeams = async (type?: "PROJECT" | "HACKATHON" | "OPEN_SOURCE") => {
  const query = type ? `?type=${type}` : "";
  const res = await request<PageResponse<any>>(`/teams${query}`);
  return res.items || [];
};

export const getStudentTeams = async (userId: string) => {
  try {
    return await request<any[]>(`/teams/user/${userId}`);
  } catch (e) {
    return [];
  }
};

export const getTeamById = async (teamId: string | number) => {
  return await request<any>(`/teams/${teamId}`);
};

export interface CreateTeamPayload {
  title: string;
  type: "project" | "hackathon" | "open_source" | "PROJECT" | "HACKATHON" | "OPEN_SOURCE";
  description?: string;
  githubLink?: string;
  skills: string[];
  requiredRoles?: string[];
  requiredExpertise?: string[];
  maxMembers: number;
  memberHandles?: string[];
}
export const createTeam = async (payload: CreateTeamPayload) => {
  return await request<unknown>("/teams", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      type: payload.type.toUpperCase(),
    }),
  });
};

export const deleteTeam = async (teamId: number | string) => {
  return await request<{ message: string }>("/teams/" + teamId, {
    method: "DELETE",
  });
};

export const addTeamMember = async (teamId: number | string, handle: string) => {
  return await request<any>("/teams/" + teamId + "/members", {
    method: "POST",
    body: JSON.stringify({ handle }),
  });
};

export const removeTeamMember = async (teamId: number | string, memberUserId: string) => {
  return await request<any>("/teams/" + teamId + "/members/" + memberUserId, {
    method: "DELETE",
  });
};

export const deleteJoinRequest = async (requestId: number | string) => {
  return await request<{ message: string }>("/join-requests/" + requestId, {
    method: "DELETE",
  });
};

export const sendJoinRequest = async (teamId: number | string, role: string, message: string) => {
  return await request<unknown>("/teams/" + teamId + "/join", {
    method: "POST",
    body: JSON.stringify({ role, message }),
  });
};

export const respondJoinRequest = async (requestId: number | string, accept: boolean) => {
  return await request<unknown>("/join-requests/" + requestId, {
    method: "PATCH",
    body: JSON.stringify({ accept }),
  });
};

export const markProjectComplete = async (projectId: number | string) => {
  return await request<unknown>("/teams/" + projectId + "/complete", {
    method: "PATCH",
  });
};

export const starProject = async (projectId: number | string, signal?: AbortSignal) => {
  return await request<{ id: string; starred: boolean; starsCount: number }>("/teams/" + projectId + "/star", {
    method: "POST",
    signal,
  });
};

export const toggleStarTeam = async (projectId: number | string, signal?: AbortSignal) => {
  return await request<{ id: string; starred: boolean; starsCount: number }>("/teams/" + projectId + "/star", {
    method: "POST",
    signal,
  });
};

export const getMyTeams = async (type?: string) => {
  const query = type ? `?type=${type}` : "";
  return await request<any[]>("/teams/my" + query);
};

export const getMyCreatedTeams = getMyTeams;

export const getMyOpenSourceProjects = async () => {
  return await request<any[]>("/teams/my/open-source");
};

export const getMyJoinRequests = async () => {
  return await request<any[]>("/join-requests/my");
};

export const getMyJoinedRequests = getMyJoinRequests;

export const getTeamJoinRequests = async (teamId: string | number) => {
  return await request<any[]>(`/teams/${teamId}/requests`);
};

export const getMyIncomingRequests = async () => {
  return await request<any[]>("/teams/my/incoming-requests");
};

export const getIncomingJoinRequests = getMyIncomingRequests;

export interface CollabBadgeCounts {
  totalCount: number;
  recruitingCount: number;
  formedCount: number;
  openSourceCount: number;
  pendingRequestsCount: number;
}

let collabBadgePromise: Promise<CollabBadgeCounts> | null = null;

export const getCollabBadgeCounts = async (forceRefresh = false): Promise<CollabBadgeCounts> => {
  if (!forceRefresh) {
    const cached = clientCache.get<CollabBadgeCounts>("collab_badge_counts");
    if (cached !== null && cached !== undefined) return cached;
  }

  if (collabBadgePromise) return collabBadgePromise;

  collabBadgePromise = (async () => {
    try {
      const res = await request<CollabBadgeCounts>("/teams/my/badge-count").catch(() => null);
      if (res && typeof res.totalCount === "number") {
        clientCache.set("collab_badge_counts", res, 30_000);
        return res;
      }

      // Safe fallback calculation
      const [requests, teams] = await Promise.all([
        getMyIncomingRequests().catch(() => []),
        getMyCreatedTeams().catch(() => []),
      ]);

      const pendingReqCount = (requests || []).filter(
        (r: any) => String(r.status).toUpperCase() === "PENDING"
      ).length;

      let user: any = {};
      try {
        user = JSON.parse(localStorage.getItem("cb_user") || "{}");
      } catch {}

      let recruitingUnread = 0;
      let formedUnread = 0;
      let openSourceUnread = 0;

      if (Array.isArray(teams) && teams.length > 0) {
        await Promise.all(
          teams.map(async (t: any) => {
            if (!t?.id) return;
            try {
              const msgs = await getTeamRecentMessages(t.id, 1);
              if (msgs && msgs.length > 0) {
                const latest = msgs[msgs.length - 1];
                const isUnread = checkIsMessageUnread(
                  t.id,
                  latest.createdAt,
                  latest.senderId,
                  user.id || user.userId,
                  latest.senderName,
                  user.name || user.fullName,
                  latest.senderHandle,
                  user.handle
                );
                if (isUnread) {
                  if (t.type === "OPEN_SOURCE" || t.type === "open_source") {
                    openSourceUnread++;
                  } else if (t.completed || t.isCompleted) {
                    formedUnread++;
                  } else {
                    recruitingUnread++;
                  }
                }
              }
            } catch {}
          })
        );
      }

      const recruitingTotal = pendingReqCount + recruitingUnread;
      const grandTotal = recruitingTotal + formedUnread + openSourceUnread;
      const fallbackResult: CollabBadgeCounts = {
        totalCount: grandTotal,
        recruitingCount: recruitingTotal,
        formedCount: formedUnread,
        openSourceCount: openSourceUnread,
        pendingRequestsCount: pendingReqCount,
      };
      clientCache.set("collab_badge_counts", fallbackResult, 30_000);
      return fallbackResult;
    } finally {
      collabBadgePromise = null;
    }
  })();

  return collabBadgePromise;
};

export const getCollabBadgeCount = async (forceRefresh = false): Promise<number> => {
  const data = await getCollabBadgeCounts(forceRefresh);
  return data?.totalCount || 0;
};

export const markRoomAsReadApi = async (teamId: string): Promise<void> => {
  if (!teamId) return;
  try {
    await request<void>(`/teams/${teamId}/chat/read`, { method: "POST" });
    clientCache.delete("collab_badge_counts");
  } catch {
    // Non-blocking
  }
};

export const updateJoinRequestStatus = async (
  requestId: string | number,
  status: "ACCEPTED" | "REJECTED" | "PENDING"
) => {
  return await request<any>(`/join-requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({
      accept: status === "ACCEPTED",
      status,
    }),
  });
};

export const updateJoinRequest = async (
  requestId: string | number,
  payload: { role?: string; message?: string } | string,
  maybeMessage?: string
) => {
  const body = typeof payload === "string" ? { role: payload, message: maybeMessage || "" } : payload;
  return await request<any>(`/join-requests/${requestId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export interface UpdateTeamPayload {
  title: string;
  type?: "OPEN_SOURCE" | "HACKATHON" | "PROJECT" | "open_source" | "hackathon" | "project";
  description?: string;
  githubLink?: string;
  skills?: string[];
  requiredRoles?: string[];
  requiredExpertise?: string[];
  maxMembers?: number;
}

export const updateTeam = async (
  teamId: string | number,
  payload: UpdateTeamPayload | Partial<CreateTeamPayload> | any
) => {
  return await request<any>(`/teams/${teamId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const markHiringComplete = async (teamId: string | number) => {
  return await request<any>(`/teams/${teamId}/complete`, {
    method: "PATCH",
  });
};

// ---------------------------------------------------------------------------
// myCon Badges (No backend integration rule)
// ---------------------------------------------------------------------------

export const getBadges = () => delay<unknown[]>([]);

export interface BadgeProofPayload {
  badgeTag: string; proofType: string; proofLink: string; notes?: string;
}
export const submitBadgeProof = (payload: BadgeProofPayload) => {
  throw new Error("We will introduce it soon");
};

// ---------------------------------------------------------------------------
// Mobile / push (Capacitor)
// ---------------------------------------------------------------------------

export const registerPushToken = (token: string, platform: string) =>
  delay<{ ok: true }>({ ok: true });

// ---------------------------------------------------------------------------
// Colleges & signup verification
// ---------------------------------------------------------------------------

export const checkHandleAvailability = async (
  handle: string
): Promise<{ handle: string; available: boolean; message: string }> => {
  const clean = handle.trim().replace(/^@/, "");
  return await request<{ handle: string; available: boolean; message: string }>(
    `/auth/check-handle?handle=${encodeURIComponent(clean)}`
  );
};

export const signup = async (payload: SignupPayload): Promise<AuthUser> => {
  const res = await request<{
    accessToken: string;
    refreshToken: string;
    user: {
      id?: string;
      email: string;
      profile?: {
        fullName?: string;
        handle?: string;
        collegeName?: string;
        courseName?: string;
        currentYear?: number;
        defaultBio?: string;
      };
    };
  }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      fullName: payload.name,
      handle: payload.handle ? payload.handle.trim().toLowerCase().replace(/^@/, "") : undefined,
      collegeId: payload.collegeId,
      courseId: payload.courseId,
      departmentId: payload.departmentId,
      currentYear: payload.currentYear,
      gender: payload.gender || "PREFER_NOT_TO_SAY",
    }),
  });

  if (res.accessToken) {
    localStorage.setItem("cb_token", res.accessToken);
    localStorage.setItem("cb_refresh_token", res.refreshToken);
  }

  const fullName = res.user?.profile?.fullName || payload.name;
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const collegeName = res.user?.profile?.collegeName || payload.college || "DDU";
  const collegeShort = collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((p) => p[0]).join("");

  return {
    id: res.user?.id,
    name: fullName,
    handle: res.user?.profile?.handle || payload.handle,
    initials: initials || "U",
    email: res.user.email,
    college: collegeName,
    collegeShort: collegeShort,
    course: res.user.profile?.courseName || payload.course || "Student",
    currentYear: res.user.profile?.currentYear || payload.currentYear,
    defaultBio: res.user.profile?.defaultBio,
  };
};

export const getColleges = async () => {
  const data = await request<
    { id: string; name: string; shortName: string; emailDomains: string[] }[]
  >("/colleges");

  return data.map((c, idx) => ({
    id: idx + 1,
    uuid: c.id,
    name: c.name,
    short: c.shortName,
    emailDomain: c.emailDomains?.[0] || "",
  }));
};

export interface Course {
  id: string;
  name: string;
  shortName: string;
  durationYears: number;
}

export interface Department {
  id: string;
  courseId: string;
  name: string;
  shortName?: string;
}

export const getCoursesByCollege = async (collegeUuid: string): Promise<Course[]> => {
  return await request<Course[]>(`/colleges/${collegeUuid}/courses`);
};

export const getDepartmentsByCourse = async (courseId: string): Promise<Department[]> => {
  return await request<Department[]>(`/colleges/courses/${courseId}/departments`);
};

export interface CollegeRequestPayload {
  collegeName: string;
  city?: string;
  state?: string;
  requesterEmail: string;
  requesterName?: string;
  notes?: string;
}

export const submitCollegeRequest = async (payload: CollegeRequestPayload) => {
  return await request<CollegeRequestPayload>("/colleges/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export interface SendOtpResponse {
  sent: boolean;
  userExists?: boolean;
  message?: string;
}

export const sendOtp = async (
  email: string,
  purpose = "SIGNUP"
): Promise<SendOtpResponse> => {
  const res = await request<SendOtpResponse>("/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });
  return res;
};

export const verifyOtp = async (
  email: string,
  code: string,
  purpose = "SIGNUP"
): Promise<{ verified: boolean }> => {
  const res = await request<{ verified: boolean }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, code, purpose }),
  });

  if (!res.verified) {
    throw new Error("Invalid or expired OTP code");
  }
  return { verified: true };
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  return await request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: token.trim(), newPassword: password }),
  });
};

export const lookupStudent = async (handleOrName: string) => {
  const clean = handleOrName.trim().replace(/^@/, "");
  return await request<{
    exists: boolean;
    student?: {
      userId: string;
      fullName: string;
      handle: string;
      collegeName: string;
      courseName: string;
      avatarUrl?: string;
    };
    message?: string;
  }>(`/students/verify-member?query=${encodeURIComponent(clean)}`);
};

export const getStudentProfile = async (slug: string) => {
  const clean = slug.trim().replace(/^@/, "");
  return await request<{
    userId: string;
    fullName: string;
    handle: string;
    collegeName: string;
    courseName: string;
    avatarUrl?: string;
  }>(`/students/${encodeURIComponent(clean)}`);
};
export const getBadgeSubmissions = () => delay<unknown[]>([]);

// ---------------------------------------------------------------------------
// Admin Dashboard & Ads Management
// ---------------------------------------------------------------------------

export interface AdminStatsResponse {
  totalUsers: number;
  totalPosts: number;
  activeAds: number;
  totalRevenue: number;
  totalImpressions?: number;
  totalClicks?: number;
}

export const getAdminStats = async (): Promise<AdminStatsResponse> => {
  try {
    const stats = await request<Record<string, number>>("/admin/stats");
    return {
      totalUsers: stats.totalUsers ?? stats.students ?? 0,
      totalPosts: stats.totalPosts ?? stats.posts ?? 0,
      activeAds: stats.activeAds ?? stats.ads ?? 0,
      totalRevenue: stats.totalRevenue ?? 0,
      totalImpressions: stats.totalImpressions ?? 0,
      totalClicks: stats.totalClicks ?? 0,
    };
  } catch {
    return { totalUsers: 0, totalPosts: 0, activeAds: 0, totalRevenue: 0, totalImpressions: 0, totalClicks: 0 };
  }
};

export interface CreateAdPayload {
  brand: string;
  title: string;
  description: string;
  imageUrls: string[];
  ctaText: string;
  ctaLink: string;
  discount?: string;
  commentsEnabled?: boolean;
}

export const adminCreateAd = async (payload: CreateAdPayload): Promise<AdData> => {
  return await request<AdData>("/admin/ads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const adminDeleteAd = async (adId: string): Promise<void> => {
  await request<void>(`/admin/ads/${adId}`, {
    method: "DELETE",
  });
};

// ---------------------------------------------------------------------------
// Media Storage (AWS S3 / Cloudflare R2 for images/files, Stream for videos)
// ---------------------------------------------------------------------------

export interface PresignedUploadResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  storageProvider?: string;
}

export interface VideoUploadResponse {
  uploadUrl: string;
  videoId: string;
}

/**
 * Request presigned upload URL for Object Storage (AWS S3 / Cloudflare R2).
 */
export const requestPresignedUpload = async (
  fileName: string,
  contentType: string,
  fileSizeBytes: number,
  mediaContext: "POST_IMAGE" | "AVATAR" | "DOCUMENT" = "POST_IMAGE"
): Promise<PresignedUploadResponse> => {
  return await request<PresignedUploadResponse>("/storage/presign-upload", {
    method: "POST",
    body: JSON.stringify({
      fileName,
      contentType,
      fileSizeBytes,
      mediaContext,
    }),
  });
};

/**
 * Request direct creator upload URL for Cloudflare Stream (videos).
 */
export const requestVideoStreamUpload = async (
  fileName: string,
  contentType: string,
  fileSizeBytes: number
): Promise<VideoUploadResponse> => {
  return await request<VideoUploadResponse>("/storage/video-upload", {
    method: "POST",
    body: JSON.stringify({
      fileName,
      contentType,
      fileSizeBytes,
      mediaContext: "POST_VIDEO",
    }),
  });
};

/**
 * Direct upload to Object Storage (AWS S3 / Cloudflare R2) using presigned PUT URL.
 * Bypasses backend server and avoids sending large files through Spring Boot.
 */
export const uploadFileToStorage = async (
  presignedUrl: string,
  file: File | Blob,
  contentType: string
): Promise<void> => {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Direct storage upload failed: ${res.status} ${res.statusText}`);
  }
};

/**
 * @deprecated Use uploadFileToStorage instead.
 */
export const uploadFileToR2 = uploadFileToStorage;

/**
 * Direct upload to Cloudflare Stream using creator upload URL.
 * Uploads directly from browser to Cloudflare Stream.
 */
export const uploadVideoToStream = async (
  uploadUrl: string,
  file: File | Blob
): Promise<void> => {
  // Try FormData upload first
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok && res.status !== 200 && res.status !== 204) {
    // If POST FormData failed, try TUS PATCH protocol / direct binary body
    const binRes = await fetch(uploadUrl, {
      method: "PATCH",
      headers: {
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": "0",
        "Content-Type": "application/offset+octet-stream",
      },
      body: file,
    });
    if (!binRes.ok && binRes.status !== 200 && binRes.status !== 204) {
      throw new Error(`Stream upload failed: ${res.status} ${res.statusText}`);
    }
  }
};

// ---------------------------------------------------------------------------
// Profile & Campus
// ---------------------------------------------------------------------------

export const normalizeCourseShort = (
  courseName?: string,
  courseShortName?: string,
  departmentName?: string
): string => {
  const parseDept = (text?: string): string => {
    if (!text) return "";
    const t = text.trim();
    const lower = t.toLowerCase();
    if (lower.includes("information technology") || lower === "it") return "IT";
    if (lower.includes("computer science & engineering") || lower.includes("computer science and engineering") || lower === "cse" || lower.includes("computer science")) return "CSE";
    if (lower.includes("computer engineering") || lower === "ce") return "CE";
    if (lower.includes("artificial intelligence") || lower.includes("ai-ml") || lower.includes("ai/ml") || lower === "ai") return "AI-ML";
    if (lower.includes("data science") || lower === "ds") return "Data Science";
    if (lower.includes("electronics & communication") || lower.includes("electronics and communication") || lower === "ec" || lower === "ece") return "EC";
    if (lower.includes("electrical") || lower === "ee") return "EE";
    if (lower.includes("mechanical") || lower === "me") return "ME";
    if (lower.includes("civil")) return "Civil";
    if (lower.includes("chemical")) return "Chemical";
    if (lower.includes("instrumentation & control") || lower.includes("instrumentation and control") || lower === "ic") return "IC";
    if (lower.includes("biomedical") || lower === "bm") return "Biomedical";
    if (lower.includes("aerospace")) return "Aerospace";
    if (lower.includes("metallurg")) return "Metallurgy";
    if (lower.includes("textile")) return "Textile";
    if (lower.includes("pharmacy")) return "Pharmacy";
    if (lower.includes("dental")) return "Dental";
    return t;
  };

  const parseDegree = (text?: string): string => {
    if (!text) return "";
    const t = text.trim();
    const lower = t.toLowerCase();
    if (lower.includes("bachelor of technology") || lower.startsWith("b.tech") || lower.startsWith("btech")) return "B.Tech";
    if (lower.includes("master of technology") || lower.startsWith("m.tech") || lower.startsWith("mtech")) return "M.Tech";
    if (lower.includes("bachelor of engineering") || lower.startsWith("b.e") || lower.startsWith("be")) return "B.E.";
    if (lower.includes("master of engineering") || lower.startsWith("m.e") || lower.startsWith("me")) return "M.E.";
    if (lower.includes("bachelor of computer application") || lower.startsWith("bca")) return "BCA";
    if (lower.includes("master of computer application") || lower.startsWith("mca")) return "MCA";
    if (lower.includes("bachelor of business administration") || lower.startsWith("bba")) return "BBA";
    if (lower.includes("master of business administration") || lower.startsWith("mba")) return "MBA";
    if (lower.includes("bachelor of science") || lower.startsWith("b.sc") || lower.startsWith("bsc")) return "B.Sc";
    if (lower.includes("master of science") || lower.startsWith("m.sc") || lower.startsWith("msc")) return "M.Sc";
    if (lower.includes("bachelor of pharmacy") || lower.startsWith("b.pharm") || lower.startsWith("bpharm")) return "B.Pharm";
    if (lower.includes("master of pharmacy") || lower.startsWith("m.pharm") || lower.startsWith("mpharm")) return "M.Pharm";
    if (lower.includes("bachelor of dental surgery") || lower.startsWith("bds")) return "BDS";
    if (lower.includes("doctor of philosophy") || lower.startsWith("phd")) return "PhD";
    return t;
  };

  const rawCombined = `${courseShortName || ""} ${courseName || ""} ${departmentName || ""}`.trim();
  if (!rawCombined) return "Student";

  const degree = parseDegree(courseShortName || courseName);
  let dept = parseDept(departmentName);

  // If department wasn't passed directly, check if courseName contains department info (e.g. "B.Tech IT", "B.Tech CE", "Bachelor of Technology - Computer Engineering")
  if (!dept && courseName) {
    const withoutDegree = courseName
      .replace(/bachelor of technology/gi, "")
      .replace(/master of technology/gi, "")
      .replace(/bachelor of engineering/gi, "")
      .replace(/master of engineering/gi, "")
      .replace(/bachelor of computer applications?/gi, "")
      .replace(/master of computer applications?/gi, "")
      .replace(/bachelor of business administration/gi, "")
      .replace(/master of business administration/gi, "")
      .replace(/bachelor of science/gi, "")
      .replace(/master of science/gi, "")
      .replace(/bachelor of pharmacy/gi, "")
      .replace(/bachelor of dental surgery/gi, "")
      .replace(/doctor of philosophy/gi, "")
      .replace(/^b\.?tech/i, "")
      .replace(/^m\.?tech/i, "")
      .replace(/^b\.?e\.?/i, "")
      .replace(/^m\.?e\.?/i, "")
      .replace(/^bca/i, "")
      .replace(/^mca/i, "")
      .replace(/^bba/i, "")
      .replace(/^mba/i, "")
      .replace(/^b\.?sc/i, "")
      .replace(/^m\.?sc/i, "")
      .replace(/^b\.?pharm/i, "")
      .replace(/^bds/i, "")
      .replace(/^phd/i, "")
      .replace(/[\(\)\-\–\—\:\,]/g, " ")
      .trim();

    if (withoutDegree) {
      dept = parseDept(withoutDegree);
    }
  }

  if (degree && dept) {
    if (degree.toLowerCase().includes(dept.toLowerCase())) return degree;
    return `${degree} ${dept}`;
  }

  if (degree) return degree;
  if (dept) return dept;
  return "Student";
};

export interface UserProfileData {
  userId: string;
  handle: string;
  name: string;
  fullName: string;
  initials: string;
  collegeId?: string;
  college: string;
  collegeName: string;
  collegeShort: string;
  collegeShortName: string;
  collegeSlug?: string;
  courseId?: string;
  course: string;
  courseName: string;
  courseShortName?: string;
  departmentId?: string;
  department?: string;
  departmentName?: string;
  departmentShortName?: string;
  currentYear?: number;
  defaultBio: string;
  bioExtra?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  memoryBookEmail?: string;
  customLinks?: string;
  contactDetails?: string;
  isPublic?: boolean;
}

export interface PublicStudentProfile {
  id?: string;
  userId: string;
  handle?: string;
  slug: string;
  fullName: string;
  name: string;
  initials: string;
  courseId?: string;
  courseName: string;
  courseShortName?: string;
  departmentId?: string;
  departmentName?: string;
  departmentShortName?: string;
  collegeName: string;
  collegeShortName?: string;
  currentYear?: number;
  defaultBio: string;
  bio?: string;
  bioExtra?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  customLinks?: string;
  contactDetails?: string;
}

export interface ProfileHeaderData {
  userId: string;
  handle: string;
  name: string;
  fullName: string;
  initials: string;
  gender?: string;
  collegeId?: string;
  college: string;
  collegeName: string;
  collegeShort: string;
  collegeShortName: string;
  collegeSlug?: string;
  courseId?: string;
  course: string;
  courseName: string;
  courseShortName: string;
  departmentId?: string;
  department?: string;
  departmentName?: string;
  departmentShortName?: string;
  currentYear?: number;
  defaultBio: string;
  avatarUrl?: string;
  isPublic: boolean;
}

export interface ProfileAboutData {
  userId: string;
  bioExtra?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  memoryBookEmail?: string;
  customLinks?: string;
  contactDetails?: string;
}

export interface PublicStudentHeaderData {
  userId: string;
  handle: string;
  slug: string;
  name: string;
  fullName: string;
  initials: string;
  courseName: string;
  courseShortName?: string;
  departmentName?: string;
  departmentShortName?: string;
  collegeName: string;
  collegeShortName?: string;
  collegeSlug?: string;
  currentYear?: number;
  defaultBio: string;
  avatarUrl?: string;
}

export interface PublicStudentAboutData {
  userId: string;
  handle: string;
  bioExtra?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  customLinks?: string;
  contactDetails?: string;
}

export const getMyProfileHeader = async (): Promise<ProfileHeaderData> => {
  const p = await request<any>("/profiles/me/header");
  const collegeName = p.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    gender: p.gender,
    collegeId: p.collegeId,
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    courseId: p.courseId,
    course: shortCourse,
    courseName: shortCourse,
    courseShortName: shortCourse,
    departmentId: p.departmentId,
    department: p.departmentName,
    departmentName: p.departmentName,
    departmentShortName: p.departmentShortName,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    avatarUrl: p.avatarUrl,
    isPublic: p.public !== undefined ? p.public : true,
  };
};

export const getMyProfileAbout = async (): Promise<ProfileAboutData> => {
  const p = await request<any>("/profiles/me/about");
  return {
    userId: p.userId,
    bioExtra: p.bioExtra || "",
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
  };
};

export const getStudentHeaderBySlug = async (slug: string): Promise<PublicStudentHeaderData> => {
  const p = await request<any>(`/students/${encodeURIComponent(slug)}/header`);
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);
  return {
    userId: p.userId,
    handle: p.handle || p.slug || slug,
    slug: p.slug || p.handle || slug,
    fullName: p.fullName || "Student",
    name: p.fullName || "Student",
    initials: p.initials || "U",
    courseName: shortCourse,
    courseShortName: shortCourse,
    departmentName: p.departmentName,
    departmentShortName: p.departmentShortName,
    collegeName: p.collegeName || "Dharmsinh Desai University",
    collegeShortName: p.collegeShortName || "DDU",
    collegeSlug: p.collegeSlug,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    avatarUrl: p.avatarUrl,
  };
};

export const getStudentAboutBySlug = async (slug: string): Promise<PublicStudentAboutData> => {
  const p = await request<any>(`/students/${encodeURIComponent(slug)}/about`);
  return {
    userId: p.userId,
    handle: p.handle || slug,
    bioExtra: p.bioExtra || "",
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
  };
};

export const getProfile = async (): Promise<UserProfileData> => {
  const p = await request<any>("/profiles/me");
  const collegeName = p.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    collegeId: p.collegeId,
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    courseId: p.courseId,
    course: shortCourse,
    courseName: shortCourse,
    courseShortName: shortCourse,
    departmentId: p.departmentId,
    department: p.departmentName,
    departmentName: p.departmentName,
    departmentShortName: p.departmentShortName,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    bioExtra: p.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
    isPublic: p.public,
  };
};

export const updateProfile = async (data: Partial<UserProfileData>): Promise<UserProfileData> => {
  const p = await request<any>("/profiles/me", {
    method: "PATCH",
    body: JSON.stringify({
      fullName: data.fullName || data.name,
      courseId: data.courseId,
      departmentId: data.departmentId,
      currentYear: data.currentYear,
      defaultBio: data.defaultBio,
      bioExtra: data.bioExtra,
      avatarUrl: data.avatarUrl,
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
      websiteUrl: data.websiteUrl,
      customLinks: data.customLinks,
      contactDetails: data.contactDetails,
      isPublic: data.isPublic,
    }),
  });
  const collegeName = p.collegeName || data.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    collegeId: p.collegeId || data.collegeId,
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    courseId: p.courseId || data.courseId,
    course: normalizeCourseShort(p.courseName, p.courseShortName) || data.course || "Student",
    courseName: normalizeCourseShort(p.courseName, p.courseShortName) || data.courseName || "Student",
    courseShortName: normalizeCourseShort(p.courseName, p.courseShortName) || data.courseShortName || "Student",
    departmentId: p.departmentId || data.departmentId,
    department: p.departmentName || data.department,
    departmentName: p.departmentName || data.departmentName,
    departmentShortName: p.departmentShortName || data.departmentShortName,
    currentYear: p.currentYear !== undefined ? p.currentYear : data.currentYear,
    defaultBio: p.defaultBio || data.defaultBio || "",
    bioExtra: p.bioExtra || data.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
    isPublic: p.public !== undefined ? p.public : data.isPublic,
  };
};

export const sendPasswordChangeOtp = async (): Promise<{ message: string }> => {
  return request<{ message: string }>("/auth/password/change-otp/send", {
    method: "POST",
  });
};

export const changePasswordWithOtp = async (otp: string, newPassword: string): Promise<{ message: string }> => {
  return request<{ message: string }>("/auth/password/change-with-otp", {
    method: "POST",
    body: JSON.stringify({ otp, newPassword }),
  });
};

export const sendMemoryBookOtp = async (email: string): Promise<{ message: string }> => {
  return request<{ message: string }>("/profiles/me/memory-book-email/otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const verifyMemoryBookEmail = async (email: string, otp: string): Promise<UserProfileData> => {
  const p = await request<any>("/profiles/me/memory-book-email/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  const collegeName = p.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    course: shortCourse,
    courseName: shortCourse,
    courseShortName: shortCourse,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    bioExtra: p.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
    isPublic: p.public,
  };
};

export const removeMemoryBookEmail = async (): Promise<UserProfileData> => {
  const p = await request<any>("/profiles/me/memory-book-email", {
    method: "DELETE",
  });
  const collegeName = p.collegeName || "Dharmsinh Desai University";
  const collegeShort = p.collegeShortName || (collegeName === "Dharmsinh Desai University" ? "DDU" : collegeName.split(" ").map((w: string) => w[0]).join(""));
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);

  return {
    userId: p.userId,
    handle: p.handle || "",
    name: p.fullName || "User",
    fullName: p.fullName || "User",
    initials: p.initials || "U",
    college: collegeName,
    collegeName: collegeName,
    collegeShort: collegeShort,
    collegeShortName: collegeShort,
    collegeSlug: p.collegeSlug,
    course: shortCourse,
    courseName: shortCourse,
    courseShortName: shortCourse,
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    bioExtra: p.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    memoryBookEmail: p.memoryBookEmail || "",
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
    isPublic: p.public,
  };
};

export const getStudentBySlug = async (slug: string): Promise<PublicStudentProfile> => {
  const p = await request<any>(`/students/${encodeURIComponent(slug)}`);
  const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);
  return {
    id: p.userId,
    userId: p.userId,
    handle: p.handle || p.slug || slug,
    slug: p.slug || p.handle || slug,
    fullName: p.fullName || "Student",
    name: p.fullName || "Student",
    initials: p.initials || "U",
    courseName: shortCourse,
    courseShortName: shortCourse,
    departmentName: p.departmentName,
    departmentShortName: p.departmentShortName,
    collegeName: p.collegeName || "Dharmsinh Desai University",
    collegeShortName: p.collegeShortName || "DDU",
    currentYear: p.currentYear,
    defaultBio: p.defaultBio || "",
    bio: p.bioExtra || p.defaultBio || "",
    bioExtra: p.bioExtra || "",
    avatarUrl: p.avatarUrl,
    githubUrl: p.githubUrl,
    linkedinUrl: p.linkedinUrl,
    websiteUrl: p.websiteUrl,
    customLinks: p.customLinks,
    contactDetails: p.contactDetails,
  };
};

export const getCampusStudents = async (): Promise<PublicStudentProfile[]> => {
  const list = await request<any[]>("/campus/students");
  if (!Array.isArray(list)) return [];
  return list.map((p) => {
    const shortCourse = normalizeCourseShort(p.courseName, p.courseShortName);
    return {
      id: p.userId,
      userId: p.userId,
      handle: p.handle || p.slug || "",
      slug: p.slug || p.handle || "",
      fullName: p.fullName || "Student",
      name: p.fullName || "Student",
      initials: p.initials || "U",
      courseName: shortCourse,
      courseShortName: shortCourse,
      departmentName: p.departmentName,
      departmentShortName: p.departmentShortName,
      collegeName: p.collegeName || "Dharmsinh Desai University",
      collegeShortName: p.collegeShortName || "DDU",
      currentYear: p.currentYear,
      defaultBio: p.defaultBio || "",
      bio: p.bioExtra || p.defaultBio || "",
      bioExtra: p.bioExtra || "",
      avatarUrl: p.avatarUrl,
      githubUrl: p.githubUrl,
      linkedinUrl: p.linkedinUrl,
      websiteUrl: p.websiteUrl,
    };
  });
};

// ---------------------------------------------------------------------------
// Media & Storage Uploads
// ---------------------------------------------------------------------------

export const uploadImageFile = async (
  file: File,
  mediaContext = "POST_IMAGE"
): Promise<{ objectKey: string; publicUrl?: string; url?: string; storageProvider?: string }> => {
  try {
    const presigned = await request<{
      uploadUrl: string;
      objectKey: string;
      publicUrl: string;
      storageProvider?: string;
    }>("/storage/presign-upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "image/jpeg",
        fileSizeBytes: file.size,
        mediaContext,
      }),
    });

    if (!presigned.uploadUrl) {
      throw new Error("Failed to upload media. Please try again after some time.");
    }

    const putRes = await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error("Failed to upload media. Please try again after some time.");
    }

    return {
      objectKey: presigned.objectKey,
      publicUrl: presigned.publicUrl,
      url: presigned.publicUrl,
      storageProvider: presigned.storageProvider || "S3",
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw new Error(err.message || "Failed to upload media. Please try again after some time.");
    }
    throw new Error(err?.message || "Failed to upload media. Please try again after some time.");
  }
};

export const uploadVideoFile = async (
  file: File
): Promise<{ videoId: string; objectKey: string; url: string; publicUrl: string; storageProvider: string }> => {
  try {
    const presigned = await request<{
      uploadUrl: string;
      objectKey?: string;
      videoId?: string;
      publicUrl?: string;
      storageProvider?: string;
    }>("/storage/presign-upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "video/mp4",
        fileSizeBytes: file.size,
        mediaContext: "POST_VIDEO",
      }),
    });

    if (!presigned.uploadUrl) {
      throw new Error("Failed to upload media. Please try again after some time.");
    }

    const putRes = await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "video/mp4",
      },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error("Failed to upload media. Please try again after some time.");
    }

    const key = presigned.objectKey || presigned.videoId || "";
    const resolvedUrl = presigned.publicUrl || "";

    return {
      videoId: key,
      objectKey: key,
      url: resolvedUrl,
      publicUrl: resolvedUrl,
      storageProvider: presigned.storageProvider || "S3",
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw new Error(err.message || "Failed to upload media. Please try again after some time.");
    }
    throw new Error(err?.message || "Failed to upload media. Please try again after some time.");
  }
};

// =========================================================================
// Team Room Chat API Endpoints
// =========================================================================

export const getTeamChatMessages = async (
  teamId: string,
  limit: number = 50
): Promise<TeamChatMessage[]> => {
  return await request<TeamChatMessage[]>(`/teams/${teamId}/chat/messages?size=${limit}`);
};

export const getTeamRecentMessages = getTeamChatMessages;

export const getPagedTeamChatMessages = async (
  teamId: string,
  page: number = 0,
  size: number = 50
): Promise<PageResponse<TeamChatMessage>> => {
  return await request<PageResponse<TeamChatMessage>>(
    `/teams/${teamId}/chat/messages?paged=true&page=${page}&size=${size}`
  );
};

export const sendTeamChatMessage = async (
  teamId: string,
  content: string,
  messageType: string = "TEXT",
  mediaUrl?: string
): Promise<TeamChatMessage> => {
  return await request<TeamChatMessage>(`/teams/${teamId}/chat/messages`, {
    method: "POST",
    body: JSON.stringify({
      content,
      messageType,
      mediaUrl,
    }),
  });
};

export const deleteTeamChatMessage = async (
  teamId: string,
  messageId: string
): Promise<void> => {
  return await request<void>(`/teams/${teamId}/chat/messages/${messageId}`, {
    method: "DELETE",
  });
};

export const getRoomChatMembers = async (
  teamId: string
): Promise<ChatUser[]> => {
  return await request<ChatUser[]>(`/teams/${teamId}/chat/members`);
};
