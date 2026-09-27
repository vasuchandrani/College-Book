/**
 * Centralized HTTP / API layer for CollegeBook.
 *
 * All frontend requests go through the single HTTP wrapper `request()`.
 * Signatures and return types are strictly preserved.
 */

import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from "@/types";
export type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData };
export type Post = FeedPost;
export type { PageResponse };
import { appConfig } from "@/config/app.config";
import { formatSmartDate } from "@/lib/dateUtils";
import { checkIsMessageUnread } from "@/lib/chatUnread";
import { clientCache } from "@/lib/clientCache";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export const API_BASE_URL = appConfig.apiBaseUrl;

const NETWORK_DELAY_MS = import.meta.env.DEV ? appConfig.mockLatencyMs : 0;

export const delay = <T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  content?: T[];
  number?: number;
  totalElements?: number;
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
 * Clear all authentication and user data from storage.
 */
export const clearAuthSession = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_refresh_token");
    localStorage.removeItem("cb_user");
    localStorage.removeItem("cb_profile");
  }
};

/**
 * Validates whether a token string is present, non-empty, and (if JWT) not expired.
 */
export const isAuthTokenValid = (token?: string | null): boolean => {
  const t = token !== undefined ? token : (typeof window !== "undefined" ? localStorage.getItem("cb_token") : null);
  if (!t || typeof t !== "string") return false;
  const trimmed = t.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return false;

  try {
    const parts = trimmed.split(".");
    if (parts.length === 3) {
      let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const pad = base64.length % 4;
      if (pad) {
        base64 += "=".repeat(4 - pad);
      }
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      if (payload && typeof payload.exp === "number") {
        if (Date.now() >= payload.exp * 1000) {
          return false;
        }
      }
    }
  } catch {
    return false;
  }

  return true;
};

/**
 * Thin fetch wrapper to call the Spring Boot backend.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const adminToken =
    typeof window !== "undefined" ? sessionStorage.getItem("cb_admin_token") : null;
  const userToken =
    typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;
  const isAdminPath = path.startsWith("/admin") || path.startsWith("admin");
  const rawToken = isAdminPath ? adminToken : userToken;

  let token = rawToken;
  if (!isAdminPath && rawToken) {
    if (!isAuthTokenValid(rawToken)) {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("cb_refresh_token") : null;
      if (refreshToken) {
        try {
          const res = await fetch(`${API_BASE_URL || "/api/v1"}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
          });
          if (res.ok) {
            const data = await res.json();
            token = data.accessToken;
            localStorage.setItem("cb_token", token as string);
            if (data.refreshToken) {
              localStorage.setItem("cb_refresh_token", data.refreshToken);
            }
          } else {
            clearAuthSession();
            token = null;
          }
        } catch {
          clearAuthSession();
          token = null;
        }
      } else {
        clearAuthSession();
        token = null;
      }
    }
  }

  const cleanBaseUrl = (API_BASE_URL || "/api/v1").replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${cleanBaseUrl}${cleanPath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const isFormData = init.body instanceof FormData;
  
  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...init,
      signal: init.signal || controller.signal,
      headers: {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
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
        signal: init.signal || controller.signal,
        headers: {
          ...(!isFormData ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init.headers ?? {}),
        },
      });
    }
  } catch (networkError: any) {
    if (networkError.name === "AbortError") {
      throw new ApiError(
        "The server took too long to respond. Please try again in a few moments.",
        504,
        "TIMEOUT"
      );
    }
    throw new ApiError(
      "Unable to connect to the server. Please check your internet connection.",
      0,
      "NETWORK_ERROR"
    );
  } finally {
    clearTimeout(timeoutId);
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

    // Only intercept 401 for session expiry. 403 means forbidden (e.g. demo mode restriction, not part of team, etc)
    // and should NOT log the user out.
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/manage-admin")) {
          // If on admin dashboard, don't clear student session, just redirect to admin login if it was an admin API
          if (path.startsWith("/admin") || path.startsWith("admin")) {
            sessionStorage.removeItem("cb_admin_token");
            window.location.replace("/manage-admin");
          }
        } else {
          clearAuthSession();
          const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
          if (!publicPaths.includes(currentPath)) {
            sessionStorage.setItem("cb_redirect_url", currentPath + window.location.search);
            window.location.replace("/login");
          }
        }
      }
    }

    throw new ApiError(message, res.status, code, field, timestamp, reqPath);
  }

  return (res.status === 204 ? (undefined as T) : await res.json()) as T;
}

// ---------------------------------------------------------------------------