import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  Users,
  Code2,
  Trash2,
  CheckCheck,
  Check,
  Circle,
  Sparkles,
  Copy,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { useRoomChat } from "@/hooks/useRoomChat";
import { formatSmartDate } from "@/lib/dateUtils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import FormattedContent from "@/components/FormattedContent";

export interface TeamRoomChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: {
    id: string;
    title: string;
    type?: string;
    kind?: string;
    completed?: boolean;
    leadName?: string;
    leadId?: string;
    members?: any[];
  };
}

export default function TeamRoomChatModal({
  open,
  onOpenChange,
  team,
}: TeamRoomChatModalProps) {
  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState<"TEXT" | "CODE">("TEXT");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("cb_user") || "{}");
    } catch {
      return {};
    }
  })();
  const currentUserId = currentUser?.id || currentUser?.userId;

  const {
    messages,
    loading,
    activeUsers,
    typingUserNames,
    connectionStatus,
    sendMessage,
    sendTyping,
    deleteMessage,
  } = useRoomChat({
    teamId: team?.id,
    enabled: open,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, typingUserNames]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl h-[88vh] max-h-[780px] p-0 flex flex-col gap-0 overflow-hidden bg-card border-border/80 shadow-2xl rounded-2xl">
        {/* 1. Header with Team Info & Active Presence */}
        <div className="px-5 py-4 border-b border-border/60 bg-muted/20 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="font-heading font-semibold text-base truncate text-foreground">
                    {team?.title || "Team Room Chat"}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-semibold px-2 py-0.5 border-primary/30 text-primary shrink-0"
                  >
                    {team?.type || team?.kind || "PROJECT"}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  Private team collaboration room
                </DialogDescription>
              </div>
            </div>

            {/* Connection Status Pill */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-background border border-border/60 shadow-2xs">
                <Circle
                  className={`h-2 w-2 fill-current ${
                    connectionStatus === "CONNECTED"
                      ? "text-emerald-500 fill-emerald-500 animate-pulse"
                      : connectionStatus === "CONNECTING"
                      ? "text-amber-500 fill-amber-500"
                      : "text-rose-500 fill-rose-500"
                  }`}
                />
                <span className="text-[11px] text-muted-foreground">
                  {connectionStatus === "CONNECTED"
                    ? "Live"
                    : connectionStatus === "CONNECTING"
                    ? "Connecting"
                    : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Message History Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-background/50">
          {loading && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Loading room chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2 border border-dashed border-border rounded-xl">
              <MessageSquare className="h-8 w-8 opacity-40 text-primary" />
              <p className="text-sm font-semibold">Welcome to the Team Collaboration Room!</p>
              <p className="text-xs max-w-xs">
                Send messages, share code, or coordinate project tasks in real time.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = Boolean(
                (msg.senderId && currentUserId && String(msg.senderId).toLowerCase() === String(currentUserId).toLowerCase()) ||
                (msg.senderName && (currentUser.name || currentUser.fullName) && (
                  msg.senderName.trim().toLowerCase() === (currentUser.name || "").trim().toLowerCase() ||
                  msg.senderName.trim().toLowerCase() === (currentUser.fullName || "").trim().toLowerCase()
                )) ||
                (msg.senderHandle && currentUser.handle &&
                  msg.senderHandle.replace(/^@/, "").toLowerCase() === currentUser.handle.replace(/^@/, "").toLowerCase()) ||
                (msg.senderHandle && currentUser.username &&
                  msg.senderHandle.replace(/^@/, "").toLowerCase() === currentUser.username.replace(/^@/, "").toLowerCase()) ||
                (msg.senderHandle && currentUser.email &&
                  msg.senderHandle.toLowerCase() === currentUser.email.split("@")[0].toLowerCase())
              );

              const isLead = msg.role === "LEAD";
              const isCode = msg.messageType === "CODE";

              const prevMsg = messages[idx - 1];
              const isSameSenderAsPrev = Boolean(
                prevMsg &&
                (
                  (msg.senderId && prevMsg.senderId && String(msg.senderId).toLowerCase() === String(prevMsg.senderId).toLowerCase()) ||
                  (msg.senderName && prevMsg.senderName && msg.senderName.trim().toLowerCase() === prevMsg.senderName.trim().toLowerCase())
                )
              );

              const isWithin5Min = Boolean(
                isSameSenderAsPrev &&
                prevMsg?.createdAt &&
                msg?.createdAt &&
                Math.abs(new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) <= 5 * 60 * 1000
              );

              const showSenderHeader = !isMine && !isWithin5Min;
              const showAvatar = !isMine && !isWithin5Min;

              const memberAvatar = activeUsers.find((u) =>
                (u.userId && msg.senderId && String(u.userId).toLowerCase() === String(msg.senderId).toLowerCase()) ||
                (u.name && msg.senderName && u.name.trim().toLowerCase() === msg.senderName.trim().toLowerCase()) ||
                (u.handle && msg.senderHandle && u.handle.replace(/^@/, "").toLowerCase() === msg.senderHandle.replace(/^@/, "").toLowerCase())
              )?.avatarUrl;
              const senderAvatar = msg.avatarUrl || memberAvatar;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-2.5 group ${
                    isWithin5Min ? "mt-1" : "mt-3"
                  } ${
                    isMine ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  {!isMine && (
                    showAvatar ? (
                      <Avatar className="h-8 w-8 shrink-0 mt-0.5 ring-1 ring-border/50">
                        <AvatarImage src={senderAvatar} alt={msg.senderName} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          {msg.initials || msg.senderName?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 shrink-0" aria-hidden="true" />
                    )
                  )}

                  {/* Message Bubble Container */}
                  <div
                    className={`flex flex-col max-w-[82%] sm:max-w-[75%] ${
                      isMine ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Author Line */}
                    {showSenderHeader && (
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground/90">
                          {msg.senderName}
                        </span>
                        {isLead && (
                          <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-primary/10 text-primary">
                            Lead
                          </span>
                        )}
                        {msg.collegeShortName && (
                          <span className="text-[10px] text-muted-foreground/70">
                            • {msg.collegeShortName}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative rounded-2xl px-3.5 pt-2 pb-2 text-sm shadow-2xs leading-relaxed break-words min-w-[75px] ${
                        isMine
                          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-xs"
                          : "bg-muted/70 dark:bg-muted/40 text-foreground border border-border/50 rounded-tl-xs"
                      }`}
                    >
                      {isCode ? (
                        <div className="font-mono text-xs my-1 bg-black/30 dark:bg-black/50 p-3 rounded-lg overflow-x-auto text-emerald-300 relative group/code">
                          <button
                            type="button"
                            onClick={() => copyCodeToClipboard(msg.content)}
                            className="absolute top-2 right-2 p-1 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                            title="Copy code"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <pre className="whitespace-pre-wrap font-mono leading-relaxed pb-3">
                            {msg.content}
                          </pre>
                        </div>
                      ) : (
                        <div className="pr-14">
                          <FormattedContent
                            content={msg.content}
                            className={isMine ? "text-primary-foreground" : "text-foreground"}
                          />
                        </div>
                      )}

                      {/* WhatsApp-Style Bottom Right Corner Timestamp & Status */}
                      <div
                        className={`absolute bottom-1 right-2 flex items-center gap-0.5 select-none pointer-events-none text-[10px] ${
                          isMine ? "text-primary-foreground/75" : "text-muted-foreground/80"
                        }`}
                      >
                        <span className="leading-none">{formatBubbleTime(msg.createdAt, msg.time)}</span>
                        {isMine && (
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

                    {/* Delete Message Button on Hover */}
                    {(isMine || currentUser.id === team?.leadId) && (
                      <button
                        type="button"
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground hover:text-destructive mt-0.5 px-1 flex items-center gap-1"
                        title="Delete message"
                      >
                        <Trash2 className="h-2.5 w-2.5" /> Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Typing Indicator Banner */}
        <AnimatePresence>
          {typingUserNames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 py-1.5 text-xs text-muted-foreground bg-muted/20 border-t border-border/40 flex items-center gap-1.5"
            >
              <div className="flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              </div>
              <span className="italic text-[11px]">
                {typingUserNames.join(", ")}{" "}
                {typingUserNames.length === 1 ? "is" : "are"} typing...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. Chat Composer */}
        <div className="p-3.5 sm:p-4 bg-muted/20 border-t border-border/60">
          <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setMessageType((prev) => (prev === "CODE" ? "TEXT" : "CODE"))
                  }
                  className={`h-7 px-2 text-xs gap-1 rounded-md transition-colors ${
                    messageType === "CODE"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  {messageType === "CODE" ? "Code Block Active" : "Code Snippet"}
                </Button>
              </div>
              <span className="text-[11px] text-muted-foreground hidden sm:inline select-none">
                Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
              </span>
            </div>

            <div className="flex items-end gap-2">
              <Textarea
                value={content}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  messageType === "CODE"
                    ? "Paste or write code snippet here..."
                    : "Type a message to your team..."
                }
                rows={1}
                className="min-h-[44px] max-h-[140px] resize-none text-sm py-2.5 rounded-xl border-border bg-background focus-visible:ring-primary"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!content.trim()}
                className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-sm disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
