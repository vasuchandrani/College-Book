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
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
    </Button>
  );
}
