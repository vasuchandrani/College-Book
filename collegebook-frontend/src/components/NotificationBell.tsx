import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { getUnreadNotificationCount } from "@/lib/api";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    // Initial fetch
    getUnreadNotificationCount().then((res) => {
      setUnread(res.unreadCount || 0);
    }).catch(() => {});

    // Listen for read events from the new NotificationsPage
    const handleNotificationRead = () => {
      setUnread((u) => Math.max(0, u - 1));
    };

    window.addEventListener("cb_notification_read", handleNotificationRead);
    return () => {
      window.removeEventListener("cb_notification_read", handleNotificationRead);
    };
  }, []);

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link to="/notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
    </Button>
  );
}
