import { ApiError } from './client';
import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from '@/types';
import type { Post, PageResponse } from './client';
import { request, clearAuthSession } from './client';

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
  branchId?: string;
  currentYear?: number;
  gender?: string;
  college?: string;
  course?: string;
  branch?: string;
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
  branch?: string;
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
    }).catch(() => { });
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