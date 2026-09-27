import { normalizeCourseShort } from './users';
import { formatSmartDate } from '@/lib/dateUtils';
import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from '@/types';
import type { Post, PageResponse } from './client';
import { request, clearAuthSession } from './client';

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

export const normalizeCollegeShort = (
  collegeName?: string | null,
  collegeShortName?: string | null
): string => {
  if (collegeShortName && collegeShortName.trim().length > 0) {
    return collegeShortName.trim();
  }
  if (!collegeName) return "College";

  // Remove location like ", Nadiad"
  const beforeComma = collegeName.split(",")[0].trim();

  // Exclude common joining words
  const excludeWords = new Set(["of", "and", "in", "the", "for", "at"]);

  const words = beforeComma.split(/\s+/).filter(w => w.length > 0 && !excludeWords.has(w.toLowerCase()));

  if (words.length > 1) {
    return words.map(w => w[0].toUpperCase()).join("");
  }
  return beforeComma;
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
      collegeShortName: normalizeCollegeShort(post.collegeName, post.collegeShortName),
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
  const posts = (res.content || res.items || []).map((post) => {
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
    page: res.number ?? res.page ?? page,
    size: res.size ?? size,
    totalItems: res.totalElements ?? res.totalItems ?? posts.length,
    totalPages: res.totalPages ?? 1,
    hasNext: res.number !== undefined && res.totalPages !== undefined ? res.number < res.totalPages - 1 : res.hasNext ?? (posts.length === size),
  };
};

export const getFeedTags = async (): Promise<string[]> => {
  return await request<string[]>("/tags/trending");
};

export const getTrendingTags = getFeedTags;

export const getTopHashtags = async (): Promise<{ tag: string, count: number }[]> => {
  try {
    const data = await request<any>("/tags/trending?limit=100");
    if (Array.isArray(data)) {
      return data.map((t: any) =>
        typeof t === 'string' ? { tag: t, count: 0 } : { tag: t.tag || t.name || t, count: t.count || 0 }
      );
    }
    return [];
  } catch {
    return [];
  }
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
    } else {
      console.warn("Clipboard API not available");
      return { success: false, url };
    }
  } catch (e) {
    console.error("Copy failed", e);
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

export interface PaginatedCommentsResponse {
  comments: PostComment[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export const getComments = async (
  postId: number | string,
  page = 0,
  size = 20
): Promise<PaginatedCommentsResponse> => {
  const res = await request<PageResponse<any>>(`/posts/${postId}/comments?page=${page}&size=${size}`);
  const comments = (res.items || []).map((c: any) => ({
    id: c.id,
    postId,
    author: c.authorName,
    authorHandle: c.authorHandle,
    avatarUrl: c.avatarUrl,
    initials: c.initials || "U",
    collegeName: c.collegeName,
    collegeShortName: c.collegeShortName,
    course: c.course,
    body: c.body,
    time: c.time || "Just now",
    createdAt: c.createdAt,
  }));
  return {
    comments,
    page: res.page ?? page,
    size: res.size ?? size,
    totalItems: res.totalItems ?? comments.length,
    totalPages: res.totalPages ?? 1,
    hasNext: res.hasNext ?? (comments.length === size),
  };
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
    course: c.course,
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