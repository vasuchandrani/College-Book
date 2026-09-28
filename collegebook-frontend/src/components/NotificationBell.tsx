import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { getUnreadNotificationCount } from "@/lib/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getNotifications, markNotificationRead } from "@/lib/api";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { BellRing, BellOff } from "lucide-react";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const push = usePushNotifications();
  const [isLoadingPush, setIsLoadingPush] = useState(false);

  const handleSubscribe = async () => {
    setIsLoadingPush(true);
    await push.subscribe();
    setIsLoadingPush(false);
  };

  useEffect(() => {
    getUnreadNotificationCount().then((res) => {
      setUnread(res.unreadCount || 0);
    }).catch(() => {});
  }, []);

  const handleOpen = () => {
    getNotifications().then((res) => {
      setNotifications(res.items || []);
    }).catch(() => {});
  };

  const handleRead = (id: string) => {
    markNotificationRead(id).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    });
  };

  return (
    <Popover onOpenChange={(open) => open && handleOpen()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between font-medium">
          <span>Notifications</span>
          {push.isSupported && (
            <>
              {!push.isSubscribed && (
                <Button variant="outline" size="sm" onClick={handleSubscribe} disabled={isLoadingPush} className="h-7 text-xs">
                  {isLoadingPush ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <BellRing className="w-3 h-3 mr-1" />}
                  Enable Push
                </Button>
              )}
            </>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 border-b text-sm cursor-pointer hover:bg-muted/50 ${!n.isRead ? "bg-muted/20 font-medium" : ""}`}
                onClick={() => !n.isRead && handleRead(n.id)}
              >
                {n.message}
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
