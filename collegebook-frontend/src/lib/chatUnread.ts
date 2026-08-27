// Unread Room Chat Tracking Utility

export const getRoomLastRead = (teamId: string): number => {
  if (typeof window === "undefined" || !teamId) return 0;
  try {
    const val = localStorage.getItem(`cb_room_last_read_${teamId}`);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
};

export const markRoomAsRead = (teamId: string, timestamp?: number): void => {
  if (typeof window === "undefined" || !teamId) return;
  try {
    const readTime = timestamp && !isNaN(timestamp) && timestamp > 0 ? timestamp : Date.now();
    const current = getRoomLastRead(teamId);
    if (readTime >= current) {
      localStorage.setItem(`cb_room_last_read_${teamId}`, readTime.toString());
      window.dispatchEvent(new CustomEvent("cb_room_read", { detail: { teamId, readTime } }));
    }
  } catch {
    // ignore
  }
};

export const checkIsMessageUnread = (
  teamId: string,
  messageCreatedAt?: string | number,
  senderId?: string | number,
  currentUserId?: string | number,
  senderName?: string,
  currentUserName?: string,
  senderHandle?: string,
  currentUserHandle?: string
): boolean => {
  if (!teamId || !messageCreatedAt) return false;

  // 1. Check if message was sent by current user
  if (
    senderId &&
    currentUserId &&
    String(senderId).trim().toLowerCase() === String(currentUserId).trim().toLowerCase()
  ) {
    return false;
  }

  if (
    senderName &&
    currentUserName &&
    senderName.trim().toLowerCase() === currentUserName.trim().toLowerCase()
  ) {
    return false;
  }

  if (
    senderHandle &&
    currentUserHandle &&
    senderHandle.replace(/^@/, "").trim().toLowerCase() ===
      currentUserHandle.replace(/^@/, "").trim().toLowerCase()
  ) {
    return false;
  }

  // 2. Check timestamp against last read time
  try {
    const msgTime =
      typeof messageCreatedAt === "number"
        ? messageCreatedAt
        : new Date(messageCreatedAt).getTime();
    if (isNaN(msgTime) || msgTime <= 0) return false;

    const lastRead = getRoomLastRead(teamId);
    return msgTime > lastRead;
  } catch {
    return false;
  }
};

