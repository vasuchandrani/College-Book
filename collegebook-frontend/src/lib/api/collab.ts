import { normalizeCourseShort } from './users';
import { formatSmartDate } from '@/lib/dateUtils';
import { PaginatedPostsResponse } from './posts';
import { clientCache } from '@/lib/clientCache';
import { getTeamRecentMessages } from './chat';
import { checkIsMessageUnread } from '@/lib/chatUnread';
import { delay } from './client';
import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from '@/types';
import type { Post, PageResponse } from './client';
import { request, clearAuthSession } from './client';

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

export const getSavedPosts = async (
  page = 0,
  size = 15
): Promise<PaginatedPostsResponse<FeedPost>> => {
  const res = await request<PageResponse<any>>(`/saved-posts?page=${page}&size=${size}`);
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

export const getMyPosts = async (
  page = 0,
  size = 15
): Promise<PaginatedPostsResponse<FeedPost>> => {
  const res = await request<PageResponse<any>>(`/my-posts?page=${page}&size=${size}`);
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

export const getStarredProjects = async (): Promise<any[]> => {
  try {
    return await request<any[]>("/teams/starred");
  } catch (e) {
    return [];
  }
};



// ---------------------------------------------------------------------------
// Collab Hub
// ---------------------------------------------------------------------------

export interface PaginatedCollabResponse {
  teams: any[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export const getCollabTeams = async (
  page = 0,
  size = 15,
  type?: "PROJECT" | "HACKATHON" | "OPEN_SOURCE"
): Promise<PaginatedCollabResponse> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (type) params.set("type", type);
  const res = await request<PageResponse<any>>(`/teams?${params.toString()}`);
  return {
    teams: res.items || [],
    page: res.page ?? page,
    size: res.size ?? size,
    totalItems: res.totalItems ?? (res.items || []).length,
    totalPages: res.totalPages ?? 1,
    hasNext: res.hasNext ?? ((res.items || []).length === size),
  };
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

export const toggleStarTeam = async (projectId: number | string, signal?: AbortSignal) => {
  return await request<{ id: string; starred: boolean; starsCount: number }>(`/teams/${projectId}/star`, {
    method: "POST",
    signal,
  });
};



export const getMyTeams = async (
  page = 0,
  size = 15,
  type?: string,
  completed?: boolean,
  excludeOpenSource?: boolean
): Promise<PaginatedCollabResponse> => {
  const queryParts = [];
  if (type) queryParts.push(`type=${type}`);
  if (completed !== undefined) queryParts.push(`completed=${completed}`);
  if (excludeOpenSource) queryParts.push(`excludeOpenSource=true`);

  const query = queryParts.length > 0 ? `&${queryParts.join("&")}` : "";
  const res = await request<PageResponse<any>>(`/teams/my?page=${page}&size=${size}${query}`);
  return {
    teams: res.items || [],
    page: res.page ?? page,
    size: res.size ?? size,
    totalItems: res.totalItems ?? (res.items || []).length,
    totalPages: res.totalPages ?? 1,
    hasNext: res.hasNext ?? ((res.items || []).length === size),
  };
};

export const getMyCreatedTeams = getMyTeams;

export const getMyOpenSourceProjects = async () => {
  return await request<any[]>("/teams/my/open-source");
};

export interface PaginatedJoinRequestResponse {
  requests: any[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export const getMyJoinRequests = async (
  page = 0,
  size = 15
): Promise<PaginatedJoinRequestResponse> => {
  const res = await request<PageResponse<any>>(`/join-requests/my?page=${page}&size=${size}`);
  return {
    requests: res.items || [],
    page: res.page ?? page,
    size: res.size ?? size,
    totalItems: res.totalItems ?? (res.items || []).length,
    totalPages: res.totalPages ?? 1,
    hasNext: res.hasNext ?? ((res.items || []).length === size),
  };
};

export const getMyJoinedRequests = getMyJoinRequests;

export const getTeamJoinRequests = async (teamId: string | number) => {
  return await request<any[]>(`/teams/${teamId}/requests`);
};

export const getMyIncomingRequests = async (
  page = 0,
  size = 15
): Promise<PaginatedJoinRequestResponse> => {
  const res = await request<PageResponse<any>>(`/teams/my/incoming-requests?page=${page}&size=${size}`);
  return {
    requests: res.items || [],
    page: res.page ?? page,
    size: res.size ?? size,
    totalItems: res.totalItems ?? (res.items || []).length,
    totalPages: res.totalPages ?? 1,
    hasNext: res.hasNext ?? ((res.items || []).length === size),
  };
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

      if (import.meta.env.PROD) {
        const emptyBadge = { totalCount: 0, pendingRequests: 0, unreadRecruiting: 0, unreadFormed: 0, unreadOpenSource: 0 };
        clientCache.set("collab_badge_counts", emptyBadge, 30_000);
        return emptyBadge;
      }

      // Safe fallback calculation
      const [requests, teams] = await Promise.all([
        getMyIncomingRequests().catch(() => []),
        getMyCreatedTeams().catch(() => []),
      ]);

      const pendingReqCount = ((requests as any)?.requests || requests || []).filter(
        (r: any) => String(r.status).toUpperCase() === "PENDING"
      ).length;

      let user: any = {};
      try {
        user = JSON.parse(localStorage.getItem("cb_user") || "{}");
      } catch { }

      let recruitingUnread = 0;
      let formedUnread = 0;
      let openSourceUnread = 0;

      if (Array.isArray(teams) && teams.length > 0) {
        const teamsToProcess = teams.slice(0, 10);
        await Promise.all(
          teamsToProcess.map(async (t: any) => {
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
            } catch { }
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