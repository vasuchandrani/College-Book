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
    const readTime = timestamp || Date.now();
    localStorage.setItem(`cb_room_last_read_${teamId}`, readTime.toString());
    window.dispatchEvent(new CustomEvent("cb_room_read", { detail: { teamId, readTime } }));
  } catch {
    // ignore
  }
};

export const checkIsMessageUnread = (
  teamId: string,
  messageCreatedAt?: string,
  senderId?: string,
  currentUserId?: string
): boolean => {
  if (!teamId || !messageCreatedAt) return false;
  if (senderId && currentUserId && String(senderId).toLowerCase() === String(currentUserId).toLowerCase()) {
    return false;
  }
  try {
    const msgTime = new Date(messageCreatedAt).getTime();
    const lastRead = getRoomLastRead(teamId);
    return msgTime > lastRead;
  } catch {
    return false;
  }
};
