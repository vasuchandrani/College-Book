/**
 * Centralized HTTP / API layer for CollegeBook.
 *
 * All frontend requests go through the single HTTP wrapper `request()`.
 * Signatures and return types are strictly preserved.
 */

import { feedAds, exploreAds } from "@/data/mock";
import {
  feedPosts as feedPostsSeed,
  explorePosts as explorePostsSeed,
  feedTags,
  trendingTags,
  type FeedPost,
  type ExplorePost,
} from "@/data/mock";
import type { AdData } from "@/types";
import { appConfig } from "@/config/app.config";

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

/**
 * Thin fetch wrapper to call the Spring Boot backend.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }

  return (res.status === 204 ? (undefined as T) : await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginPayload { email: string; password: string; }
export interface SignupPayload {
  name: string; email: string; password: string;
  college: string; course: string; year: string;
}
export interface AuthUser {
  name: string; initials: string; email: string;
  college: string; collegeShort: string; course: string;
}

export const login = async (payload: LoginPayload): Promise<AuthUser> => {
  try {
    const res = await request<{ accessToken: string; refreshToken: string; user: { email: string; profile?: { fullName?: string; collegeName?: string; courseName?: string } } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.accessToken) {
      localStorage.setItem("cb_token", res.accessToken);
      localStorage.setItem("cb_refresh_token", res.refreshToken);
    }
    const fullName = res.user?.profile?.fullName || "User";
    const initials = fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    return {
      name: fullName,
      initials: initials || "U",
      email: res.user.email,
      college: res.user.profile?.collegeName || "College",
      collegeShort: (res.user.profile?.collegeName || "C").split(" ").map((p) => p[0]).join(""),
      course: res.user.profile?.courseName || "Course",
    };
  } catch (err) {
    return delay<AuthUser>({
      name: "Vatsal Chandrani", initials: "VC", email: payload.email,
      college: "IIT Delhi", collegeShort: "IIT-D", course: "B.Tech CSE",
    });
  }
};

export const signup = async (payload: SignupPayload): Promise<AuthUser> => {
  return delay<AuthUser>({
    name: payload.name,
    initials: payload.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
    email: payload.email,
    college: payload.college,
    collegeShort: payload.college.split(" ").map((p) => p[0]).join(""),
    course: payload.course,
  });
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
};

export const forgotPassword = (email: string) =>
  delay<{ sent: true; email: string }>({ sent: true, email });

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

export const getFeedPosts = async (): Promise<FeedPost[]> => {
  try {
    const res = await request<PageResponse<FeedPost>>("/feed");
    return res.items || [];
  } catch (e) {
    return delay<FeedPost[]>([...feedPostsSeed]);
  }
};

export const getFeedTags = async (): Promise<string[]> => {
  try {
    return await request<string[]>("/tags/trending");
  } catch (e) {
    return delay<string[]>([...feedTags]);
  }
};

export interface CreatePostPayload {
  author: string; initials: string; course: string;
  content: string; images: string[]; tags?: string[];
}

export const createPost = async (payload: CreatePostPayload): Promise<FeedPost> => {
  try {
    return await request<FeedPost>("/posts", {
      method: "POST",
      body: JSON.stringify({
        content: payload.content,
        images: payload.images,
        tags: payload.tags,
      }),
    });
  } catch (e) {
    return delay<FeedPost>({
      id: Date.now(),
      author: payload.author,
      initials: payload.initials,
      course: payload.course,
      time: "Just now",
      content: payload.content,
      likes: 0, liked: false, saved: false,
      tags: payload.tags ?? [],
      images: payload.images,
    });
  }
};

export const likePost = async (postId: number | string) => {
  try {
    return await request<{ id: string; liked: boolean }>("/posts/" + postId + "/like", { method: "POST" });
  } catch (e) {
    return delay<{ id: any; liked: boolean }>({ id: postId, liked: true });
  }
};

export const savePost = async (postId: number | string) => {
  try {
    return await request<{ id: string; saved: boolean }>("/posts/" + postId + "/save", { method: "POST" });
  } catch (e) {
    return delay<{ id: any; saved: boolean }>({ id: postId, saved: true });
  }
};

export const deletePost = async (postId: number | string) => {
  try {
    await request<void>("/posts/" + postId, { method: "DELETE" });
    return { id: postId, deleted: true as const };
  } catch (e) {
    return delay<{ id: any; deleted: true }>({ id: postId, deleted: true });
  }
};

// ---------------------------------------------------------------------------
// Explore
// ---------------------------------------------------------------------------

export const getExplorePosts = async (): Promise<ExplorePost[]> => {
  try {
    const res = await request<PageResponse<ExplorePost>>("/explore");
    return res.items || [];
  } catch (e) {
    return delay<ExplorePost[]>([...explorePostsSeed]);
  }
};

export const getTrendingTags = async (): Promise<string[]> => {
  try {
    return await request<string[]>("/tags/trending");
  } catch (e) {
    return delay<string[]>([...trendingTags]);
  }
};

// ---------------------------------------------------------------------------
// Ads
// ---------------------------------------------------------------------------

export const getFeedAds = async (): Promise<AdData[]> => {
  try {
    return await request<AdData[]>("/ads/feed");
  } catch (e) {
    return delay<AdData[]>([...feedAds]);
  }
};

export const getExploreAds = async (): Promise<AdData[]> => {
  try {
    return await request<AdData[]>("/ads/explore");
  } catch (e) {
    return delay<AdData[]>([...exploreAds]);
  }
};

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export interface CommentPayload { postId: number | string; body: string; }
export const getComments = async (postId: number | string) => {
  try {
    const res = await request<PageResponse<{ id: string; authorName: string; body: string; time: string }>>("/posts/" + postId + "/comments");
    return (res.items || []).map((c) => ({
      id: c.id,
      author: c.authorName,
      body: c.body,
      time: c.time,
    }));
  } catch (e) {
    return delay<{ id: any; author: string; body: string; time: string }[]>([]);
  }
};

export const addComment = async (payload: CommentPayload) => {
  try {
    const c = await request<{ id: string; authorName: string; body: string; time: string }>("/posts/" + payload.postId + "/comments", {
      method: "POST",
      body: JSON.stringify({ body: payload.body }),
    });
    return { id: c.id, postId: payload.postId, author: c.authorName, body: c.body, time: c.time };
  } catch (e) {
    return delay({ id: Date.now(), ...payload, time: "Just now" });
  }
};

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface ProfileUpdate {
  bioExtra?: string;
  avatarUrl?: string;
}

export const getProfile = async (name?: string) => {
  try {
    const p = await request<{ fullName: string; initials: string; collegeName: string; courseName: string; defaultBio: string; bioExtra: string; avatarUrl: string }>("/profiles/me");
    return {
      name: p.fullName,
      initials: p.initials,
      college: p.collegeName || "College",
      course: p.courseName || "Course",
      defaultBio: p.defaultBio || "Student",
      bioExtra: p.bioExtra || "",
      avatarUrl: p.avatarUrl || "",
    };
  } catch (e) {
    return delay({
      name: name ?? "Vatsal Chandrani",
      initials: "VC",
      college: "IIT Delhi",
      course: "B.Tech CSE",
      defaultBio: "B.Tech Computer Science • 3rd Year",
      bioExtra: "",
      avatarUrl: "",
    });
  }
};

export const updateProfile = async (payload: ProfileUpdate) => {
  try {
    await request<void>("/profiles/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return { ok: true, ...payload };
  } catch (e) {
    return delay({ ok: true, ...payload });
  }
};

export const getSavedPosts = async () => {
  try {
    const res = await request<PageResponse<FeedPost>>("/saved-posts");
    return res.items || [];
  } catch (e) {
    return delay<unknown[]>([]);
  }
};

export const getMyPosts = async () => {
  try {
    const res = await request<PageResponse<FeedPost>>("/my-posts");
    return res.items || [];
  } catch (e) {
    return delay<unknown[]>([]);
  }
};

export const getStarredProjects = () => delay<unknown[]>([]);
export const unstarProject = (projectId: number | string) =>
  delay({ id: projectId, starred: false });

// ---------------------------------------------------------------------------
// Collab Hub
// ---------------------------------------------------------------------------

export const getCollabTeams = async () => {
  try {
    const res = await request<PageResponse<unknown>>("/teams");
    return res.items || [];
  } catch (e) {
    return delay<unknown[]>([]);
  }
};

export interface CreateTeamPayload {
  title: string; type: "project" | "hackathon"; description?: string;
  githubLink?: string; skills: string[]; requiredExpertise: string[];
  maxMembers: number;
}
export const createTeam = async (payload: CreateTeamPayload) => {
  try {
    return await request<unknown>("/teams", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        type: payload.type.toUpperCase(),
      }),
    });
  } catch (e) {
    return delay({ id: Date.now(), ...payload });
  }
};

export const sendJoinRequest = async (teamId: number | string, role: string, message: string) => {
  try {
    return await request<unknown>("/teams/" + teamId + "/join", {
      method: "POST",
      body: JSON.stringify({ role, message }),
    });
  } catch (e) {
    return delay({ id: Date.now(), teamId, role, message, status: "pending" as const });
  }
};

export const respondJoinRequest = async (requestId: number | string, accept: boolean) => {
  try {
    return await request<unknown>("/join-requests/" + requestId, {
      method: "PATCH",
      body: JSON.stringify({ accept }),
    });
  } catch (e) {
    return delay({ id: requestId, status: accept ? "accepted" : "rejected" });
  }
};

export const markProjectComplete = async (projectId: number | string) => {
  try {
    return await request<unknown>("/teams/" + projectId + "/complete", {
      method: "PATCH",
    });
  } catch (e) {
    return delay({ id: projectId, completed: true });
  }
};

export const starProject = async (projectId: number | string) => {
  try {
    return await request<{ id: string; starred: boolean }>("/teams/" + projectId + "/star", {
      method: "POST",
    });
  } catch (e) {
    return delay({ id: projectId, starred: true });
  }
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

export const getColleges = async () => {
  try {
    const data = await request<{ id: string; name: string; shortName: string; emailDomains: string[] }[]>("/colleges");
    return data.map((c, idx) => ({
      id: idx + 1,
      uuid: c.id,
      name: c.name,
      short: c.shortName,
      emailDomain: c.emailDomains?.[0] || "",
    }));
  } catch (e) {
    return [
      { id: 1, name: "IIT Delhi", short: "IIT-D", emailDomain: "iitd.ac.in" },
      { id: 2, name: "IIT Bombay", short: "IIT-B", emailDomain: "iitb.ac.in" },
      { id: 3, name: "BITS Pilani", short: "BITS", emailDomain: "pilani.bits-pilani.ac.in" },
      { id: 4, name: "NIT Trichy", short: "NIT-T", emailDomain: "nitt.edu" },
    ];
  }
};

export const sendOtp = (email: string) => delay<{ sent: true }>({ sent: true });

export const verifyOtp = (email: string, code: string) =>
  delay<{ verified: boolean }>({ verified: /^\d{6}$/.test(code) });

export const resetPassword = (token: string, password: string) =>
  delay<{ ok: true }>({ ok: true });

// ---------------------------------------------------------------------------
// Teams, requests & badges (write side)
// ---------------------------------------------------------------------------

export const getMyTeams = async () => {
  try {
    return await request<unknown[]>("/teams/my");
  } catch (e) {
    return delay<unknown[]>([]);
  }
};

export const updateTeam = (teamId: number | string, payload: Partial<CreateTeamPayload>) =>
  delay({ id: teamId, ...payload });

export const getMyJoinRequests = async () => {
  try {
    return await request<unknown[]>("/join-requests/my");
  } catch (e) {
    return delay<unknown[]>([]);
  }
};

export const updateJoinRequest = (requestId: number | string, role: string, message: string) =>
  delay({ id: requestId, role, message, status: "pending" as const });

export const getStudentProfile = async (slug: string) => {
  try {
    return await request<{ userId: string; slug: string; fullName: string; courseName: string; collegeName: string }>("/students/" + slug);
  } catch (e) {
    return delay({ slug, name: slug, course: "B.Tech CSE", college: "IIT Delhi" });
  }
};
export const getBadgeSubmissions = () => delay<unknown[]>([]);

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const getAdminStats = async () => {
  try {
    return await request<{ students: number; posts: number; teams: number; ads: number }>("/admin/stats");
  } catch (e) {
    return delay({ students: 0, posts: 0, teams: 0, ads: 0 });
  }
};

export const adminCreateAd = async (payload: Partial<AdData>) => {
  try {
    return await request<AdData>("/admin/ads", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return delay({ ...payload, id: `${Date.now()}` });
  }
};

export const adminDeleteAd = async (adId: string) => {
  try {
    await request<void>("/admin/ads/" + adId, { method: "DELETE" });
    return { id: adId, deleted: true as const };
  } catch (e) {
    return delay({ id: adId, deleted: true });
  }
};
