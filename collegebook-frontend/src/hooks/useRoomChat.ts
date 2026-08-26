import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import {
  getTeamChatMessages,
  sendTeamChatMessage,
  deleteTeamChatMessage,
  getRoomChatMembers,
  type TeamChatMessage,
  type ChatUser,
  type TypingEvent,
  type PresenceEventDto,
} from "@/lib/api";
import { toast } from "sonner";

export interface UseRoomChatOptions {
  teamId?: string;
  enabled?: boolean;
}

export function useRoomChat({ teamId, enabled = true }: UseRoomChatOptions) {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTING" | "CONNECTED" | "DISCONNECTED">("DISCONNECTED");

  const stompClientRef = useRef<Client | null>(null);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout | ReturnType<typeof setTimeout>>>(new Map());

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("cb_user") || "{}");
    } catch {
      return {};
    }
  };

  const getAccessToken = () => {
    return localStorage.getItem("cb_token") || localStorage.getItem("cb_access") || "";
  };

  // 1. Fetch initial message history & members via REST (cache-first)
  const fetchInitialData = useCallback(async () => {
    if (!teamId || !enabled) return;
    setLoading(true);
    try {
      const [messagesData, membersData] = await Promise.all([
        getTeamChatMessages(teamId, 50).catch(() => []),
        getRoomChatMembers(teamId).catch(() => []),
      ]);
      setMessages(messagesData || []);
      setActiveUsers(membersData || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load chat history");
    } finally {
      setLoading(false);
    }
  }, [teamId, enabled]);

  // 2. Initialize Real-Time STOMP WebSocket Connection
  useEffect(() => {
    if (!teamId || !enabled) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setConnectionStatus("DISCONNECTED");
      return;
    }

    fetchInitialData();

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Determine standard native WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.startsWith("http")
      ? import.meta.env.VITE_API_BASE_URL.replace(/^http/, "ws").replace(/\/api\/v1$/, "") + "/ws/chat"
      : `${protocol}//${host}/ws/chat`;

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: headers,
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnectionStatus("CONNECTED");

        // A. Subscribe to incoming messages
        client.subscribe(`/topic/room.${teamId}`, (message) => {
          try {
            const incoming: TeamChatMessage = JSON.parse(message.body);
            setMessages((prev) => {
              // 1. If message with this real ID already exists, do nothing
              if (prev.some((m) => m.id === incoming.id)) return prev;

              // 2. If an optimistic temp message from this sender matches, replace it
              const tempIndex = prev.findIndex(
                (m) =>
                  m.id.startsWith("temp-") &&
                  (m.senderId === incoming.senderId || m.senderName === incoming.senderName) &&
                  m.content.trim() === incoming.content.trim()
              );

              if (tempIndex !== -1) {
                const updated = [...prev];
                updated[tempIndex] = { ...incoming, status: "sent" };
                return updated;
              }

              // 3. Otherwise append new incoming message
              return [...prev, { ...incoming, status: "sent" }];
            });
          } catch (e) {
            console.warn("Failed to parse incoming chat message", e);
          }
        });

        // B. Subscribe to message deletions
        client.subscribe(`/topic/room.${teamId}.deleted`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            const deletedId = payload.messageId;
            if (deletedId) {
              setMessages((prev) => prev.filter((m) => m.id !== deletedId));
            }
          } catch (e) {
            console.warn("Failed to parse message deletion", e);
          }
        });

        // C. Subscribe to typing events
        client.subscribe(`/topic/room.${teamId}.typing`, (message) => {
          try {
            const typingEvent: TypingEvent = JSON.parse(message.body);
            const currentUser = getStoredUser();
            if (typingEvent.userId === currentUser.id) return; // Ignore own typing

            setTypingUsers((prev) => {
              const updated = new Map(prev);
              if (typingEvent.typing) {
                updated.set(typingEvent.userId, typingEvent.userName || "Someone");
              } else {
                updated.delete(typingEvent.userId);
              }
              return updated;
            });

            // Auto-clear typing indicator after 3.5s of inactivity
            if (typingEvent.typing) {
              const existingTimer = typingTimeoutRef.current.get(typingEvent.userId);
              if (existingTimer) clearTimeout(existingTimer as any);

              const timer = setTimeout(() => {
                setTypingUsers((prev) => {
                  const copy = new Map(prev);
                  copy.delete(typingEvent.userId);
                  return copy;
                });
              }, 3500);

              typingTimeoutRef.current.set(typingEvent.userId, timer);
            }
          } catch (e) {
            console.warn("Failed to parse typing event", e);
          }
        });

        // D. Subscribe to presence updates
        client.subscribe(`/topic/room.${teamId}.presence`, (message) => {
          try {
            const presence: PresenceEventDto = JSON.parse(message.body);
            if (presence.userId) {
              setActiveUsers((prev) =>
                prev.map((u) =>
                  u.userId === presence.userId
                    ? { ...u, online: presence.eventType === "JOIN" }
                    : u
                )
              );
            }
          } catch (e) {
            console.warn("Failed to parse presence update", e);
          }
        });
      },
      onDisconnect: () => {
        setConnectionStatus("DISCONNECTED");
      },
      onStompError: (frame) => {
        console.warn("STOMP error", frame.headers["message"]);
        setConnectionStatus("DISCONNECTED");
      },
    });

    setConnectionStatus("CONNECTING");
    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
      stompClientRef.current = null;
      setConnectionStatus("DISCONNECTED");
    };
  }, [teamId, enabled, fetchInitialData]);

  // 3. Send Message Handler (Optimistic 0ms UI + STOMP / REST)
  const sendMessage = useCallback(
    async (content: string, messageType: "TEXT" | "CODE" | "SYSTEM" | "IMAGE" = "TEXT", mediaUrl?: string) => {
      if (!teamId || !content.trim()) return;
      const currentUser = getStoredUser();

      const tempId = "temp-" + Date.now();
      const optimisticMessage: TeamChatMessage = {
        id: tempId,
        teamId,
        senderId: currentUser.id || "current-user",
        senderName: currentUser.name || "You",
        senderHandle: currentUser.handle || currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        initials: currentUser.initials || "YO",
        collegeName: currentUser.collegeName,
        collegeShortName: currentUser.collegeShortName,
        role: "MEMBER",
        content: content.trim(),
        messageType,
        mediaUrl,
        time: "Just now",
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      // 1. Instantly render on screen (0ms)
      setMessages((prev) => [...prev, optimisticMessage]);

      // 2. Guaranteed server persistence & real-time broadcast via authenticated REST API
      try {
        const response = await sendTeamChatMessage(teamId, content.trim(), messageType, mediaUrl);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId || (m.id.startsWith("temp-") && m.content === response.content)
              ? { ...response, status: "sent" }
              : m
          )
        );
      } catch (e: any) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
        );
        toast.error(e.message || "Failed to deliver message");
      }
    },
    [teamId]
  );

  // 4. Send Typing Indicator
  const sendTyping = useCallback(
    (typing: boolean) => {
      if (!teamId) return;
      const client = stompClientRef.current;
      if (client && client.connected) {
        const currentUser = getStoredUser();
        try {
          client.publish({
            destination: `/app/chat.typing/${teamId}`,
            body: JSON.stringify({
              teamId,
              userId: currentUser.id,
              userName: currentUser.name || "A member",
              userHandle: currentUser.handle,
              typing,
            }),
          });
        } catch (e) {
          // Ignored for ephemeral typing
        }
      }
    },
    [teamId]
  );

  // 5. Delete Message Handler
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!teamId) return;
      // Optimistic delete
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      try {
        await deleteTeamChatMessage(teamId, messageId);
        toast.success("Message deleted");
      } catch (e: any) {
        toast.error(e.message || "Failed to delete message");
        // Re-fetch to restore if failed
        fetchInitialData();
      }
    },
    [teamId, fetchInitialData]
  );

  return {
    messages,
    loading,
    activeUsers,
    typingUserNames: Array.from(typingUsers.values()),
    connectionStatus,
    sendMessage,
    sendTyping,
    deleteMessage,
    refreshMessages: fetchInitialData,
  };
}
