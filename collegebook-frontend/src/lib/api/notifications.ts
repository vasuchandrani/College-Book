import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from '@/types';
import type { Post, PageResponse } from './client';
import { request, clearAuthSession } from './client';

// Notifications
// ---------------------------------------------------------------------------

export const getNotifications = async (page = 0, size = 20) => {
  return await request<PageResponse<any>>(`/notifications?page=${page}&size=${size}`);
};

export const markNotificationRead = async (id: string) => {
  return await request<any>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
};

export const getUnreadNotificationCount = async () => {
  return await request<{ unreadCount: number }>("/notifications/unread-count");
};

export const subscribeToPushNotifications = async (subscription: any) => {
  return await request<any>("/notifications/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
};

export const unsubscribeFromPushNotifications = async (endpoint: string) => {
  return await request<any>("/notifications/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ endpoint }),
  });
};
