import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from '@/types';
import type { Post, PageResponse } from './client';
import { request, clearAuthSession } from './client';

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

// =========================================================================