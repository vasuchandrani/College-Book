import React, { useState, useRef, useEffect } from "react";
import { useRoomChat } from "@/hooks/useRoomChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Code2,
  Copy,
  Trash2,
  Users,
  Circle,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Terminal,
  ShieldCheck,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { markRoomAsRead } from "@/lib/chatUnread";

interface TeamRoomChatPanelProps {
  team: {
    id: string;
    title: string;
    type?: string;
    kind?: string;
    ownerId?: string;
    ownerName?: string;
    ownerHandle?: string;
  };
  currentUser?: {
    id?: string;
    name?: string;
    handle?: string;
    avatarUrl?: string;
    initials?: string;
    collegeShortName?: string;
  };
  isLead?: boolean;
}

export function TeamRoomChatPanel({
  team,
  currentUser,
  isLead: isCurrentUserLead = false,
}: TeamRoomChatPanelProps) {
  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState<"TEXT" | "CODE">("TEXT");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | ReturnType<typeof setTimeout> | null>(null);

  const {
    messages,
    loading,
    activeUsers,
    typingUserNames,
    connectionStatus,
    sendMessage,
    deleteMessage,
    sendTyping,
  } = useRoomChat({
    teamId: team.id,
    enabled: true,
  });

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("cb_user") || "{}");
    } catch {
      return {};
    }
  };

  const storedUser = currentUser || getStoredUser();
  const currentUserId = storedUser?.id || storedUser?.userId;

  const isLead = Boolean(
    isCurrentUserLead ||
    (team.ownerId && currentUserId && String(team.ownerId).toLowerCase() === String(currentUserId).toLowerCase()) ||
    (team.ownerName && (storedUser?.name || storedUser?.fullName) && (
      team.ownerName.trim().toLowerCase() === (storedUser.name || "").trim().toLowerCase() ||
      team.ownerName.trim().toLowerCase() === (storedUser.fullName || "").trim().toLowerCase()
    )) ||
    (team.ownerHandle && storedUser?.handle &&
      team.ownerHandle.replace(/^@/, "").toLowerCase() === storedUser.handle.replace(/^@/, "").toLowerCase()) ||
    (team as any).canEdit ||
    (team as any).canComplete
  );

  const checkIsMe = (msg: any) => {
    return Boolean(
      (msg.senderId && currentUserId && String(msg.senderId).toLowerCase() === String(currentUserId).toLowerCase()) ||
      (msg.senderName && (storedUser?.name || storedUser?.fullName) && (
        msg.senderName.trim().toLowerCase() === (storedUser.name || "").trim().toLowerCase() ||
        msg.senderName.trim().toLowerCase() === (storedUser.fullName || "").trim().toLowerCase()
      )) ||
      (msg.senderHandle && storedUser?.handle &&
        msg.senderHandle.replace(/^@/, "").toLowerCase() === storedUser.handle.replace(/^@/, "").toLowerCase()) ||
      (msg.senderHandle && storedUser?.username &&
        msg.senderHandle.replace(/^@/, "").toLowerCase() === storedUser.username.replace(/^@/, "").toLowerCase()) ||
      (msg.senderHandle && storedUser?.email &&
        msg.senderHandle.toLowerCase() === storedUser.email.split("@")[0].toLowerCase())
    );
  };

  // Scoped Auto-scroll inside chat viewport only (does NOT scroll the outer browser window)
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    scrollToBottom(true);
    if (team?.id) {
      markRoomAsRead(team.id);
    }
  }, [messages.length, team?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Send typing event debounced
    sendTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    sendMessage(trimmed, messageType);
    setContent("");
    sendTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  // Group messages by date
  const formatDateGroup = (dateStr?: string) => {
    if (!dateStr) return "Today";
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatBubbleTime = (createdAt?: string, timeStr?: string) => {
    if (createdAt) {
      try {
        const d = new Date(createdAt);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
        }
      } catch {}
    }
    return timeStr || "Just now";
  };

  return (
    <div className="w-full flex flex-col rounded-2xl border border-border/80 bg-card shadow-card overflow-hidden transition-all">
      {/* 1. Dedicated Room Chat Header */}
      <div className="px-6 py-4 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold shadow-2xs border border-primary/20">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-bold text-base truncate text-foreground">
                {team.title} — Room Chat
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-semibold px-2 py-0.5 border-primary/30 text-primary shrink-0"
              >
                {team.type || team.kind || "PROJECT"}
              </Badge>
              {isLead && (
                <Badge variant="secondary" className="text-[10px] font-semibold bg-primary/10 text-primary shrink-0">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Team Lead
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {(team as any).members?.length || activeUsers.length || 2} team members
            </p>
          </div>
        </div>
      </div>

      {/* 2. Messages Stream */}
      <div
        ref={messagesContainerRef}
        className="h-[480px] sm:h-[540px] p-5 sm:p-6 bg-muted/5 overflow-y-auto space-y-5"
      >
        {loading && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs">Loading collaboration room messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2 border-2 border-dashed border-border/40 rounded-xl">
            <MessageSquare className="h-10 w-10 text-primary/40 stroke-[1.5]" />
            <p className="text-sm font-semibold text-foreground">Welcome to {team.title} room chat!</p>
            <p className="text-xs max-w-sm">
              Start collaborating with your team in real time. Send updates, coordinate tasks, and share ideas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isMe = checkIsMe(msg);

              const isSenderLead = Boolean(
                msg.role === "LEAD" ||
                (team.ownerId && msg.senderId && String(team.ownerId).toLowerCase() === String(msg.senderId).toLowerCase()) ||
                (team.ownerName && msg.senderName && team.ownerName.trim().toLowerCase() === msg.senderName.trim().toLowerCase()) ||
                (team.ownerHandle && msg.senderHandle && team.ownerHandle.replace(/^@/, "").toLowerCase() === msg.senderHandle.replace(/^@/, "").toLowerCase())
              );

              const memberAvatar = (team as any).members?.find(
                (m: any) =>
                  (m.userId && msg.senderId && String(m.userId).toLowerCase() === String(msg.senderId).toLowerCase()) ||
                  (m.name && msg.senderName && m.name.trim().toLowerCase() === msg.senderName.trim().toLowerCase()) ||
                  (m.handle && msg.senderHandle && m.handle.replace(/^@/, "").toLowerCase() === msg.senderHandle.replace(/^@/, "").toLowerCase())
              )?.avatarUrl;
              const senderAvatar = msg.avatarUrl || (isSenderLead ? (team as any).ownerAvatarUrl : undefined) || memberAvatar;

              const prevMsg = messages[idx - 1];
              const isNewGroup = !prevMsg || formatDateGroup(prevMsg.createdAt) !== formatDateGroup(msg.createdAt);

              // Check if previous message is from the same sender & within 5 minutes on the same day
              const isSameSenderAsPrev = Boolean(
                prevMsg &&
                (
                  (msg.senderId && prevMsg.senderId && String(msg.senderId).toLowerCase() === String(prevMsg.senderId).toLowerCase()) ||
                  (msg.senderName && prevMsg.senderName && msg.senderName.trim().toLowerCase() === prevMsg.senderName.trim().toLowerCase())
                )
              );

              const isWithin5Min = Boolean(
                isSameSenderAsPrev &&
                !isNewGroup &&
                prevMsg?.createdAt &&
                msg?.createdAt &&
                Math.abs(new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) <= 5 * 60 * 1000
              );

              const showSenderHeader = !isMe && !isWithin5Min;
              const showAvatar = !isMe && !isWithin5Min;

              return (
                <React.Fragment key={msg.id || idx}>
                  {/* Date Divider */}
                  {isNewGroup && (
                    <div className="flex items-center justify-center my-4">
                      <div className="px-3 py-0.5 rounded-full bg-background border border-border/80 text-[10px] font-semibold text-muted-foreground shadow-2xs">
                        {formatDateGroup(msg.createdAt)}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble Item */}
                  <div
                    className={`flex gap-3 items-start group transition-opacity ${
                      isWithin5Min ? "mt-1" : "mt-3.5"
                    } ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {!isMe && (
                      showAvatar ? (
                        <Avatar className="h-8 w-8 shrink-0 mt-0.5 border border-border shadow-2xs">
                          <AvatarImage src={senderAvatar} alt={msg.senderName} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {msg.initials || msg.senderName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 shrink-0" aria-hidden="true" />
                      )
                    )}

                    <div
                      className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender Meta (Shown only on first message of the group) */}
                      {showSenderHeader && (
                        <div className="flex items-center gap-1.5 px-1 mb-0.5">
                          <span className="text-xs font-semibold text-foreground">
                            {msg.senderName}
                          </span>
                          {isSenderLead && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary font-medium"
                            >
                              Lead
                            </Badge>
                          )}
                          {msg.collegeShortName && (
                            <span className="text-[10px] text-muted-foreground">
                              • {msg.collegeShortName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bubble Content with WhatsApp-Style Bottom-Right Time */}
                      <div className="relative group/bubble">
                        {msg.messageType === "CODE" ? (
                          /* Code Block Bubble */
                          <div
                            className={`rounded-2xl p-3.5 border text-xs font-mono shadow-sm overflow-hidden relative ${
                              isMe
                                ? "bg-slate-900 text-slate-100 border-slate-800"
                                : "bg-slate-950 text-slate-100 border-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Terminal className="h-3 w-3 text-primary" /> Code Snippet
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyCodeToClipboard(msg.content)}
                                className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed pb-3">
                              <code>{msg.content}</code>
                            </pre>

                            {/* Corner time & status inside code block */}
                            <div className="flex items-center justify-end gap-1 pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-400 select-none">
                              <span>{formatBubbleTime(msg.createdAt, msg.time)}</span>
                              {isMe && (
                                <span className="inline-flex items-center">
                                  {msg.status === "sending" ? (
                                    <Loader2 className="h-2.5 w-2.5 animate-spin text-slate-400" />
                                  ) : msg.status === "failed" ? (
                                    <span className="text-rose-400 font-bold">!</span>
                                  ) : (
                                    <CheckCheck className="h-3 w-3 text-primary" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* WhatsApp-style Standard Text Bubble */
                          <div
                            className={`relative rounded-2xl px-3.5 pt-2 pb-2 shadow-2xs break-words min-w-[75px] ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-tr-xs"
                                : "bg-muted/80 text-foreground border border-border/70 rounded-tl-xs"
                            }`}
                          >
                            {/* Message text with right padding for corner timestamp */}
                            <div className="pr-14 text-xs sm:text-sm leading-relaxed">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>

                            {/* WhatsApp-style bottom-right corner time & status */}
                            <div
                              className={`absolute bottom-1 right-2 flex items-center gap-0.5 select-none pointer-events-none text-[10px] ${
                                isMe ? "text-primary-foreground/75" : "text-muted-foreground/80"
                              }`}
                            >
                              <span className="leading-none">{formatBubbleTime(msg.createdAt, msg.time)}</span>
                              {isMe && (
                                <span className="ml-0.5 inline-flex items-center">
                                  {msg.status === "sending" ? (
                                    <Loader2 className="h-2.5 w-2.5 animate-spin text-primary-foreground/80" />
                                  ) : msg.status === "failed" ? (
                                    <span className="text-rose-300 font-bold leading-none">!</span>
                                  ) : (
                                    <CheckCheck className="h-3 w-3 text-emerald-300 dark:text-emerald-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Delete Button on Hover: Author can delete own message; Team Lead can delete ANY message */}
                        {(isMe || isLead) && msg.status !== "sending" && !msg.id.startsWith("temp-") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMessage(msg.id)}
                            className={`absolute top-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity h-6 w-6 rounded-full bg-background/90 hover:bg-destructive/15 text-muted-foreground hover:text-destructive shadow-xs ${
                              isMe ? "-left-7" : "-right-7"
                            }`}
                            title={isMe ? "Delete your message" : "Delete message as Team Lead"}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Live Typing Indicator */}
            {typingUserNames.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic px-2 py-1 bg-background/60 backdrop-blur-xs rounded-lg border border-border/40 w-fit animate-pulse">
                <div className="flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>
                  {typingUserNames.join(", ")} {typingUserNames.length === 1 ? "is" : "are"} typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 3. Rich Message Composer */}
      <div className="p-4 border-t border-border/60 bg-muted/20 space-y-2">
        {/* Mode Selector */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={messageType === "CODE" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMessageType((prev) => (prev === "CODE" ? "TEXT" : "CODE"))}
              className={`h-7 px-2.5 text-[11px] rounded-lg gap-1.5 transition-colors ${
                messageType === "CODE"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{messageType === "CODE" ? "Code Block Active" : "Format as Code"}</span>
            </Button>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-muted-foreground">
            Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
          </span>
        </div>

        {/* Text Input Form */}
        <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
          <div className="relative flex-1 bg-background border border-border/80 rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-2xs">
            <Textarea
              value={content}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                messageType === "CODE"
                  ? "Paste or write code snippet here..."
                  : "Message your team in real time..."
              }
              rows={messageType === "CODE" ? 3 : 1}
              className={`min-h-[44px] max-h-[140px] resize-none border-0 shadow-none focus-visible:ring-0 text-xs sm:text-sm px-3.5 py-2.5 bg-transparent ${
                messageType === "CODE" ? "font-mono text-xs" : ""
              }`}
            />
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!content.trim()}
            className="h-11 w-11 rounded-xl shrink-0 shadow-sm bg-gradient-hero text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
