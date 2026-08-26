/**
 * Shared domain types for CollegeBook.
 *
 * These mirror the backend DTOs documented in `docs/03-api-contract.md`.
 * Cloudflare R2 is used for images/files, and Cloudflare Stream is used for videos.
 */

export interface MediaItem {
  id?: string;
  mediaType: "IMAGE" | "VIDEO" | string;
  url: string;
  thumbnailUrl?: string;
  videoId?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  position?: number;
}

export interface FeedPost {
  id: string | number;
  author: string;
  authorHandle?: string;
  avatarUrl?: string;
  initials: string;
  course: string;
  college?: string;
  time: string;
  content: string;
  likes: number;
  liked: boolean;
  commentsCount?: number;
  commentsEnabled?: boolean;
  saved: boolean;
  tags: string[];
  images: string[];
  media?: MediaItem[];
  videoUrl?: string;
  isGlobal?: boolean;
  createdAt?: string;
}

export interface ExplorePost {
  id: string | number;
  author: string;
  authorHandle?: string;
  avatarUrl?: string;
  initials: string;
  college: string;
  time?: string;
  content: string;
  likes: number;
  liked: boolean;
  commentsCount?: number;
  commentsEnabled?: boolean;
  saved: boolean;
  tags: string[];
  images: string[];
  media?: MediaItem[];
  videoUrl?: string;
  isGlobal?: boolean;
  createdAt?: string;
}

export interface AdData {
  id: string;
  brand: string;
  title: string;
  description: string;
  images: string[];
  ctaText: string;
  ctaLink: string;
  commentsEnabled: boolean;
  discount?: string;
}

export interface PostComment {
  id: string;
  postId: string | number;
  authorId?: string | number;
  author: string;
  authorHandle?: string;
  avatarUrl?: string;
  initials: string;
  collegeName?: string;
  collegeShortName?: string;
  body: string;
  time: string;
  createdAt?: string;
}

export interface TeamDiscussion {
  id: string;
  teamId: string;
  authorId?: string;
  authorName: string;
  authorHandle?: string;
  avatarUrl?: string;
  initials: string;
  collegeName?: string;
  collegeShortName?: string;
  body: string;
  time: string;
  createdAt?: string;
}

export interface TeamChatMessage {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderHandle?: string;
  avatarUrl?: string;
  initials: string;
  collegeName?: string;
  collegeShortName?: string;
  role?: string; // "LEAD" or "MEMBER"
  content: string;
  messageType?: "TEXT" | "CODE" | "SYSTEM" | "IMAGE";
  mediaUrl?: string;
  createdAt?: string;
  time?: string;
  status?: "sending" | "sent" | "failed";
}

export interface ChatUser {
  userId: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
  initials: string;
  role?: string;
  online: boolean;
}

export interface TypingEvent {
  teamId: string;
  userId: string;
  userName: string;
  userHandle?: string;
  typing: boolean;
}

export interface PresenceEventDto {
  teamId: string;
  eventType: "JOIN" | "LEAVE" | "SYNC";
  userId: string;
  userName?: string;
  activeMembers?: ChatUser[];
}

// Backward compatibility alias
export type Comment = PostComment;

