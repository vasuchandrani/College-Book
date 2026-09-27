import { delay } from './client';
import type { FeedPost, ExplorePost, PostComment, TeamDiscussion, TeamChatMessage, ChatUser, TypingEvent, PresenceEventDto, AdData } from '@/types';
import type { Post, PageResponse } from './client';
import { request, clearAuthSession } from './client';

// Mobile / push (Capacitor)
// ---------------------------------------------------------------------------

export const registerPushToken = (token: string, platform: string) =>
  delay<{ ok: true }>({ ok: true });

// ---------------------------------------------------------------------------